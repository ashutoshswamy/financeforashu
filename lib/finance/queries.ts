import "server-only"

import { and, desc, eq, gte, lte, sql } from "drizzle-orm"
import { alias } from "drizzle-orm/pg-core"

import { db } from "@/lib/db"
import { accounts, categories, settings, transactions } from "@/lib/db/schema"
import type { Account } from "@/lib/db/schema"

export async function getAccounts(userId: string) {
  return db
    .select()
    .from(accounts)
    .where(eq(accounts.userId, userId))
    .orderBy(accounts.createdAt)
}

export async function getAccountsWithBalances(userId: string) {
  const result = await db.execute<{
    id: string
    name: string
    type: Account["type"]
    currency: string
    initial_balance: string
    net: string
  }>(sql`
    select
      acc.id, acc.name, acc.type, acc.currency, acc.initial_balance,
      coalesce((
        select sum(case
          when t.type = 'income' then t.amount
          when t.type = 'expense' then -t.amount
          when t.type = 'transfer' and t.account_id = acc.id then -t.amount
          when t.type = 'transfer' and t.to_account_id = acc.id then t.amount
          else 0
        end)
        from transactions t
        where t.user_id = ${userId}
        and (t.account_id = acc.id or t.to_account_id = acc.id)
      ), 0) as net
    from accounts acc
    where acc.user_id = ${userId}
    order by acc.created_at
  `)

  return result.rows.map((row) => {
    const initialBalance = Number(row.initial_balance)
    const net = Number(row.net)
    return {
      id: row.id,
      name: row.name,
      type: row.type,
      currency: row.currency,
      initialBalance,
      net,
      balance: initialBalance + net,
    }
  })
}

export async function getCategories(userId: string, type?: "income" | "expense") {
  return db
    .select()
    .from(categories)
    .where(
      type
        ? and(eq(categories.userId, userId), eq(categories.type, type))
        : eq(categories.userId, userId)
    )
    .orderBy(categories.name)
}

export async function getRecentTransactions(userId: string, limit = 8) {
  const toAccounts = alias(accounts, "to_accounts")

  return db
    .select({
      id: transactions.id,
      amount: transactions.amount,
      type: transactions.type,
      description: transactions.description,
      date: transactions.date,
      accountName: accounts.name,
      toAccountName: toAccounts.name,
      categoryName: categories.name,
      categoryColor: categories.color,
    })
    .from(transactions)
    .leftJoin(accounts, eq(transactions.accountId, accounts.id))
    .leftJoin(toAccounts, eq(transactions.toAccountId, toAccounts.id))
    .leftJoin(categories, eq(transactions.categoryId, categories.id))
    .where(eq(transactions.userId, userId))
    .orderBy(sql`${transactions.date} desc nulls last`, desc(transactions.createdAt))
    .limit(limit)
}

export type TransactionFilters = {
  type?: "income" | "expense" | "transfer"
  accountId?: string
  categoryId?: string
  from?: string
  to?: string
  archived?: boolean
}

export async function getTransactions(
  userId: string,
  filters: TransactionFilters = {},
  { limit = 50, offset = 0 }: { limit?: number; offset?: number } = {}
) {
  const conditions = [eq(transactions.userId, userId)]
  if (filters.type) conditions.push(eq(transactions.type, filters.type))
  if (filters.accountId) conditions.push(eq(transactions.accountId, filters.accountId))
  if (filters.categoryId) conditions.push(eq(transactions.categoryId, filters.categoryId))
  if (filters.from) conditions.push(gte(transactions.date, filters.from))
  if (filters.to) conditions.push(lte(transactions.date, filters.to))
  if (filters.archived !== undefined) conditions.push(eq(transactions.archived, filters.archived))

  const toAccounts = alias(accounts, "to_accounts")

  const rows = await db
    .select({
      id: transactions.id,
      amount: transactions.amount,
      type: transactions.type,
      description: transactions.description,
      date: transactions.date,
      notes: transactions.notes,
      archived: transactions.archived,
      accountId: transactions.accountId,
      toAccountId: transactions.toAccountId,
      categoryId: transactions.categoryId,
      accountName: accounts.name,
      toAccountName: toAccounts.name,
      categoryName: categories.name,
      categoryColor: categories.color,
    })
    .from(transactions)
    .leftJoin(accounts, eq(transactions.accountId, accounts.id))
    .leftJoin(toAccounts, eq(transactions.toAccountId, toAccounts.id))
    .leftJoin(categories, eq(transactions.categoryId, categories.id))
    .where(and(...conditions))
    .orderBy(sql`${transactions.date} desc nulls last`, desc(transactions.createdAt))
    .limit(limit)
    .offset(offset)

  return rows
}

export async function getSettings(userId: string) {
  const [row] = await db.select().from(settings).where(eq(settings.userId, userId))
  return row ?? { userId, currency: "USD", createdAt: new Date() }
}

export async function getMonthSummary(userId: string, monthStart: string, monthEnd: string) {
  const [row] = await db
    .select({
      income: sql<number>`coalesce(sum(case when ${transactions.type} = 'income' then ${transactions.amount} else 0 end), 0)`.mapWith(
        Number
      ),
      expense: sql<number>`coalesce(sum(case when ${transactions.type} = 'expense' then ${transactions.amount} else 0 end), 0)`.mapWith(
        Number
      ),
    })
    .from(transactions)
    .where(
      and(
        eq(transactions.userId, userId),
        gte(transactions.date, monthStart),
        lte(transactions.date, monthEnd)
      )
    )

  return row ?? { income: 0, expense: 0 }
}

export async function getSpendingByCategory(
  userId: string,
  from: string,
  to: string
) {
  return db
    .select({
      categoryId: categories.id,
      name: categories.name,
      color: categories.color,
      total: sql<number>`sum(${transactions.amount})`.mapWith(Number),
    })
    .from(transactions)
    .innerJoin(categories, eq(transactions.categoryId, categories.id))
    .where(
      and(
        eq(transactions.userId, userId),
        eq(transactions.type, "expense"),
        gte(transactions.date, from),
        lte(transactions.date, to)
      )
    )
    .groupBy(categories.id)
    .orderBy(desc(sql`sum(${transactions.amount})`))
}

export async function getMonthlyTrend(userId: string, from: string) {
  return db
    .select({
      month: sql<string>`to_char(date_trunc('month', ${transactions.date}), 'YYYY-MM-DD')`,
      income: sql<number>`coalesce(sum(case when ${transactions.type} = 'income' then ${transactions.amount} else 0 end), 0)`.mapWith(
        Number
      ),
      expense: sql<number>`coalesce(sum(case when ${transactions.type} = 'expense' then ${transactions.amount} else 0 end), 0)`.mapWith(
        Number
      ),
    })
    .from(transactions)
    .where(and(eq(transactions.userId, userId), gte(transactions.date, from)))
    .groupBy(sql`date_trunc('month', ${transactions.date})`)
    .orderBy(sql`date_trunc('month', ${transactions.date})`)
}

export async function getBudgetProgress(userId: string, month: string) {
  const monthEnd = new Date(month)
  monthEnd.setMonth(monthEnd.getMonth() + 1)
  monthEnd.setDate(0)
  const monthEndStr = monthEnd.toISOString().slice(0, 10)

  const result = await db.execute<{
    id: string
    category_id: string
    category_name: string
    color: string
    budget_amount: string
    spent: string
  }>(sql`
    select
      b.id, b.category_id, c.name as category_name, c.color, b.amount as budget_amount,
      coalesce((
        select sum(t.amount) from transactions t
        where t.category_id = b.category_id
        and t.user_id = ${userId}
        and t.type = 'expense'
        and t.date >= ${month}
        and t.date <= ${monthEndStr}
      ), 0) as spent
    from budgets b
    inner join categories c on c.id = b.category_id
    where b.user_id = ${userId} and b.month = ${month}
    order by c.name
  `)

  return result.rows.map((row) => ({
    id: row.id,
    categoryId: row.category_id,
    categoryName: row.category_name,
    color: row.color,
    budgetAmount: Number(row.budget_amount),
    spent: Number(row.spent),
  }))
}

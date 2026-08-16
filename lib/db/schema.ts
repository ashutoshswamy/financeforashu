import {
  pgTable,
  text,
  timestamp,
  numeric,
  date,
  uuid,
  pgEnum,
  uniqueIndex,
  boolean,
} from "drizzle-orm/pg-core"

export const accountTypeEnum = pgEnum("account_type", [
  "cash",
  "bank",
  "credit",
  "investment",
])

export const categoryTypeEnum = pgEnum("category_type", ["income", "expense"])

export const transactionTypeEnum = pgEnum("transaction_type", [
  "income",
  "expense",
  "transfer",
])

export const accounts = pgTable("accounts", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: text("user_id").notNull(),
  name: text("name").notNull(),
  type: accountTypeEnum("type").notNull().default("bank"),
  currency: text("currency").notNull().default("USD"),
  initialBalance: numeric("initial_balance", {
    precision: 14,
    scale: 2,
    mode: "number",
  })
    .notNull()
    .default(0),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
})

export const categories = pgTable("categories", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: text("user_id").notNull(),
  name: text("name").notNull(),
  type: categoryTypeEnum("type").notNull(),
  color: text("color").notNull().default("#6366f1"),
  icon: text("icon"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
})

export const transactions = pgTable("transactions", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: text("user_id").notNull(),
  accountId: uuid("account_id").references(() => accounts.id, {
    onDelete: "cascade",
  }),
  toAccountId: uuid("to_account_id").references(() => accounts.id, {
    onDelete: "cascade",
  }),
  categoryId: uuid("category_id").references(() => categories.id, {
    onDelete: "set null",
  }),
  type: transactionTypeEnum("type").notNull(),
  amount: numeric("amount", { precision: 14, scale: 2, mode: "number" }).notNull(),
  description: text("description").notNull(),
  date: date("date"),
  notes: text("notes"),
  archived: boolean("archived").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
})

export const budgets = pgTable(
  "budgets",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: text("user_id").notNull(),
    categoryId: uuid("category_id")
      .notNull()
      .references(() => categories.id, { onDelete: "cascade" }),
    month: date("month").notNull(),
    amount: numeric("amount", { precision: 14, scale: 2, mode: "number" }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [uniqueIndex("budgets_user_category_month_idx").on(table.userId, table.categoryId, table.month)]
)

export const settings = pgTable("settings", {
  userId: text("user_id").primaryKey(),
  currency: text("currency").notNull().default("USD"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
})

export type Account = typeof accounts.$inferSelect
export type NewAccount = typeof accounts.$inferInsert
export type Category = typeof categories.$inferSelect
export type NewCategory = typeof categories.$inferInsert
export type Transaction = typeof transactions.$inferSelect
export type NewTransaction = typeof transactions.$inferInsert
export type Budget = typeof budgets.$inferSelect
export type NewBudget = typeof budgets.$inferInsert
export type Settings = typeof settings.$inferSelect

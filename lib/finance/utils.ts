export const CURRENCIES = [
  "USD",
  "EUR",
  "GBP",
  "INR",
  "JPY",
  "CAD",
  "AUD",
  "CHF",
  "CNY",
  "SGD",
] as const

export function formatCurrency(amount: number, currency = "USD") {
  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
      maximumFractionDigits: 2,
    }).format(amount)
  } catch {
    return `${currency} ${amount.toFixed(2)}`
  }
}

export function monthLabel(monthDate: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    year: "numeric",
  }).format(new Date(`${monthDate}T00:00:00`))
}

export function firstOfMonth(date = new Date()) {
  return new Date(date.getFullYear(), date.getMonth(), 1)
    .toISOString()
    .slice(0, 10)
}

export function monthsAgo(n: number) {
  const d = new Date()
  d.setDate(1)
  d.setMonth(d.getMonth() - n)
  return d.toISOString().slice(0, 10)
}

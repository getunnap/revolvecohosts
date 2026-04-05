/** Next calendar date that is the 1st of a month (monthly plans bill on the 1st). */
export function getNextMonthlyBillDate(from: Date = new Date()): Date {
  return new Date(from.getFullYear(), from.getMonth() + 1, 1);
}

export function formatBillDate(d: Date, locale = "en-GB"): string {
  return d.toLocaleDateString(locale, {
    weekday: "short",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

const naira = new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN" });

export function formatNaira(kobo: number): string {
  return naira.format(kobo / 100);
}

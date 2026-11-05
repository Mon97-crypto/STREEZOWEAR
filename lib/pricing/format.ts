/** All money is integer paise. Never use floats for amounts. */
export function formatINR(paise: number): string {
  const rupees = paise / 100;
  return "₹" + rupees.toLocaleString("en-IN", { minimumFractionDigits: rupees % 1 ? 2 : 0, maximumFractionDigits: 2 });
}

export const rupees = (n: number) => Math.round(n * 100);

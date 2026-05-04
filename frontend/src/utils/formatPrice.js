/**
 * Formats a numeric price into Indian Rupee notation (e.g. ₹150 or ₹150.50).
 * Avoids trailing decimals when amount has zero paise.
 */
export function formatPrice(amount) {
  const num = Number(amount) || 0;
  const hasPaise = num % 1 !== 0;
  const formatted = new Intl.NumberFormat("en-IN", {
    minimumFractionDigits: hasPaise ? 2 : 0,
    maximumFractionDigits: 2,
  }).format(num);

  return `₹${formatted}`;
}

export default formatPrice;

export type PriceInput = { regularPrice: number; salePrice?: number | null; saleStart?: Date | string | null; saleEnd?: Date | string | null };
export function priceFor(product: PriceInput, variant?: { regularPrice?: number | null; salePrice?: number | null } | null, now = new Date()) {
  const regular = variant?.regularPrice ?? product.regularPrice;
  const sale = variant?.salePrice ?? (variant?.regularPrice != null ? null : product.salePrice);
  const active = (!product.saleStart || new Date(product.saleStart) <= now) && (!product.saleEnd || new Date(product.saleEnd) >= now);
  const current = active && sale != null && sale < regular ? sale : regular;
  return { regular, current, percentage: regular > 0 ? Math.round((1 - current / regular) * 100) : 0 };
}
export function money(paisa: number) {
  return `₨ ${new Intl.NumberFormat("en-PK", { maximumFractionDigits: 2 }).format(paisa / 100)}`;
}
export function inStock(inventory?: { available: boolean; quantity: number; allowBackorders: boolean } | null, quantity = 1) {
  return !!inventory?.available && (inventory.allowBackorders || inventory.quantity >= quantity);
}

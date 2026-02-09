/**
 * Slugify product name for URL: lowercase, hyphens, alphanumeric only.
 * Max length to keep URLs readable.
 */
const SLUG_MAX_LENGTH = 80;

export function slugify(text: string): string {
  if (!text || typeof text !== 'string') return '';
  return text
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, SLUG_MAX_LENGTH);
}

/** MongoDB ObjectId is 24 hex characters */
const OBJECT_ID_LENGTH = 24;
const OBJECT_ID_REGEX = /^[a-f0-9]{24}$/i;

/**
 * Parse product URL param. Supports:
 * - "6985c41d6394c7bed3f7d52d" (id only)
 * - "usb-c-adapter-6985c41d6394c7bed3f7d52d" (slug-id)
 * Returns the product id to fetch.
 */
export function parseProductSlugId(param: string): string {
  if (!param) return '';
  const trimmed = param.trim();
  if (OBJECT_ID_REGEX.test(trimmed)) return trimmed;
  if (trimmed.length > OBJECT_ID_LENGTH) {
    const id = trimmed.slice(-OBJECT_ID_LENGTH);
    if (OBJECT_ID_REGEX.test(id)) return id;
  }
  return trimmed;
}

/**
 * Build product page URL with product name in path for SEO and URL bar.
 * Format: /product/product-name-{id}
 */
export function getProductUrl(product: { _id: string; itemName: string }): string {
  const slug = slugify(product.itemName);
  const id = product._id || '';
  if (!id) return '/product/';
  if (!slug) return `/product/${id}`;
  return `/product/${slug}-${id}`;
}

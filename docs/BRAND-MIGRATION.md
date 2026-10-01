# Zalmi brand and media cleanup

The storefront and administration interface use the **Zalmi** identity and the public URL `https://zalmi.pk/`.

## Applied

- Replaced customer-facing brand copy, logo, favicon, metadata, canonical URLs, Open Graph data, Twitter cards, organization schema, product brand schema, and seller schema.
- Removed the unused Zarshal logo file and its database media record.
- Moved retained media from `/images/zarshal/` to the neutral `/images/catalog/` path and migrated database references without changing gallery order.
- Renamed the two remaining branded local filenames to `handmade-promotion.webp` and `store-review-photo.jpg`.
- Added semantic brand tokens based on the Zalmi palette: orange `#FA8019`, brown `#92542A`, taupe `#B7A494`, charcoal `#2B2B2B`, and green `#2DB742`.
- Migrated existing brand-owned database content field by field with `scripts/rebrand-zalmi.ts`.
- Kept product names, prices, inventory, variants, category structure, orders, customers, and authentic review text unchanged.

## Clean image replacements

Clean supplied originals now replace the eight Peshawari Chappal product photos that used the legacy gray/gold background. The replacements are stored under `/products/takidar/` and `/products/zalmi/` as optimized WebP files. Each matched product now has a multi-angle gallery, with the primary image first.

The old interface logo was also removed and replaced by `/images/zalmi-logo.png`; this is a UI asset replacement rather than a product-image replacement.

## Images still requiring clean replacements

The following files contain the legacy pale gray/gold brand motif. No clean duplicate, gallery variant, larger clean source, or matching alternate hash was found locally. They remain unchanged as required.

| Product or placement | Current file | Displayed in |
| --- | --- | --- |
| Imran Khan 804 Woolen Shawl | `/images/catalog/imran-khan-804-woolen-shawl.jpg` | Product card and product page |
| Black Plain 100% Acrylic Men Shawl | `/images/catalog/black-plain-100-acrylic-men-shawl.jpg` | Product card and product page |
| Off-White 48 Pure Australian Woolen Shawl with Frame Border | `/images/catalog/off-white-48-pure-australian-woolen-shawl-with-frame-border.jpg` | Product card and product page |
| Ivory Cream 48 Pure Australian Woolen Shawl with Frame Border | `/images/catalog/ivory-cream-48-pure-australian-woolen-shawl-with-frame-border.jpg` | Product card and product page |
| Slippers category | `/images/catalog/handmade-slippers-collection.jpg` | Homepage category grid and category presentation |
| Benefits feature | `/images/catalog/black-double-gear-takidar-t-shape-peshawari-chappal.jpg` | Homepage benefits section |

## Intentional internal identifiers

- `data/zarshal-products.json`, `data/zarshal-reviews.json`, and `data/zarshal-assets.json` are historical import filenames. The source URLs in the asset manifest record provenance and are not rendered.
- `zarshal_session`, `zarshal-cart`, and `zarshal-checkout-*` remain private cookie/browser-storage identifiers so active sessions, carts, and checkout retries survive the rebrand.
- `scripts/rebrand-zalmi.ts` necessarily contains the legacy search terms it migrates.
- The local database username/database name and package workspace name remain internal development identifiers.
- Old construction scripts and architecture notes contain historical migration strings and are not part of the running application.

## Validation

- TypeScript: passed
- ESLint: passed
- Next.js production build: passed
- Automated test command: passed (the repository currently contains no test cases)
- Storefront viewport checks: 375, 430, 768, 1024, 1280, 1440, and 1920 px
- Checked for console errors, horizontal overflow, broken images, visible legacy text, old logo references, and correct canonical URL

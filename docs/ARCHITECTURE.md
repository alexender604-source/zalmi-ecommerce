# Zarshal application migration

## Baseline

Next.js 16 App Router, React 19, TypeScript, Tailwind 4. The homepage composes presentational components in `components/`. Products/reviews/assets are JSON imports under `data/`; navigation, trust cards, benefits, SEO text, contact information and banners are embedded in JSX. There is no database, authentication, cart or order processing. Local images live in `public/images/zarshal`.

## Target

- PostgreSQL + Prisma relational data model and versioned SQL migrations.
- Server Components query services in `lib/`; client components handle cart, forms and selectors only.
- Original homepage composition/styles retained, with section configuration and selections in the database. The original JSON files become seed input only.
- Opaque, hashed, database-backed admin sessions; scrypt password hashes; server-side role checks and same-origin mutation checks.
- Integer paisa money amounts. Checkout recalculates catalog prices, dated sales, coupons and shipping on the server. Serializable transactions protect inventory and coupon usage; idempotency keys prevent duplicate orders.
- Guest cart in local storage contains product/variant IDs and quantities. Private order confirmation requires a random access token.
- Admin catalog, sales, content, media and settings screens share validated server APIs. No arbitrary model access.
- Local uploads for development, Cloudinary when configured. Image bytes never enter PostgreSQL.
- Local PostgreSQL helper is development-only; production uses a managed PostgreSQL URL and persistent/object storage.

## Migration safety

Seed inserts missing content without overwriting admin changes. Existing image assets and seed JSON remain available. No database reset or destructive migration is required.

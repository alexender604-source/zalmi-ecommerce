import { PrismaClient, Prisma } from '@prisma/client';
import { statSync } from 'node:fs';

const db = new PrismaClient();
const brandText = (value: string) => value
  .replace(/Zarshal/g, 'Zalmi')
  .replace(/zarshal\.online/g, 'zalmi.pk')
  .replaceAll('â€™', '’')
  .replaceAll('â€”', '—')
  .replaceAll('/images/zarshal/', '/images/catalog/')
  .replaceAll('zarshal-handmade-promotion.webp', 'handmade-promotion.webp')
  .replaceAll('zarshal-store.jpg', 'store-review-photo.jpg');

function brandJson(value: Prisma.JsonValue): Prisma.InputJsonValue {
  if (typeof value === 'string') return brandText(value);
  if (Array.isArray(value)) return value.map(brandJson);
  if (value && typeof value === 'object') {
    return Object.fromEntries(Object.entries(value).map(([key, entry]) => [key, brandJson(entry as Prisma.JsonValue)]));
  }
  return value as Prisma.InputJsonValue;
}

async function main() {
  const stored = await db.storeSetting.findUnique({ where: { key: 'store' } });
  const previous = stored?.value && typeof stored.value === 'object' && !Array.isArray(stored.value)
    ? stored.value as Record<string, Prisma.JsonValue>
    : {};
  const settings: Prisma.InputJsonObject = {
    ...previous,
    storeName: 'Zalmi',
    logo: '/images/zalmi-logo.png',
    favicon: '/zalmi-icon.png',
    description: "Zalmi offers handmade Peshawari chappals, traditional footwear, Khaddar, men's shawls and other Pakistani men's fashion products.",
    copyright: '© 2026 Zalmi. All rights reserved.',
  };
  await db.storeSetting.upsert({ where: { key: 'store' }, update: { value: settings }, create: { key: 'store', value: settings } });

  await db.banner.updateMany({ where: { key: 'hero' }, data: { eyebrow: 'Zalmi Collection', description: 'Discover handmade Peshawari chappals, traditional footwear, Khaddar, men’s shawls and Pakistani men’s fashion rooted in regional craftsmanship.', image: '/images/catalog/heritage-collection-banner.jpeg', imageAlt: 'Zalmi handmade chappals, shawls, khaddar and pakols' } });
  await db.banner.updateMany({ where: { key: 'promo' }, data: { title: 'Keep calm & wear Zalmi handmade', eyebrow: 'A Zalmi Thing', description: 'Explore traditional leather footwear crafted for comfort, character and everyday wear.', image: '/images/catalog/handmade-promotion.webp', imageAlt: 'Traditional Zalmi leather craftsmanship' } });

  for (const section of await db.homepageSection.findMany()) {
    await db.homepageSection.update({ where: { id: section.id }, data: { title: brandText(section.title), config: brandJson(section.config) } });
  }
  await db.homepageSection.updateMany({ where: { key: 'whatsapp' }, data: { config: { description: 'Chat with the Zalmi team for product details, sizing help or order support.', buttonLabel: 'Order on WhatsApp' } } });

  for (const product of await db.product.findMany()) {
    await db.product.update({ where: { id: product.id }, data: {
      name: brandText(product.name), shortDescription: brandText(product.shortDescription), description: brandText(product.description),
      seoTitle: brandText(product.seoTitle), metaDescription: brandText(product.metaDescription), canonicalUrl: brandText(product.canonicalUrl),
      ogTitle: brandText(product.ogTitle), ogDescription: brandText(product.ogDescription), ogImage: brandText(product.ogImage),
    } });
  }
  for (const image of await db.productImage.findMany()) await db.productImage.update({ where: { id: image.id }, data: { url: brandText(image.url), alt: brandText(image.alt) } });
  for (const variant of await db.productVariant.findMany()) await db.productVariant.update({ where: { id: variant.id }, data: { image: brandText(variant.image) } });
  for (const category of await db.category.findMany()) {
    await db.category.update({ where: { id: category.id }, data: {
      name: brandText(category.name), description: brandText(category.description), seoTitle: brandText(category.seoTitle),
      image: brandText(category.image), banner: brandText(category.banner), metaDescription: brandText(category.metaDescription), canonicalUrl: brandText(category.canonicalUrl), ogTitle: brandText(category.ogTitle), ogDescription: brandText(category.ogDescription), ogImage: brandText(category.ogImage),
    } });
  }
  for (const page of await db.page.findMany()) {
    await db.page.update({ where: { id: page.id }, data: {
      title: brandText(page.title), content: brandText(page.content), seoTitle: brandText(page.seoTitle), metaDescription: brandText(page.metaDescription),
      canonicalUrl: brandText(page.canonicalUrl), ogTitle: brandText(page.ogTitle), ogDescription: brandText(page.ogDescription),
    } });
  }
  for (const post of await db.blogPost.findMany()) {
    await db.blogPost.update({ where: { id: post.id }, data: {
      title: brandText(post.title), excerpt: brandText(post.excerpt), content: brandText(post.content), author: brandText(post.author),
      seoTitle: brandText(post.seoTitle), metaDescription: brandText(post.metaDescription), canonicalUrl: brandText(post.canonicalUrl), ogTitle: brandText(post.ogTitle), ogDescription: brandText(post.ogDescription),
    } });
  }
  for (const item of await db.navigationItem.findMany()) {
    await db.navigationItem.update({ where: { id: item.id }, data: { label: brandText(item.label), url: brandText(item.url) } });
  }

  for (const review of await db.review.findMany()) await db.review.update({ where: { id: review.id }, data: { avatar: brandText(review.avatar) } });
  await db.media.deleteMany({ where: { url: { endsWith: '/zarshal-logo.png' } } });
  for (const asset of await db.media.findMany()) {
    await db.media.update({ where: { id: asset.id }, data: { url: brandText(asset.url), alt: brandText(asset.alt), filename: brandText(asset.filename) } });
  }

  const media = [
    { url: '/images/zalmi-logo.png', alt: 'Zalmi', filename: 'zalmi-logo.png', mimeType: 'image/png' },
    { url: '/zalmi-icon.png', alt: 'Zalmi icon', filename: 'zalmi-icon.png', mimeType: 'image/png' },
  ];
  for (const asset of media) {
    await db.media.upsert({ where: { url: asset.url }, update: { alt: asset.alt }, create: { ...asset, size: statSync(`public${asset.url}`).size } });
  }
  console.log('Zalmi brand migration completed. Customer reviews and retained photography were unchanged.');
}

main().catch((error) => { console.error(error); process.exitCode = 1; }).finally(() => db.$disconnect());

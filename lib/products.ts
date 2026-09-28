import { Prisma } from "@prisma/client";
import { db } from "./db";
import { descendantIds } from "./categories";
import { priceFor, inStock } from "./pricing";
import { z } from "zod";
export const productInclude={images:{orderBy:{sortOrder:"asc" as const}},inventory:true,variants:{include:{inventory:true}},categories:{include:{category:true}}} satisfies Prisma.ProductInclude;
export type CatalogProduct=Prisma.ProductGetPayload<{include:typeof productInclude}>;
export const productCard=(p:CatalogProduct)=>({id:p.id,name:p.name,slug:p.slug,image:p.images[0]?.url||"",imageAlt:p.images[0]?.alt||p.name,...priceFor(p),available:p.productType==="VARIABLE"?p.variants.some(v=>v.active&&inStock(v.inventory)):inStock(p.inventory),badge:p.newArrival?"New":p.bestseller?"Best Seller":p.featured?"Featured":""});
export type ProductCard=ReturnType<typeof productCard>;
const filtersSchema=z.object({q:z.string().max(150).catch(""),page:z.coerce.number().int().min(1).max(10000).catch(1),sort:z.enum(["newest","price-low","price-high","featured"]).catch("newest"),min:z.coerce.number().min(0).max(1000000).optional().catch(undefined),max:z.coerce.number().min(0).max(1000000).optional().catch(undefined),availability:z.enum(["in-stock",""]).catch(""),size:z.string().max(50).catch(""),color:z.string().max(50).catch(""),category:z.string().max(160).catch("")});
export async function listProducts(raw:Record<string,string|undefined>,categoryId?:string){
  const f=filtersSchema.parse(raw);const take=12;
  if(!categoryId&&f.category)categoryId=(await db.category.findFirst({where:{slug:f.category,active:true}}))?.id;
  const categoryIds=categoryId?await descendantIds(categoryId):[];
  const current=Prisma.sql`CASE WHEN p."salePrice" IS NOT NULL AND (p."saleStart" IS NULL OR p."saleStart" <= NOW()) AND (p."saleEnd" IS NULL OR p."saleEnd" >= NOW()) THEN p."salePrice" ELSE p."regularPrice" END`;
  const conditions=[Prisma.sql`p.status = 'PUBLISHED'`];
  if(f.q)conditions.push(Prisma.sql`(p.name ILIKE ${'%'+f.q+'%'} OR p.sku ILIKE ${'%'+f.q+'%'})`);
  if(categoryIds.length)conditions.push(Prisma.sql`EXISTS(SELECT 1 FROM "ProductCategory" pc WHERE pc."productId"=p.id AND pc."categoryId" IN (${Prisma.join(categoryIds)}))`);
  if(f.min!=null)conditions.push(Prisma.sql`${current} >= ${Math.round(f.min*100)}`);
  if(f.max!=null)conditions.push(Prisma.sql`${current} <= ${Math.round(f.max*100)}`);
  if(f.size||f.color)conditions.push(Prisma.sql`EXISTS(SELECT 1 FROM "ProductVariant" v WHERE v."productId"=p.id AND v.active=true ${f.size?Prisma.sql`AND v.size=${f.size}`:Prisma.empty} ${f.color?Prisma.sql`AND v.color=${f.color}`:Prisma.empty})`);
  if(f.availability)conditions.push(Prisma.sql`EXISTS(SELECT 1 FROM "Inventory" i LEFT JOIN "ProductVariant" v ON v.id=i."variantId" WHERE (i."productId"=p.id AND p."productType"='SIMPLE' OR v."productId"=p.id AND v.active=true AND p."productType"='VARIABLE') AND i.available=true AND (i.quantity>0 OR i."allowBackorders"=true))`);
  const where=Prisma.join(conditions,' AND ');const order=f.sort==='price-low'?Prisma.sql`${current} ASC`:f.sort==='price-high'?Prisma.sql`${current} DESC`:f.sort==='featured'?Prisma.sql`p.featured DESC, p."createdAt" DESC`:Prisma.sql`p."createdAt" DESC`;
  const [rows,count]=await Promise.all([db.$queryRaw<{id:string}[]>(Prisma.sql`SELECT p.id FROM "Product" p WHERE ${where} ORDER BY ${order}, p.id LIMIT ${take} OFFSET ${(f.page-1)*take}`),db.$queryRaw<{count:bigint}[]>(Prisma.sql`SELECT COUNT(*) FROM "Product" p WHERE ${where}`)]);
  const products=await db.product.findMany({where:{id:{in:rows.map(r=>r.id)}},include:productInclude});
  return {products:rows.map(r=>productCard(products.find(p=>p.id===r.id)!)),total:Number(count[0].count),page:f.page,pages:Math.ceil(Number(count[0].count)/take),filters:f};
}
export const getProduct=(slug:string)=>db.product.findFirst({where:{slug,status:"PUBLISHED"},include:{...productInclude,reviews:{where:{approved:true},take:20,orderBy:{date:"desc"}}}});

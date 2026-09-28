import { z } from "zod";

export const text = z.string().trim().max(2000);
export const longText = z.string().trim().max(100000);
export const id = z.string().min(1).max(100);
export const slug = z.string().min(1).max(160).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Use lowercase letters, numbers and hyphens");
export const url = z.string().max(2000).refine(v => !v || /^\/(?!\/)[^\\]*$/.test(v) || /^https:\/\/[^\s]+$/.test(v), "Use a local path or HTTPS URL");
export const date = z.preprocess(v => v === "" || v == null ? null : v, z.coerce.date().nullable());
export const amount = z.number().int().min(0).max(100000000);
export const nullableAmount = amount.nullable();
const seo = { seoTitle: text.default(""), metaDescription: text.default(""), canonicalUrl: url.default(""), ogTitle: text.default(""), ogDescription: text.default(""), ogImage: url.default(""), noindex: z.boolean().default(false) };
const status = z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]);
export const inventorySchema = z.object({ quantity: z.number().int().min(0).max(1000000), lowStock: z.number().int().min(0).max(1000000).default(5), allowBackorders: z.boolean().default(false), available: z.boolean().default(true) });
export const variantSchema = z.object({ id: id.optional(), sku: text.min(1), size: text.default(""), color: text.default(""), regularPrice: nullableAmount.default(null), salePrice: nullableAmount.default(null), image: url.default(""), active: z.boolean().default(true), inventory: inventorySchema }).refine(v => v.salePrice == null || v.regularPrice == null || v.salePrice < v.regularPrice, {message:"Variant sale must be below regular price",path:["salePrice"]});
export const productSchema = z.object({
  name: text.min(1), slug, sku: text.min(1), shortDescription: text.default(""), description: longText.default(""), care: longText.default(""), regularPrice: amount, salePrice: nullableAmount.default(null), costPrice: nullableAmount.default(null), saleStart: date, saleEnd: date, status: status.default("DRAFT"), featured: z.boolean().default(false), bestseller: z.boolean().default(false), newArrival: z.boolean().default(false), tags: z.array(text).max(50).default([]), material: text.default(""), soleType: text.default(""), style: text.default(""), gender: text.default("Men"), productType: z.enum(["SIMPLE", "VARIABLE"]).default("SIMPLE"), weight: z.number().min(0).nullable().default(null), dimensions: text.default(""), ...seo,
  categoryIds: z.array(id).max(30), images: z.array(z.object({ url: url.refine(Boolean, "Image URL is required"), alt: text.default(""), sortOrder: z.number().int().default(0) })).max(30), inventory: inventorySchema, variants: z.array(variantSchema).max(100).default([])
}).superRefine((v,c)=>{
  if(v.salePrice != null && v.salePrice >= v.regularPrice)c.addIssue({code:"custom",path:["salePrice"],message:"Sale price must be below regular price"});
  if(v.saleStart && v.saleEnd && v.saleEnd < v.saleStart)c.addIssue({code:"custom",path:["saleEnd"],message:"Sale end must follow start"});
  if(v.productType === "VARIABLE" && !v.variants.length)c.addIssue({code:"custom",path:["variants"],message:"Add at least one variant"});
  if(v.productType === "SIMPLE" && v.variants.length)c.addIssue({code:"custom",path:["productType"],message:"Choose VARIABLE for products with variants"});
  if(new Set(v.variants.map(x=>x.size+'|'+x.color)).size !== v.variants.length)c.addIssue({code:"custom",path:["variants"],message:"Size/color combinations must be unique"});
});
export const categorySchema = z.object({name:text.min(1),slug,parentId:id.nullable().default(null),description:longText.default(""),image:url.default(""),banner:url.default(""),sortOrder:z.number().int().default(0),active:z.boolean().default(true),...seo});
export const reviewSchema = z.object({name:text.min(1),productId:id.nullable().default(null),rating:z.number().int().min(1).max(5),content:longText.min(1),source:text.default("Store"),avatar:url.default(""),approved:z.boolean().default(false),featured:z.boolean().default(false),date:z.coerce.date()});
export const pageSchema = z.object({title:text.min(1),slug,content:longText,status,...seo});
export const blogSchema = pageSchema.extend({excerpt:text.default(""),image:url.default(""),author:text.min(1),category:text.default(""),publishedAt:date});
export const bannerSchema = z.object({key:slug,title:text.min(1),eyebrow:text.default(""),description:text.default(""),image:url.refine(Boolean),imageAlt:text.default(""),buttonLabel:text.default(""),buttonUrl:url.default("/shop"),active:z.boolean().default(true)});
export const cardSchema = z.object({title:text,text:longText,icon:z.enum(["Truck","RefreshCw","Headphones","ShieldCheck","BadgePercent","CheckCircle2","Gift"]).default("ShieldCheck")});
export const sectionConfigSchema = z.object({eyebrow:text.optional(),description:longText.optional(),bannerKey:text.optional(),categorySlug:slug.optional(),productIds:z.array(id).max(24).optional(),categoryIds:z.array(id).max(24).optional(),reviewIds:z.array(id).max(24).optional(),featured:z.boolean().optional(),limit:z.number().int().min(1).max(24).optional(),image:url.optional(),buttonLabel:text.optional(),buttonUrl:url.optional(),items:z.array(cardSchema).max(30).optional(),blocks:z.array(z.object({title:text,content:longText})).max(30).optional()});
export const sectionSchema = z.object({key:slug,title:text,type:z.enum(["HERO","TRUST","HERITAGE","PRODUCTS","CATEGORIES","PROMO","BENEFITS","REVIEWS","WHATSAPP","SEO"]),active:z.boolean(),sortOrder:z.number().int(),config:sectionConfigSchema});
export const navigationSchema = z.object({label:text.min(1),url:url.default(""),categoryId:id.nullable().default(null),parentId:id.nullable().default(null),location:z.enum(["MAIN","FOOTER","SOCIAL"]),sortOrder:z.number().int(),visible:z.boolean()});
export const couponSchema = z.object({code:z.string().trim().toUpperCase().min(2).max(40).regex(/^[A-Z0-9-]+$/),type:z.enum(["PERCENTAGE","FIXED"]),amount,minimumOrder:amount,maximumDiscount:nullableAmount,startDate:date,expiryDate:date,usageLimit:z.number().int().min(1).nullable(),active:z.boolean()}).superRefine((v,c)=>{if(v.type==="PERCENTAGE"&&v.amount>100)c.addIssue({code:"custom",path:["amount"],message:"Percentage cannot exceed 100"});if(v.startDate&&v.expiryDate&&v.startDate>v.expiryDate)c.addIssue({code:"custom",path:["expiryDate"],message:"Expiry must follow start"});});
export const settingsSchema = z.object({storeName:text.min(1),logo:url,favicon:url,phone:text,email:z.union([z.email(),z.literal("")]),whatsapp:z.string().regex(/^\+?[0-9]{8,15}$/),address:text,description:longText,currency:z.literal("PKR"),announcement:text,copyright:text,freeShipping:z.boolean(),shippingFee:amount,freeShippingThreshold:nullableAmount,facebook:url,instagram:url,tiktok:url,youtube:url});
export const userSchema = z.object({name:text.min(1),email:z.email().toLowerCase(),password:z.string().min(12).max(200).optional().or(z.literal("")),role:z.enum(["SUPER_ADMIN","ADMIN","EDITOR","ORDER_MANAGER"]),active:z.boolean()});
export const cartSchema = z.object({items:z.array(z.object({productId:id,variantId:id.nullable().optional(),quantity:z.number().int().min(1).max(99)})).min(1).max(100),coupon:z.string().trim().max(40).default("")});
export const checkoutSchema = cartSchema.extend({idempotencyKey:z.uuid(),accessToken:z.string().regex(/^[a-f0-9]{64}$/),name:text.min(2),phone:z.string().trim().regex(/^\+?[0-9 ()-]{10,20}$/),email:z.union([z.email(),z.literal("")]).default(""),province:text.min(2),city:text.min(2),address:text.min(8),postalCode:text.default(""),notes:text.default("")});
export const orderUpdateSchema = z.object({status:z.enum(["PENDING","CONFIRMED","PROCESSING","SHIPPED","DELIVERED","CANCELLED","RETURNED","REFUNDED"]),paymentStatus:z.enum(["PENDING","PAID","FAILED","REFUNDED"]),internalNotes:longText});
export type SectionConfig = z.infer<typeof sectionConfigSchema>;
export type StoreSettings = z.infer<typeof settingsSchema>;

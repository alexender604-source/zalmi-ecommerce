import { Prisma } from '@prisma/client';
import { db } from './db';
import { resources } from './admin-resources';
import * as v from './validation';
import { productInclude } from './products';
import { HttpError } from './auth';
import { hashPassword } from './password';
import { updateOrder } from './orders';
import { z } from 'zod';
type Row=Record<string,unknown>;
type Delegate={findMany:(args:Row)=>Promise<Row[]>;findUnique:(args:Row)=>Promise<Row|null>;count:(args:Row)=>Promise<number>;create:(args:Row)=>Promise<Row>;update:(args:Row)=>Promise<Row>;delete:(args:Row)=>Promise<Row>};
const delegates:Record<string,unknown>={products:db.product,categories:db.category,inventory:db.inventory,orders:db.order,customers:db.customer,coupons:db.coupon,homepage:db.homepageSection,banners:db.banner,reviews:db.review,pages:db.page,blog:db.blogPost,navigation:db.navigationItem,media:db.media,users:db.user};
const delegate=(resource:string)=>{if(!delegates[resource])throw new HttpError(404,'Unknown resource');return delegates[resource] as Delegate;};
const schemas:Record<string,z.ZodType>={categories:v.categorySchema,coupons:v.couponSchema,homepage:v.sectionSchema,banners:v.bannerSchema,reviews:v.reviewSchema,pages:v.pageSchema,blog:v.blogSchema,navigation:v.navigationSchema,inventory:v.inventorySchema,media:z.object({alt:v.text})};
export async function listAdmin(resource:string,params:URLSearchParams){
 const config=resources[resource];if(!config)throw new HttpError(404,'Unknown resource');
 const page=Math.min(10000,Math.max(1,Math.floor(Number(params.get('page'))||1)));const q=(params.get('q')||'').slice(0,150);const where:Row={};
 if(q&&config.search.length)where.OR=config.search.map(key=>({[key]:{contains:q,mode:'insensitive'}}));
 if(resource==='orders'&&q)where.OR=[{orderNumber:{contains:q,mode:'insensitive'}},{customer:{OR:[{name:{contains:q,mode:'insensitive'}},{phone:{contains:q}}]}}];
 const status=params.get('status');if(status&&['products','orders','pages','blog'].includes(resource)){const allowed=resource==='orders'?['PENDING','CONFIRMED','PROCESSING','SHIPPED','DELIVERED','CANCELLED','RETURNED','REFUNDED']:['DRAFT','PUBLISHED','ARCHIVED'];if(allowed.includes(status))where.status=status;}
 if(resource==='products'&&params.get('category'))where.categories={some:{categoryId:params.get('category')}};
 if(resource==='products'&&params.get('stock')==='out')where.AND=[{OR:[{productType:'SIMPLE',inventory:{is:{quantity:{lte:0},allowBackorders:false}}},{productType:'VARIABLE',variants:{none:{active:true,inventory:{is:{OR:[{quantity:{gt:0}},{allowBackorders:true}]}}}}}]}];
 if(resource==='inventory'&&params.get('stock')==='low'){const ids=await db.$queryRaw<{id:string}[]>`SELECT id FROM "Inventory" WHERE quantity <= "lowStock"`;where.id={in:ids.map(i=>i.id)};}
 const from=params.get('from'),to=params.get('to');if(resource==='orders'&&(from||to)){const dates:Row={};if(from&&/^\d{4}-\d{2}-\d{2}$/.test(from))dates.gte=new Date(from);if(to&&/^\d{4}-\d{2}-\d{2}$/.test(to))dates.lte=new Date(to+'T23:59:59.999Z');where.createdAt=dates;}
 const extras:Row=resource==='products'?{include:productInclude}:resource==='orders'?{include:{customer:true}}:resource==='customers'?{include:{_count:{select:{orders:true}}}}:resource==='inventory'?{include:{product:{select:{name:true,sku:true}},variant:{include:{product:{select:{name:true}}}}}}:resource==='users'?{select:{id:true,name:true,email:true,role:true,active:true,updatedAt:true}}:{};
 const orderBy=['categories','homepage','navigation'].includes(resource)?{sortOrder:'asc'}:resource==='inventory'?{quantity:'asc'}:{[resource==='banners'?'updatedAt':'createdAt']:'desc'};
 const [rows,total]=await Promise.all([delegate(resource).findMany({where,...extras,orderBy,take:20,skip:(page-1)*20}),delegate(resource).count({where})]);return {rows,total,page,pages:Math.ceil(total/20)};
}
export async function getAdminRecord(resource:string,id:string){
 if(resource==='settings')return (await db.storeSetting.findUniqueOrThrow({where:{key:'store'}})).value;
 if(resource==='products'){const p=await db.product.findUnique({where:{id},include:productInclude});if(!p)throw new HttpError(404,'Product not found');return {...p,categoryIds:p.categories.map(c=>c.categoryId)};}
 if(resource==='orders')return db.order.findUnique({where:{id},include:{items:true,customer:true}});
 if(resource==='customers'){const customer=await db.customer.findUnique({where:{id},include:{addresses:true,orders:{take:20,orderBy:{createdAt:'desc'}},_count:{select:{orders:true}}}});const spend=await db.order.aggregate({where:{customerId:id,status:{notIn:['CANCELLED','REFUNDED','RETURNED']}},_sum:{total:true}});return customer?{...customer,totalSpend:spend._sum.total||0}:null;}
 if(resource==='users')return db.user.findUnique({where:{id},select:{id:true,name:true,email:true,role:true,active:true}});
 return delegate(resource).findUnique({where:{id}});
}
async function preventCycle(resource:'categories'|'navigation',id:string,parentId:string|null){const seen=new Set([id]);let cursor=parentId;while(cursor){if(seen.has(cursor))throw new HttpError(400,'A parent cannot be the record itself or its descendant');seen.add(cursor);const row=await delegate(resource).findUnique({where:{id:cursor}});if(!row)throw new HttpError(400,'Parent does not exist');cursor=row.parentId as string|null;}}
export async function saveProduct(id:string|null,raw:unknown){const input=v.productSchema.parse(raw);return db.$transaction(async tx=>{
 const {images,categoryIds,inventory,variants,...data}=input;
 const existing=id?await tx.product.findUniqueOrThrow({where:{id},include:{variants:{include:{_count:{select:{orderItems:true}}}}}}):null;
 if(existing?.productType!==data.productType&&existing&&(await tx.orderItem.count({where:{productId:id!}})))throw new HttpError(409,'Product type cannot change after it has orders');
 const uniqueCategoryIds=[...new Set(categoryIds)];if(await tx.category.count({where:{id:{in:uniqueCategoryIds}}})!==uniqueCategoryIds.length)throw new HttpError(400,'Unknown category');
 const product=id?await tx.product.update({where:{id},data:{...data,publishedAt:data.status==='PUBLISHED'?(existing?.publishedAt||new Date()):existing?.publishedAt}}):await tx.product.create({data:{...data,publishedAt:data.status==='PUBLISHED'?new Date():null}});
 await tx.productImage.deleteMany({where:{productId:product.id}});await tx.productImage.createMany({data:images.map((i,index)=>({...i,productId:product.id,sortOrder:index}))});
 await tx.productCategory.deleteMany({where:{productId:product.id}});await tx.productCategory.createMany({data:uniqueCategoryIds.map(categoryId=>({productId:product.id,categoryId}))});
 await tx.inventory.upsert({where:{productId:product.id},create:{productId:product.id,...inventory},update:inventory});
 const seen:string[]=[];
 for(const variant of variants){const {id:variantId,inventory:stock,...fields}=variant;if(variantId&&!existing?.variants.some(v=>v.id===variantId))throw new HttpError(400,'Variant does not belong to this product');const saved=variantId?await tx.productVariant.update({where:{id:variantId},data:fields}):await tx.productVariant.create({data:{...fields,productId:product.id}});seen.push(saved.id);await tx.inventory.upsert({where:{variantId:saved.id},create:{variantId:saved.id,...stock},update:stock});}
 for(const previous of existing?.variants||[])if(!seen.includes(previous.id)){if(previous._count.orderItems)await tx.productVariant.update({where:{id:previous.id},data:{active:false}});else await tx.productVariant.delete({where:{id:previous.id}});}
 await tx.productOption.deleteMany({where:{productId:product.id}});
 for(const name of ['Size','Color']){const values=[...new Set(variants.map(v=>name==='Size'?v.size:v.color))].filter(Boolean);if(values.length){const option=await tx.productOption.create({data:{productId:product.id,name}});const saved=await tx.productVariant.findMany({where:{productId:product.id}});for(const value of values)await tx.productOptionValue.create({data:{optionId:option.id,value,variants:{connect:saved.filter(v=>(name==='Size'?v.size:v.color)===value).map(v=>({id:v.id}))}}});}}
 return product;
 },{timeout:15000,isolationLevel:Prisma.TransactionIsolationLevel.Serializable});}
export async function saveAdmin(resource:string,id:string|null,raw:unknown,actorId:string){
 if(resource==='products')return saveProduct(id,raw);
 if(resource==='orders'){if(!id)throw new HttpError(400,'Orders are created through checkout');return updateOrder(id,raw);}
 if(resource==='settings'){const input=v.settingsSchema.parse(raw);return db.storeSetting.upsert({where:{key:'store'},create:{key:'store',value:input},update:{value:input}});}
 if(resource==='users'){const {password,...input}=v.userSchema.parse(raw);if(!id&&!password)throw new HttpError(400,'Password is required');if(id===actorId&&(!input.active||input.role!=='SUPER_ADMIN'))throw new HttpError(400,'You cannot disable or demote your own administrator account');const data={...input,...(password?{passwordHash:await hashPassword(password)}:{})};if(id){const user=await db.user.update({where:{id},data});await db.session.deleteMany({where:{userId:id}});return {id:user.id};}const user=await db.user.create({data:{...data,passwordHash:data.passwordHash!}});return {id:user.id};}
 if(!schemas[resource]||resources[resource].readOnly)throw new HttpError(400,'This resource cannot be changed here');
 if(['inventory','media'].includes(resource)&&!id)throw new HttpError(400,'Use product inventory or image upload to create this resource');
 const input=schemas[resource].parse(raw) as Row;
 if(id&&(resource==='categories'||resource==='navigation'))await preventCycle(resource,id,(input.parentId as string|null)||null);
 return id?delegate(resource).update({where:{id},data:input}):delegate(resource).create({data:input});
}
export async function duplicateProduct(id:string){const p=await getAdminRecord('products',id) as Row;const suffix=Date.now().toString(36);return saveProduct(null,{...p,name:p.name+' (Copy)',slug:p.slug+'-'+suffix,sku:p.sku+'-'+suffix,status:'DRAFT',variants:(p.variants as Row[]).map(v=>({...v,id:undefined,sku:v.sku+'-'+suffix}))});}
export async function deleteAdmin(resource:string,id:string){
 if(resource==='products')return db.product.update({where:{id},data:{status:'ARCHIVED'}});
 if(resource==='categories')return db.category.update({where:{id},data:{active:false}});
 if(['orders','customers','inventory','settings','users'].includes(resource))throw new HttpError(400,'This record must be retained for store history');
 if(resource==='media'){const media=await db.media.findUniqueOrThrow({where:{id}});const references=await db.$queryRaw<{count:bigint}[]>(Prisma.sql`SELECT COUNT(*) FROM (SELECT "url" AS content FROM "ProductImage" UNION ALL SELECT image FROM "ProductVariant" UNION ALL SELECT image FROM "Category" UNION ALL SELECT banner FROM "Category" UNION ALL SELECT image FROM "Banner" UNION ALL SELECT avatar FROM "Review" UNION ALL SELECT image FROM "BlogPost" UNION ALL SELECT "ogImage" FROM "Product" UNION ALL SELECT "ogImage" FROM "Category" UNION ALL SELECT "ogImage" FROM "Page" UNION ALL SELECT "ogImage" FROM "BlogPost" UNION ALL SELECT content FROM "Page" UNION ALL SELECT content FROM "BlogPost" UNION ALL SELECT image FROM "OrderItem" UNION ALL SELECT value::text FROM "StoreSetting" UNION ALL SELECT config::text FROM "HomepageSection") refs WHERE content LIKE ${'%'+media.url+'%'}`);if(Number(references[0].count))throw new HttpError(409,'This image is in use. Remove its references first.');}
 return delegate(resource).delete({where:{id}});
}
export async function dashboard(){const [orders,products,customers,pending,revenue,recent,lowStock,top,statuses]=await Promise.all([db.order.count(),db.product.count(),db.customer.count(),db.order.count({where:{status:'PENDING'}}),db.order.aggregate({where:{paymentStatus:'PAID',status:{notIn:['CANCELLED','RETURNED','REFUNDED']}},_sum:{total:true}}),db.order.findMany({take:8,orderBy:{createdAt:'desc'},include:{customer:true}}),db.$queryRaw<{id:string;name:string;quantity:number}[]>`SELECT i.id, COALESCE(p.name,vp.name) AS name,i.quantity FROM "Inventory" i LEFT JOIN "Product" p ON p.id=i."productId" LEFT JOIN "ProductVariant" v ON v.id=i."variantId" LEFT JOIN "Product" vp ON vp.id=v."productId" WHERE i.quantity<=i."lowStock" AND (p."productType"='SIMPLE' OR v.active=true) ORDER BY i.quantity LIMIT 20`,db.orderItem.groupBy({by:['productId','name'],where:{order:{status:{notIn:['CANCELLED','RETURNED','REFUNDED']}}},_sum:{quantity:true,total:true},orderBy:{_sum:{quantity:'desc'}},take:5}),db.order.groupBy({by:['status'],_count:true})]);return {orders,products,customers,pending,revenue:revenue._sum.total||0,recent,lowStock,top,statuses};}


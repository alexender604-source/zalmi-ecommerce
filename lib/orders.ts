import { Prisma } from "@prisma/client";
import { db } from "./db";
import { priceFor, inStock } from "./pricing";
import { cartSchema, checkoutSchema, orderUpdateSchema, settingsSchema } from "./validation";
import { hashToken } from "./password";
import { HttpError } from "./errors";
import { z } from "zod";
type Tx=Prisma.TransactionClient;
function publicLine(line:{productId:string;variantId:string|null;name:string;sku:string;image:string;options:string;quantity:number;unitPrice:number;total:number}){return {productId:line.productId,variantId:line.variantId,name:line.name,sku:line.sku,image:line.image,options:line.options,quantity:line.quantity,unitPrice:line.unitPrice,total:line.total};}
async function calculate(tx:Tx,input:z.infer<typeof cartSchema>){
 const grouped=new Map<string,{productId:string;variantId?:string|null;quantity:number}>();
 for(const item of input.items){const key=item.productId+':'+(item.variantId||'');const existing=grouped.get(key);grouped.set(key,{...item,quantity:item.quantity+(existing?.quantity||0)});}
 const lines=[];
 for(const item of grouped.values()){
  if(item.quantity>99)throw new HttpError(400,"Maximum quantity per item is 99");
  const p=await tx.product.findFirst({where:{id:item.productId,status:"PUBLISHED"},include:{images:{orderBy:{sortOrder:"asc"},take:1},inventory:true,variants:{include:{inventory:true}}}});
  if(!p)throw new HttpError(400,"A product is no longer available");
  const variant=item.variantId?p.variants.find(v=>v.id===item.variantId&&v.active):null;
  if((item.variantId&&!variant)||(p.productType==='VARIABLE'&&!variant)||(p.productType==='SIMPLE'&&variant))throw new HttpError(400,`Choose a valid option for ${p.name}`);
  const inventory=variant?.inventory??p.inventory;
  if(!inStock(inventory,item.quantity))throw new HttpError(409,`Not enough stock for ${p.name}`);
  const unitPrice=priceFor(p,variant).current;
  lines.push({productId:p.id,variantId:variant?.id||null,name:p.name,sku:variant?.sku||p.sku,image:variant?.image||p.images[0]?.url||'',options:variant?[variant.size,variant.color].filter(Boolean).join(' / '):'',quantity:item.quantity,unitPrice,total:unitPrice*item.quantity,inventoryId:inventory!.id,backorders:inventory!.allowBackorders});
 }
 const subtotal=lines.reduce((s,l)=>s+l.total,0);let discount=0;
 const coupon=input.coupon?await tx.coupon.findUnique({where:{code:input.coupon.toUpperCase()}}):null;
 if(input.coupon){const now=new Date();if(!coupon||!coupon.active||(coupon.startDate&&coupon.startDate>now)||(coupon.expiryDate&&coupon.expiryDate<now)||(coupon.usageLimit!=null&&coupon.usedCount>=coupon.usageLimit)||subtotal<coupon.minimumOrder)throw new HttpError(400,'Coupon is invalid, expired, used up, or minimum order not reached');discount=coupon.type==='PERCENTAGE'?Math.floor(subtotal*coupon.amount/100):coupon.amount;discount=Math.min(discount,coupon.maximumDiscount??subtotal,subtotal);}
 const settingsRow=await tx.storeSetting.findUniqueOrThrow({where:{key:'store'}});const settings=settingsSchema.parse(settingsRow.value);
 const shipping=settings.freeShipping||(settings.freeShippingThreshold!=null&&subtotal-discount>=settings.freeShippingThreshold)?0:settings.shippingFee;
 return {lines,subtotal,discount,shipping,total:subtotal-discount+shipping,coupon};
}
export async function quoteCart(raw:unknown){const input=cartSchema.parse(raw);const q=await db.$transaction(tx=>calculate(tx,input));return {...q,coupon:q.coupon?.code||'',lines:q.lines.map(publicLine)};}
async function serializable<T>(work:(tx:Tx)=>Promise<T>):Promise<T>{for(let attempt=0;attempt<4;attempt++){try{return await db.$transaction(work,{isolationLevel:Prisma.TransactionIsolationLevel.Serializable,timeout:15000});}catch(e){if(e instanceof Prisma.PrismaClientKnownRequestError&&['P2034','P2002'].includes(e.code)&&attempt<3)continue;throw e;}}throw Error('Transaction retry failed');}
export async function placeOrder(raw:unknown){
 const input=checkoutSchema.parse(raw);const accessHash=hashToken(input.accessToken);
 return serializable(async tx=>{
  const previous=await tx.order.findUnique({where:{idempotencyKey:input.idempotencyKey}});if(previous){if(previous.accessHash!==accessHash)throw new HttpError(409,'Order request already exists');return previous;}
  const q=await calculate(tx,input);
  for(const line of q.lines){const updated=await tx.inventory.updateMany({where:{id:line.inventoryId,available:true,...(!line.backorders?{quantity:{gte:line.quantity}}:{})},data:{quantity:{decrement:line.quantity}}});if(updated.count!==1)throw new HttpError(409,`Stock changed for ${line.name}. Please review your cart.`);}
  if(q.coupon){const updated=await tx.coupon.updateMany({where:{id:q.coupon.id,active:true,...(q.coupon.usageLimit!=null?{usedCount:{lt:q.coupon.usageLimit}}:{})},data:{usedCount:{increment:1}}});if(!updated.count)throw new HttpError(409,'Coupon usage limit reached');}
  const phone=input.phone.replace(/[^+0-9]/g,'').replace(/^0/,'+92');
  const customer=await tx.customer.upsert({where:{phone},create:{name:input.name,email:input.email||null,phone},update:{name:input.name,...(input.email?{email:input.email}:{})}});
  const address={province:input.province,city:input.city,address:input.address,postalCode:input.postalCode};
  const existingAddress=await tx.address.findFirst({where:{customerId:customer.id,...address}});if(!existingAddress)await tx.address.create({data:{customerId:customer.id,...address}});
  const order=await tx.order.create({data:{idempotencyKey:input.idempotencyKey,accessHash,customerId:customer.id,subtotal:q.subtotal,discount:q.discount,shipping:q.shipping,total:q.total,couponId:q.coupon?.id,shippingAddress:{...address,name:input.name,email:input.email,phone},notes:input.notes,items:{create:q.lines.map(publicLine)}}});
  return tx.order.update({where:{id:order.id},data:{orderNumber:`ZR-${new Date().getFullYear()}-${String(order.sequence).padStart(6,'0')}`}});
 });
}
export async function updateOrder(id:string,raw:unknown){const input=orderUpdateSchema.parse(raw);return serializable(async tx=>{
 const order=await tx.order.findUniqueOrThrow({where:{id},include:{items:true}});
 const terminal=['CANCELLED','RETURNED','REFUNDED'];
 if(terminal.includes(order.status)&&input.status!==order.status)throw new HttpError(409,'A closed order cannot be reopened; create a new order instead');
 if(input.status==='CANCELLED'&&['SHIPPED','DELIVERED'].includes(order.status))throw new HttpError(400,'Shipped orders must be returned rather than cancelled');
 if(input.status==='RETURNED'&&!['SHIPPED','DELIVERED','RETURNED'].includes(order.status))throw new HttpError(400,'Only shipped or delivered orders can be returned');
 let restored=order.inventoryRestored;
 if(['CANCELLED','RETURNED'].includes(input.status)&&!restored){for(const item of order.items)await tx.inventory.updateMany({where:item.variantId?{variantId:item.variantId}:{productId:item.productId},data:{quantity:{increment:item.quantity}}});restored=true;}
 return tx.order.update({where:{id},data:{...input,inventoryRestored:restored}});
 });}
export const getPrivateOrder=(orderNumber:string,token:string)=>db.order.findFirst({where:{orderNumber,accessHash:hashToken(token)},include:{items:true}});

import { PrismaClient, Prisma } from '@prisma/client';
import { readFileSync, statSync } from 'node:fs';
import { hashPassword } from '../lib/password';
const db=new PrismaClient();
const load=(file:string)=>JSON.parse(readFileSync(file,'utf8').replace(/^\uFEFF/,''));
const slug=(v:string)=>v.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
// Retained catalog photography keeps its existing local paths so saved URLs remain stable.
const image=(name:string)=>`/images/catalog/${name}`;
async function main(){
 const email=process.env.ADMIN_EMAIL;const password=process.env.ADMIN_PASSWORD;
 if(!email||!password||password.length<12)throw Error('Set ADMIN_EMAIL and ADMIN_PASSWORD (12+ characters) before seeding.');
 await db.user.upsert({where:{email},update:{},create:{email,name:'Store Administrator',passwordHash:await hashPassword(password),role:'SUPER_ADMIN'}});
 const tree:Record<string,string[]>={'Peshawari Chappal':['GoGo Chappal','Suede Chappal','Norozi Chappal','Kaptaan Chappal','Smart Zalmi Chappal','Medium Sole Chappal'],'Charsadda Chappal':['Gol T Chappal','T-Shape Chappal','Takidar Chappal','Panjedar Chappal','Vibram Sole Chappal'],'Slippers':['Medicated Slippers','Soft Sole Slippers'],'Khaddar':[],'Men Shawls':[],'Pakols':[]};
 const images:Record<string,string>={'peshawari-chappal':'peshawari-chappal-collection.jpg','slippers':'handmade-slippers-collection.jpg','khaddar':'handmade-khaddar-collection.jpg','men-shawls':'men-shawls-collection.jpg','kaptaan-chappal':'kaptaan-chappal-collection.jpg','smart-zalmi-chappal':'smart-zalmi-chappal-collection.jpg','takidar-chappal':'takidar-chappal-collection.jpg'};
 let sortOrder=0;
 for(const [name,children] of Object.entries(tree)){const key=slug(name);const root=await db.category.upsert({where:{slug:key},update:{},create:{name,slug:key,image:images[key]?image(images[key]):'',sortOrder:sortOrder++}});for(const name of children){const key=slug(name);await db.category.upsert({where:{slug:key},update:{},create:{name,slug:key,parentId:root.id,image:images[key]?image(images[key]):'',sortOrder:sortOrder++}});}}
 const categories=await db.category.findMany();const categoryId=(key:string)=>categories.find(c=>c.slug===key)!.id;
 const products=load('data/zarshal-products.json') as {name:string;price:string;sale:string;image:string}[];
 const productIds:string[]=[];
 for(const [index,p] of products.entries()){
  const categorySlug=index<8?'peshawari-chappal':index<12?'khaddar':'men-shawls';
  const categoryIds=[categoryId(categorySlug)];if(index<8)categoryIds.push(categoryId(p.name.includes('Zalmi')?'smart-zalmi-chappal':'takidar-chappal'));
  const sku=`ZR-${String(index+1).padStart(4,'0')}`;
  const regularPrice=Math.round(Number(p.price.replace(/[^0-9.]/g,''))*100);const salePrice=Math.round(Number(p.sale.replace(/[^0-9.]/g,''))*100);
  const product=await db.product.upsert({where:{slug:slug(p.name)},update:{},create:{name:p.name,slug:slug(p.name),sku,regularPrice,salePrice,status:'PUBLISHED',publishedAt:new Date(),featured:index<4,bestseller:index>=4&&index<8,productType:index<8?'VARIABLE':'SIMPLE',shortDescription:'Handmade heritage essentials from Zalmi.',description:'Traditional craftsmanship, carefully selected materials and everyday comfort.',material:index<8?'Leather':index<12?'Khaddar':'Textile',tags:['handmade'],images:{create:{url:p.image,alt:p.name}},categories:{create:categoryIds.map(categoryId=>({categoryId}))},inventory:{create:{quantity:index<8?0:20}},variants:index<8?{create:['7','8','9','10','11'].map(size=>({sku:`${sku}-${size}`,size,color:p.name.includes('Black')?'Black':'Brown',inventory:{create:{quantity:10}}}))}:undefined}});
  if(index<8){const variants=await db.productVariant.findMany({where:{productId:product.id}});for(const name of ['Size','Color']){const option=await db.productOption.upsert({where:{productId_name:{productId:product.id,name}},update:{},create:{productId:product.id,name}});for(const v of variants){const value=name==='Size'?v.size:v.color;await db.productOptionValue.upsert({where:{optionId_value:{optionId:option.id,value}},update:{},create:{optionId:option.id,value,variants:{connect:variants.filter(x=>(name==='Size'?x.size:x.color)===value).map(x=>({id:x.id}))}}});}}}
  productIds.push(product.id);
 }
 const settings={storeName:'Zalmi',logo:'/images/zalmi-logo.png',favicon:'/zalmi-icon.png',phone:'+92 313 5019 579',email:'',whatsapp:'923135019579',address:'Farooq Azam Chowk, Charsadda',description:"Zalmi offers handmade Peshawari chappals, traditional footwear, Khaddar, men's shawls and other Pakistani men's fashion products.",currency:'PKR',announcement:'Free shipping on all orders over PKR 3,000',copyright:'© 2026 Zalmi. All rights reserved.',freeShipping:false,shippingFee:25000,freeShippingThreshold:300000,facebook:'',instagram:'',tiktok:'',youtube:''};
 await db.storeSetting.upsert({where:{key:'store'},update:{},create:{key:'store',value:settings}});
 const banners=[{key:'hero',title:'Handmade chappals.\nReal leather. Real craft.',eyebrow:'Zalmi Collection',description:'Bring Charsadda craftsmanship to your wardrobe with handmade Peshawari chappals, premium leather and traditional finishing.',image:image('heritage-collection-banner.jpeg'),imageAlt:'Zalmi handmade chappals, shawls, khaddar and pakols',buttonLabel:'Shop Now',buttonUrl:'/shop'}, {key:'promo',title:'Keep calm & wear Zalmi handmade',eyebrow:'A Zalmi Thing',description:'Discover authentic craft and everyday comfort in a line built around heritage and quality.',image:image('handmade-promotion.webp'),imageAlt:'Traditional Zalmi leather craftsmanship',buttonLabel:'Explore all products',buttonUrl:'/shop'}];
 for(const b of banners)await db.banner.upsert({where:{key:b.key},update:{},create:b});
 const sections:{key:string;title:string;type:string;active?:boolean;config:Prisma.InputJsonValue}[]=[
  {key:'hero',title:'Hero',type:'HERO',config:{bannerKey:'hero'}},
  {key:'trust',title:'Shopping promises',type:'TRUST',config:{items:[{title:'Free Shipping',text:'Free shipping on orders over PKR 3,000',icon:'Truck'},{title:'Free Return',text:'Easy return and exchange',icon:'RefreshCw'},{title:'Support',text:'Friendly customer support',icon:'Headphones'},{title:'100% Safe & Secure',text:'Secure shopping experience',icon:'ShieldCheck'}]}},
  {key:'heritage',title:'Our Heritage',type:'HERITAGE',active:false,config:{description:'Zalmi is a Charsadda-based handmade footwear and textile brand rooted in the craft traditions of Khyber Pakhtunkhwa.'}},
  {key:'speciality',title:'Handpicked for everyday style',type:'PRODUCTS',config:{eyebrow:'Featured collection',productIds:productIds.slice(0,4),limit:4}},
  {key:'categories',title:'Shop by Category',type:'CATEGORIES',config:{eyebrow:'Our collection',categoryIds:Object.keys(images).map(categoryId)}},
  {key:'chappals',title:'Best Peshawari Chappals by Zalmi',type:'PRODUCTS',config:{productIds:productIds.slice(4,8),categorySlug:'peshawari-chappal',limit:4}},
  {key:'promo',title:'Promotion',type:'PROMO',config:{bannerKey:'promo'}},
  {key:'khaddar',title:'Charsadda Handmade Khaddar',type:'PRODUCTS',config:{categorySlug:'khaddar',limit:4}},
  {key:'benefits',title:'Why Shop at Zalmi?',type:'BENEFITS',config:{description:'Traditional quality, dependable service, and handmade craftsmanship.',image:image('black-double-gear-takidar-t-shape-peshawari-chappal.jpg'),items:[{title:'Fast & Reliable Delivery',text:'Quick dispatch with secure doorstep delivery across Pakistan.',icon:'Truck'},{title:'Exclusive Offers',text:'Seasonal discounts and premium savings on select products.',icon:'BadgePercent'},{title:'Friendly Customer Support',text:'Our team is ready to guide you before and after every order.',icon:'Headphones'},{title:'Premium Quality Products',text:'Authentic leather and handcrafted details in every collection.',icon:'CheckCircle2'},{title:'Easy Exchange Support',text:'Supportive solutions for fit or quality concerns in a timely manner.',icon:'Gift'},{title:'Secure Shopping Experience',text:'Protected payments and trusted order handling for peace of mind.',icon:'ShieldCheck'}]}},
  {key:'reviews',title:'What Our Customers Say',type:'REVIEWS',config:{eyebrow:'Customer reviews',limit:12}},
  {key:'shawls',title:'Handmade Men’s Shawls',type:'PRODUCTS',config:{categorySlug:'men-shawls',limit:4}},
  {key:'whatsapp',title:'Order directly on WhatsApp',type:'WHATSAPP',config:{description:'Chat with us for product details, sizing help or order support.',buttonLabel:'Order on WhatsApp'}},
  {key:'seo',title:'About Zalmi',type:'SEO',config:{blocks:load('data/seed-seo.json')}}
 ];
 for(const [i,s] of sections.entries())await db.homepageSection.upsert({where:{key:s.key},update:{},create:{...s,sortOrder:i,active:s.active??true}});
 const reviews=load('data/zarshal-reviews.json') as {name:string;text:string;image:string}[];
 for(const [index,r] of reviews.entries())await db.review.upsert({where:{id:`seed-review-${index}`},update:{},create:{id:`seed-review-${index}`,name:r.name,content:r.text,rating:5,avatar:r.image,source:'Google',approved:true,featured:true}});
 const pages=['The Brand','Contact Us','Privacy Policy','Shipping Policy','Return & Refund Policy','Terms & Conditions'];
 for(const title of pages)await db.page.upsert({where:{slug:slug(title)},update:{},create:{title,slug:slug(title),content:title==='The Brand'?settings.description:title==='Contact Us'?`${settings.phone}\n${settings.address}`:'Draft store policy — replace with your approved policy before publishing.',status:['The Brand','Contact Us'].includes(title)?'PUBLISHED':'DRAFT'}});
 const main=[{label:'Home',url:'/'},...['peshawari-chappal','charsadda-chappal','khaddar','men-shawls','pakols'].map(key=>({label:categories.find(c=>c.slug===key)!.name,categoryId:categoryId(key),url:''})),{label:'The Brand',url:'/page/the-brand'},{label:'Blog',url:'/blog'}];
 for(const [i,item] of main.entries()){const parent=await db.navigationItem.upsert({where:{id:`seed-nav-${i}`},update:{},create:{id:`seed-nav-${i}`,...item,sortOrder:i}});if('categoryId' in item)for(const [j,c] of categories.filter(c=>c.parentId===item.categoryId).entries())await db.navigationItem.upsert({where:{id:`seed-nav-${i}-${j}`},update:{},create:{id:`seed-nav-${i}-${j}`,label:c.name,categoryId:c.id,parentId:parent.id,sortOrder:j}});}
 for(const [i,title] of pages.entries())await db.navigationItem.upsert({where:{id:`seed-footer-${i}`},update:{},create:{id:`seed-footer-${i}`,label:title,url:`/page/${slug(title)}`,location:'FOOTER',sortOrder:i,visible:['The Brand','Contact Us'].includes(title)}});
 const assets=load('data/zarshal-assets.json') as {src:string;alt:string}[];for(const a of assets)await db.media.upsert({where:{url:a.src},update:{},create:{url:a.src,alt:a.alt,filename:a.src.split('/').pop()!,mimeType:a.src.endsWith('.svg')?'image/svg+xml':a.src.endsWith('.png')?'image/png':a.src.endsWith('.webp')?'image/webp':'image/jpeg',size:statSync('public'+a.src).size}});
 for(const asset of [{url:'/images/zalmi-logo.png',alt:'Zalmi',filename:'zalmi-logo.png'},{url:'/zalmi-icon.png',alt:'Zalmi icon',filename:'zalmi-icon.png'}])await db.media.upsert({where:{url:asset.url},update:{alt:asset.alt},create:{...asset,mimeType:'image/png',size:statSync('public'+asset.url).size}});
 console.log(`Seed complete: ${products.length} products, ${categories.length} categories, ${sections.length} homepage sections. Existing records preserved.`);
}
main().catch(e=>{console.error(e);process.exitCode=1;}).finally(()=>db.$disconnect());


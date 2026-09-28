import { db } from "./db";
import { sectionConfigSchema } from "./validation";
import { productInclude, productCard } from "./products";
import { descendantIds } from "./categories";
export async function getHomepage(){
 const sections=await db.homepageSection.findMany({where:{active:true},orderBy:{sortOrder:"asc"}});
 return Promise.all(sections.map(async section=>{
  const config=sectionConfigSchema.parse(section.config);
  const category=config.categorySlug?await db.category.findFirst({where:{slug:config.categorySlug,active:true}}):null;
  const categoryIds=category?await descendantIds(category.id):[];
  const products=section.type==='PRODUCTS'?await db.product.findMany({where:{status:'PUBLISHED',...(config.productIds?.length?{id:{in:config.productIds}}:categoryIds.length?{categories:{some:{categoryId:{in:categoryIds}}}}:config.featured?{featured:true}:{})},include:productInclude,take:config.limit||4,orderBy:{createdAt:'asc'}}):[];
  if(config.productIds?.length)products.sort((a,b)=>config.productIds!.indexOf(a.id)-config.productIds!.indexOf(b.id));
  const categories=section.type==='CATEGORIES'?await db.category.findMany({where:{active:true,...(config.categoryIds?.length?{id:{in:config.categoryIds}}:{parentId:null})},orderBy:{sortOrder:'asc'},take:24}):[];
  if(config.categoryIds?.length)categories.sort((a,b)=>config.categoryIds!.indexOf(a.id)-config.categoryIds!.indexOf(b.id));
  const reviews=section.type==='REVIEWS'?await db.review.findMany({where:{approved:true,...(config.reviewIds?.length?{id:{in:config.reviewIds}}:{featured:true})},take:config.limit||12,orderBy:{date:'desc'}}):[];
  const banner=config.bannerKey?await db.banner.findFirst({where:{key:config.bannerKey,active:true}}):null;
  return {...section,config,products:products.map(productCard),categories,reviews,banner};
 }));
}
export const getPage=(slug:string)=>db.page.findFirst({where:{slug,status:'PUBLISHED'}});
export const getPost=(slug:string)=>db.blogPost.findFirst({where:{slug,status:'PUBLISHED',publishedAt:{lte:new Date()}}});
export async function listPosts(page:number){const where={status:'PUBLISHED' as const,publishedAt:{lte:new Date()}};const [posts,total]=await Promise.all([db.blogPost.findMany({where,take:12,skip:(page-1)*12,orderBy:{publishedAt:'desc'}}),db.blogPost.count({where})]);return {posts,total};}

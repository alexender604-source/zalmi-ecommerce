import { db } from "./db";
export const getCategories=()=>db.category.findMany({where:{active:true},orderBy:{sortOrder:"asc"}});
export const getCategory=(slug:string)=>db.category.findFirst({where:{slug,active:true}});
export async function descendantIds(categoryId:string){const all=await getCategories();const ids=[categoryId];for(let i=0;i<ids.length;i++){for(const c of all)if(c.parentId===ids[i]&&!ids.includes(c.id))ids.push(c.id);}return ids;}

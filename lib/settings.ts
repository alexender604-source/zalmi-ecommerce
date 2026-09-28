import { cache } from "react";
import { db } from "./db";
import { settingsSchema } from "./validation";
export const getSettings=cache(async()=>{const row=await db.storeSetting.findUnique({where:{key:"store"}});if(!row)throw Error('Database has not been seeded. Run npm run db:seed.');return settingsSchema.parse(row.value);});
export const getNavigation=cache(async()=>db.navigationItem.findMany({where:{visible:true},include:{category:true},orderBy:{sortOrder:"asc"}}));
export const navigationUrl=(item:{url:string;category?:{slug:string;active:boolean}|null})=>item.category?.active?`/category/${item.category.slug}`:item.url||"/shop";

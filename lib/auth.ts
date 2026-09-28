import "server-only";
import { cookies } from "next/headers";
import { randomBytes } from "node:crypto";
import { redirect } from "next/navigation";
import { db } from "./db";
import { hashToken } from "./password";
import type { AdminRole } from "@prisma/client";

export const sessionCookie="zarshal_session";
export async function currentUser() {
  const token=(await cookies()).get(sessionCookie)?.value;if(!token)return null;
  const session=await db.session.findUnique({where:{tokenHash:hashToken(token)},include:{user:true}});
  return session&&session.expiresAt>new Date()&&session.user.active ? session.user : null;
}
export function allowed(role: AdminRole, resource: string) {
  if(role==="SUPER_ADMIN")return true;
  if(resource==="users")return false;
  if(role==="ADMIN")return true;
  if(role==="ORDER_MANAGER")return ["orders","customers","dashboard"].includes(resource);
  return ["products","categories","inventory","homepage","banners","reviews","pages","blog","navigation","media","seo"].includes(resource);
}
export async function requireUser(resource?: string) { const user=await currentUser(); if(!user)throw new HttpError(401,"Please sign in");if(resource&&!allowed(user.role,resource))throw new HttpError(403,"Your role cannot perform this operation");return user; }
export async function requireAdminPage(resource?:string){const user=await currentUser();if(!user)redirect("/admin/login");if(resource&&!allowed(user.role,resource))redirect("/admin?forbidden=1");return user;}
export async function createSession(userId:string){const token=randomBytes(32).toString("hex");const expiresAt=new Date(Date.now()+8*60*60*1000);await db.session.create({data:{userId,tokenHash:hashToken(token),expiresAt}});(await cookies()).set(sessionCookie,token,{httpOnly:true,secure:process.env.NODE_ENV==="production",sameSite:"lax",path:"/",expires:expiresAt});}
import { HttpError } from './errors';
export { HttpError } from './errors';
export function sameOrigin(request:Request){const origin=request.headers.get("origin");const expected=new URL(process.env.APP_URL||request.url).origin;if(!origin||origin!==expected)throw new HttpError(403,"Invalid request origin");}
export async function rateLimit(key:string,limit:number,windowMs:number){const now=new Date();const row=await db.rateLimit.upsert({where:{key},create:{key,attempts:1,resetAt:new Date(+now+windowMs)},update:{attempts:{increment:1}}});if(row.resetAt<now){await db.rateLimit.update({where:{key},data:{attempts:1,resetAt:new Date(+now+windowMs)}});return;}if(row.attempts>limit)throw new HttpError(429,"Too many attempts. Please try again later.");}

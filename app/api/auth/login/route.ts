import { z } from 'zod';
import { db } from '@/lib/db';
import { createSession, sameOrigin, rateLimit, HttpError } from '@/lib/auth';
import { hashToken, verifyPassword, hashPassword } from '@/lib/password';
import { apiError, jsonBody } from '@/lib/http';
export async function POST(request:Request){try{sameOrigin(request);const input=z.object({email:z.email().toLowerCase(),password:z.string().min(1).max(200)}).parse(await jsonBody(request));await rateLimit('login:'+hashToken(input.email),10,15*60*1000);const user=await db.user.findUnique({where:{email:input.email}});const valid=await verifyPassword(input.password,user?.passwordHash||await hashPassword('dummy-password-for-timing'));if(!user||!valid||!user.active)throw new HttpError(401,'Invalid email or password');await createSession(user.id);return Response.json({ok:true});}catch(e){return apiError(e);}}

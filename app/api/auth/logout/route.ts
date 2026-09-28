import { cookies } from 'next/headers';
import { db } from '@/lib/db';
import { hashToken } from '@/lib/password';
import { sameOrigin,sessionCookie } from '@/lib/auth';
import { apiError } from '@/lib/http';
export async function POST(request:Request){try{sameOrigin(request);const jar=await cookies();const token=jar.get(sessionCookie)?.value;if(token)await db.session.deleteMany({where:{tokenHash:hashToken(token)}});jar.delete(sessionCookie);return Response.json({ok:true});}catch(e){return apiError(e);}}

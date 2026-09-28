import { requireUser,sameOrigin } from '@/lib/auth';
import { apiError,jsonBody } from '@/lib/http';
import { listAdmin,saveAdmin,getAdminRecord } from '@/lib/admin';
type Context={params:Promise<{resource:string}>};
export async function GET(request:Request,{params}:Context){try{const {resource}=await params;await requireUser(resource);return Response.json(resource==='settings'?await getAdminRecord(resource,'store'):await listAdmin(resource,new URL(request.url).searchParams));}catch(e){return apiError(e);}}
export async function POST(request:Request,{params}:Context){try{sameOrigin(request);const {resource}=await params;const user=await requireUser(resource);return Response.json(await saveAdmin(resource,null,await jsonBody(request),user.id),{status:201});}catch(e){return apiError(e);}}

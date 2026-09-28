import { requireUser,sameOrigin } from '@/lib/auth';
import { apiError,jsonBody } from '@/lib/http';
import { getAdminRecord,saveAdmin,deleteAdmin,duplicateProduct } from '@/lib/admin';
import { z } from 'zod';
type Context={params:Promise<{resource:string;id:string}>};
export async function GET(_request:Request,{params}:Context){try{const {resource,id}=await params;await requireUser(resource);return Response.json(await getAdminRecord(resource,id));}catch(e){return apiError(e);}}
export async function PUT(request:Request,{params}:Context){try{sameOrigin(request);const {resource,id}=await params;const user=await requireUser(resource);return Response.json(await saveAdmin(resource,id,await jsonBody(request),user.id));}catch(e){return apiError(e);}}
export async function DELETE(request:Request,{params}:Context){try{sameOrigin(request);const {resource,id}=await params;await requireUser(resource);return Response.json(await deleteAdmin(resource,id));}catch(e){return apiError(e);}}
export async function POST(request:Request,{params}:Context){try{sameOrigin(request);const {resource,id}=await params;await requireUser(resource);z.object({action:z.literal('duplicate'),resource:z.literal('products')}).parse({...await jsonBody(request),resource});return Response.json(await duplicateProduct(id),{status:201});}catch(e){return apiError(e);}}

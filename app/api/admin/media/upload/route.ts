import { requireUser,sameOrigin,HttpError } from '@/lib/auth';
import { apiError } from '@/lib/http';
import { storeImage } from '@/lib/storage';
import { db } from '@/lib/db';
import { text } from '@/lib/validation';
export async function POST(request:Request){try{sameOrigin(request);await requireUser('media');if(Number(request.headers.get('content-length')||0)>9*1024*1024)throw new HttpError(413,'Upload is too large');const form=await request.formData();const file=form.get('file');if(!(file instanceof File))throw new HttpError(400,'Choose an image');const alt=text.parse(form.get('alt')||'');const image=await storeImage(file);return Response.json(await db.media.create({data:{...image,alt}}),{status:201});}catch(e){return apiError(e);}}

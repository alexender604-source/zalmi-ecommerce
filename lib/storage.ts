import { randomUUID,createHash } from 'node:crypto';
import { mkdir,writeFile } from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';
import { HttpError } from './auth';
export async function storeImage(file:File){
 if(file.size>8*1024*1024||!['image/jpeg','image/png','image/webp','image/avif'].includes(file.type))throw new HttpError(400,'Upload a JPEG, PNG, WebP or AVIF image under 8 MB');
 const input=Buffer.from(await file.arrayBuffer());let buffer:Buffer;
 try{buffer=await sharp(input,{limitInputPixels:30000000}).rotate().resize(2400,2400,{fit:'inside',withoutEnlargement:true}).webp({quality:88}).toBuffer();}catch{throw new HttpError(400,'This image could not be decoded');}
 const filename=randomUUID()+'.webp';
 if(process.env.UPLOAD_DRIVER==='cloudinary'){
  const cloud=process.env.CLOUDINARY_CLOUD_NAME,key=process.env.CLOUDINARY_API_KEY,secret=process.env.CLOUDINARY_API_SECRET;if(!cloud||!key||!secret)throw new HttpError(503,'Cloudinary storage is not configured');
  const timestamp=Math.floor(Date.now()/1000).toString();const publicId='zalmi/'+filename.slice(0,-5);const signature=createHash('sha256').update(`public_id=${publicId}&timestamp=${timestamp}${secret}`).digest('hex');const form=new FormData();form.set('file',new Blob([new Uint8Array(buffer)],{type:'image/webp'}),filename);form.set('api_key',key);form.set('timestamp',timestamp);form.set('public_id',publicId);form.set('signature',signature);
  const result=await fetch(`https://api.cloudinary.com/v1_1/${encodeURIComponent(cloud)}/image/upload`,{method:'POST',body:form,signal:AbortSignal.timeout(30000)});if(!result.ok)throw new HttpError(502,'Image storage service rejected the upload');const data=await result.json();return {url:data.secure_url as string,provider:'cloudinary',providerId:data.public_id as string,filename,size:buffer.length,mimeType:'image/webp'};
 }
 const directory=path.join(process.cwd(),'public','uploads');await mkdir(directory,{recursive:true});await writeFile(path.join(directory,filename),buffer);return {url:'/uploads/'+filename,provider:'local',providerId:null,filename,size:buffer.length,mimeType:'image/webp'};
}

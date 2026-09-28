import { ZodError } from "zod";
import { Prisma } from "@prisma/client";
import { HttpError } from "./auth";
export function apiError(error:unknown){
  if(error instanceof ZodError)return Response.json({error:"Please check the highlighted fields",issues:error.issues.map(i=>({path:i.path.join("."),message:i.message}))},{status:400});
  if(error instanceof HttpError)return Response.json({error:error.message},{status:error.status});
  if(error instanceof Prisma.PrismaClientKnownRequestError){if(error.code==="P2002")return Response.json({error:"A record with that slug, SKU, email or code already exists"},{status:409});if(error.code==="P2025")return Response.json({error:"Record not found"},{status:404});if(error.code==="P2003")return Response.json({error:"This record is still referenced by other records"},{status:409});}
  console.error(error);return Response.json({error:"The operation could not be completed. Please try again."},{status:500});
}
export async function jsonBody(request:Request){if(Number(request.headers.get("content-length")||0)>1000000)throw new HttpError(413,"Request too large");const body=await request.text();if(body.length>1000000)throw new HttpError(413,"Request too large");try{return JSON.parse(body);}catch{throw new HttpError(400,"Invalid JSON request");}}

import { quoteCart } from '@/lib/orders';
import { sameOrigin } from '@/lib/auth';
import { apiError,jsonBody } from '@/lib/http';
export async function POST(request:Request){try{sameOrigin(request);return Response.json(await quoteCart(await jsonBody(request)));}catch(e){return apiError(e);}}

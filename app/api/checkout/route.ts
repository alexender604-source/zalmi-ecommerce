import { placeOrder } from '@/lib/orders';
import { sameOrigin,rateLimit } from '@/lib/auth';
import { apiError,jsonBody } from '@/lib/http';
export async function POST(request:Request){try{sameOrigin(request);await rateLimit('checkout:global',200,60*1000);const order=await placeOrder(await jsonBody(request));return Response.json({orderNumber:order.orderNumber},{status:201});}catch(e){return apiError(e);}}

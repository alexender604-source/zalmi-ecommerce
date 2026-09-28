import { CartCheckout } from '@/components/cart-checkout';
export const metadata={title:'Checkout',robots:{index:false,follow:false}};
export default function CheckoutPage(){return <div className="container-shell"><CartCheckout checkout/></div>;}

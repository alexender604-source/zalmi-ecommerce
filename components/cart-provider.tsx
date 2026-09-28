"use client";
import { createContext,useContext,useEffect,useState, type ReactNode } from 'react';
export type CartItem={productId:string;variantId:string|null;quantity:number;name:string;image:string;price:number;options:string};
type CartContextValue={items:CartItem[];ready:boolean;add:(item:CartItem)=>void;update:(productId:string,variantId:string|null,quantity:number)=>void;clear:()=>void};
const Context=createContext<CartContextValue|null>(null);
export function CartProvider({children}:{children:ReactNode}){
 const [items,setItems]=useState<CartItem[]>([]);const [ready,setReady]=useState(false);
 useEffect(()=>{queueMicrotask(()=>{try{const saved=JSON.parse(localStorage.getItem('zarshal-cart')||'[]');if(Array.isArray(saved))setItems(saved.filter(i=>typeof i.productId==='string'&&Number.isInteger(i.quantity)&&i.quantity>0&&i.quantity<=99).slice(0,100));}catch{}setReady(true);});},[]);
 useEffect(()=>{if(ready)localStorage.setItem('zarshal-cart',JSON.stringify(items));},[items,ready]);
 const add=(item:CartItem)=>setItems(old=>{const found=old.find(i=>i.productId===item.productId&&i.variantId===item.variantId);return found?old.map(i=>i===found?{...item,quantity:Math.min(99,i.quantity+item.quantity)}:i):[...old,item];});
 const update=(productId:string,variantId:string|null,quantity:number)=>setItems(old=>old.map(i=>i.productId===productId&&i.variantId===variantId?{...i,quantity:Math.min(99,Math.max(0,quantity))}:i).filter(i=>i.quantity>0));
 return <Context.Provider value={{items,ready,add,update,clear:()=>setItems([])}}>{children}</Context.Provider>;
}
export function useCart(){const value=useContext(Context);if(!value)throw Error('CartProvider missing');return value;}

"use client";
import Link from 'next/link';
import type { MenuItem } from '@/lib/navigation-types';
export function StoreNavigation({items,parentId=null,mobile=false,onNavigate}:{items:MenuItem[];parentId?:string|null;mobile?:boolean;onNavigate?:()=>void}){
 return <ul className={mobile?'space-y-2':parentId?'min-w-56 space-y-1 bg-surface p-3 shadow-lg':'flex items-center justify-center gap-5'}>{items.filter(i=>i.parentId===parentId).map(item=>{
  const children=items.some(i=>i.parentId===item.id);
  return <li key={item.id} className="group relative"><Link onClick={onNavigate} href={item.url} className="block py-2 text-[12px] font-medium uppercase tracking-[0.04em] text-foreground hover:text-muted">{item.label}</Link>{children&&<div className={mobile?'border-l pl-3':'absolute left-0 top-full z-50 hidden group-hover:block group-focus-within:block'}><StoreNavigation items={items} parentId={item.id} mobile={mobile} onNavigate={onNavigate}/></div>}</li>;
 })}</ul>;
}

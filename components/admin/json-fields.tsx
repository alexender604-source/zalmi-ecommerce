"use client";
import { MediaPicker } from './media-picker';
export type JsonValue=null|string|number|boolean|JsonValue[]|{[key:string]:JsonValue};
const inventory={quantity:0,lowStock:5,allowBackorders:false,available:true};
const templates:Record<string,JsonValue>={images:{url:'',alt:'',sortOrder:0},variants:{sku:'',size:'',color:'',regularPrice:null,salePrice:null,image:'',active:true,inventory},items:{title:'',text:'',icon:'ShieldCheck'},blocks:{title:'',content:''},productIds:'',categoryIds:'',reviewIds:'',tags:''};
const hidden=new Set(['id','productId','variantId','updatedAt','createdAt','_count']);
export function JsonFields({value,onChange,name}:{value:JsonValue;onChange:(value:JsonValue)=>void;name:string}){
 if(Array.isArray(value))return <div className="space-y-3">{value.map((v,i)=><div key={i} className="rounded border bg-surface p-3"><JsonFields value={v} name={name} onChange={next=>onChange(value.map((x,j)=>i===j?next:x))}/><div className="mt-3 flex gap-3 text-xs"><button type="button" onClick={()=>{if(!confirm('Remove this item? Save the form to apply.'))return;onChange(value.filter((_,j)=>i!==j));}}>Remove</button>{i>0&&<button type="button" onClick={()=>{const next=[...value];[next[i-1],next[i]]=[next[i],next[i-1]];onChange(next);}}>Move up</button>}</div></div>)}<button type="button" className="rounded border px-3 py-2 text-sm" onClick={()=>onChange([...value,structuredClone(templates[name]??'')])}>Add {name==='variants'?'variant':name==='images'?'image':'item'}</button></div>;
 if(value&&typeof value==='object')return <div className="grid gap-3 sm:grid-cols-2">{Object.entries(value).filter(([key])=>!hidden.has(key)).map(([key,v])=><div key={key} className={typeof v==='object'?'sm:col-span-2':''}><label className="mb-1 block text-xs font-semibold capitalize">{key.replace(/([A-Z])/g,' $1')}{/Price$/.test(key)?' (PKR)':''}</label><JsonFields value={v} name={key} onChange={next=>onChange({...value,[key]:next})}/></div>)}</div>;
 if(typeof value==='boolean')return <input type="checkbox" checked={value} onChange={e=>onChange(e.target.checked)} aria-label={name}/>;
 if(['url','image','avatar'].includes(name))return <MediaPicker value={String(value||'')} onChange={onChange}/>;
 if(typeof value==='number'||value===null){const isMoney=/Price$/.test(name);return <input aria-label={name} type="number" step={isMoney?'.01':'1'} value={value===null?'':Number(value)/(isMoney?100:1)} onChange={e=>onChange(e.target.value===''?null:Math.round(Number(e.target.value)*(isMoney?100:1)))}/>;}
 if(['text','content','description'].includes(name))return <textarea aria-label={name} rows={3} value={String(value)} onChange={e=>onChange(e.target.value)}/>;
 return <input aria-label={name} value={String(value)} onChange={e=>onChange(e.target.value)}/>;
}

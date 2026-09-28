import type { Metadata } from "next";
type SeoRecord={title?:string;name?:string;seoTitle:string;metaDescription:string;canonicalUrl:string;ogTitle:string;ogDescription:string;ogImage:string;noindex:boolean};
export const siteUrl=()=>process.env.SITE_URL||'https://zalmi.pk';
export function metadataFor(record:SeoRecord,path:string):Metadata{return {title:record.seoTitle||record.title||record.name,description:record.metaDescription||undefined,alternates:{canonical:record.canonicalUrl||new URL(path,siteUrl()).href},robots:{index:!record.noindex,follow:!record.noindex},openGraph:{title:record.ogTitle||record.seoTitle||record.title||record.name,description:record.ogDescription||record.metaDescription||undefined,...(record.ogImage?{images:[record.ogImage]}:{})}};}
export function StructuredData({value}:{value:unknown}){return <script type="application/ld+json" dangerouslySetInnerHTML={{__html:JSON.stringify(value).replace(/</g,'\\u003c')}}/>;}

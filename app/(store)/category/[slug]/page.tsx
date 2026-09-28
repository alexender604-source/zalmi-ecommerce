import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { getCategory,getCategories } from '@/lib/categories';
import { CatalogListing } from '@/components/catalog-listing';
import { metadataFor,StructuredData,siteUrl } from '@/lib/seo';
type Props={params:Promise<{slug:string}>;searchParams:Promise<Record<string,string|undefined>>};
export async function generateMetadata({params}:Props){const c=await getCategory((await params).slug);return c?metadataFor(c,'/category/'+c.slug):{};}
export default async function CategoryPage({params,searchParams}:Props){const c=await getCategory((await params).slug);if(!c)notFound();const children=(await getCategories()).filter(x=>x.parentId===c.id);return <div className="container-shell py-12"><StructuredData value={{'@context':'https://schema.org','@type':'BreadcrumbList',itemListElement:[{'@type':'ListItem',position:1,name:'Home',item:siteUrl()},{'@type':'ListItem',position:2,name:c.name,item:siteUrl()+'/category/'+c.slug}]}}/><nav className="mb-5 text-sm"><Link href="/">Home</Link> / {c.name}</nav>{c.banner&&<div className="relative mb-6 h-64"><Image src={c.banner} alt={c.name} fill sizes="100vw" className="object-cover"/></div>}<h1 className="text-3xl font-bold">{c.name}</h1><p className="mt-4 whitespace-pre-line text-sm leading-7 text-muted">{c.description}</p><div className="mt-4 flex flex-wrap gap-3">{children.map(child=><Link key={child.id} href={'/category/'+child.slug} className="border px-3 py-2 text-sm">{child.name}</Link>)}</div><CatalogListing params={await searchParams} categoryId={c.id}/></div>;}

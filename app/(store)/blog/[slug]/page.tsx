import Image from 'next/image';
import { notFound } from 'next/navigation';
import { getPost } from '@/lib/content';
import { metadataFor,StructuredData } from '@/lib/seo';
type Props={params:Promise<{slug:string}>};
export async function generateMetadata({params}:Props){const p=await getPost((await params).slug);return p?metadataFor(p,'/blog/'+p.slug):{};}
export default async function BlogPost({params}:Props){const p=await getPost((await params).slug);if(!p)notFound();return <article className="container-shell py-12"><StructuredData value={{'@context':'https://schema.org','@type':'Article',headline:p.title,author:{'@type':'Person',name:p.author},datePublished:p.publishedAt,dateModified:p.updatedAt,image:p.image||undefined}}/><p className="text-sm text-[#777]">{p.category} · {p.author} · {p.publishedAt?.toLocaleDateString('en-PK')}</p><h1 className="mt-3 text-4xl font-bold">{p.title}</h1>{p.image&&<div className="relative my-8 aspect-[2/1]"><Image src={p.image} alt={p.title} fill sizes="100vw" className="object-cover"/></div>}<div className="mt-8 max-w-3xl whitespace-pre-line text-sm leading-8">{p.content}</div></article>;}

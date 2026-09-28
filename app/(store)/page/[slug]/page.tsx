import { notFound } from 'next/navigation';
import { getPage } from '@/lib/content';
import { metadataFor } from '@/lib/seo';
type Props={params:Promise<{slug:string}>};
export async function generateMetadata({params}:Props){const p=await getPage((await params).slug);return p?metadataFor(p,'/page/'+p.slug):{};}
export default async function ContentPage({params}:Props){const p=await getPage((await params).slug);if(!p)notFound();return <article className="container-shell py-16"><h1 className="text-3xl font-bold">{p.title}</h1><div className="mt-8 max-w-3xl whitespace-pre-line text-sm leading-8 text-[#555]">{p.content}</div></article>;}

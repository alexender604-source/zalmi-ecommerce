import Link from 'next/link';
import { requireAdminPage } from '@/lib/auth';
export default async function SeoAdmin(){await requireAdminPage('seo');return <><h1 className="text-3xl font-bold">SEO management</h1><p className="my-5">Each editor contains title, description, canonical URL, Open Graph and indexing controls.</p><div className="grid gap-4 sm:grid-cols-2">{['products','categories','pages','blog'].map(resource=><Link key={resource} href={'/admin/'+resource} className="rounded-lg border bg-surface p-6 font-semibold capitalize">{resource} SEO →</Link>)}</div></>;}

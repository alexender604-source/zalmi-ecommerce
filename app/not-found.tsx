import Link from 'next/link';
export default function NotFound(){return <main className="container-shell py-20"><h1 className="text-3xl font-bold">Page not found</h1><p className="my-4">This item may no longer be available.</p><Link href="/shop" className="inline-block bg-brand px-5 py-3">Browse the store</Link></main>;}

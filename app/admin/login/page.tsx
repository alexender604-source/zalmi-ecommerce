import Link from 'next/link';
import { redirect } from 'next/navigation';
import { currentUser } from '@/lib/auth';
import { LoginForm } from '@/components/admin/login-form';
export const dynamic='force-dynamic';
export const metadata={title:'Admin sign in',robots:{index:false,follow:false}};
export default async function Login(){if(await currentUser())redirect('/admin');return <main className="flex min-h-screen items-center justify-center bg-surface-muted p-5 text-foreground"><div className="w-full max-w-md rounded-lg border border-border bg-surface p-8 shadow-sm"><Link href="/" className="text-sm font-bold uppercase tracking-widest text-brand-secondary">Zalmi</Link><h1 className="mb-8 mt-3 text-3xl font-bold">Store administration</h1><LoginForm/></div></main>;}

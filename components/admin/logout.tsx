"use client";
import { useState } from 'react';
import { useRouter } from 'next/navigation';
export function Logout(){const router=useRouter();const [error,setError]=useState('');return <><button onClick={async()=>{try{const r=await fetch('/api/auth/logout',{method:'POST'});if(!r.ok)throw Error('Logout failed');router.push('/admin/login');router.refresh();}catch{setError('Could not sign out. Try again.');}}} className="text-sm underline">Sign out</button>{error&&<p role="alert">{error}</p>}</>;}

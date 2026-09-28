"use client";
export default function ErrorPage({reset}:{reset:()=>void}){return <main className="container-shell py-20"><h1 className="text-2xl font-bold">We couldn’t load this page.</h1><p className="my-4">Please try again. If the problem continues, contact the store.</p><button onClick={reset} className="bg-brand px-5 py-3">Try again</button></main>;}

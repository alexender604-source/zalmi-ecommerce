import Image from 'next/image';

export const metadata = {
  title: 'Store temporarily unavailable',
  robots: { index: false, follow: false },
};

export default function StoreUnavailablePage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-surface px-6 py-16 text-foreground">
      <section className="w-full max-w-lg rounded-lg border border-border bg-surface p-8 text-center shadow-sm sm:p-12">
        <Image
          src="/images/zalmi-logo.png"
          alt="Zalmi"
          width={180}
          height={60}
          priority
          className="mx-auto h-auto w-40"
        />
        <h1 className="mt-8 text-3xl font-bold">We’ll be back shortly</h1>
        <p className="mt-4 leading-7 text-muted">
          The Zalmi store is temporarily unavailable while its catalog service is being configured.
        </p>
      </section>
    </main>
  );
}

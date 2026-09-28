import Image from "next/image";
import type { Banner } from "@prisma/client";
export function PromoBanner({ banner }: { banner: Banner }) {
  return (
    <section className="relative isolate overflow-hidden bg-surface-muted">
      <Image src={banner.image} alt={banner.imageAlt} fill sizes="100vw" className="-z-10 object-cover" />
      <div className="container-shell py-10 lg:py-12">
        <div className="flex flex-col gap-6 rounded-[4px] border border-border bg-surface/90 px-6 py-8 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-muted">{banner.eyebrow}</p>
            <h3 className="mt-2 text-[30px] font-bold tracking-[-0.05em] text-foreground">{banner.title}</h3>
            <p className="mt-3 max-w-[620px] text-[14px] leading-6 text-muted">
              {banner.description}
            </p>
          </div>
          <a href={banner.buttonUrl} className="w-fit rounded-[2px] bg-brand px-6 py-3 text-[11px] font-bold uppercase tracking-[0.12em] text-foreground transition hover:bg-brand-hover">
            {banner.buttonLabel}
          </a>
        </div>
      </div>
    </section>
  );
}

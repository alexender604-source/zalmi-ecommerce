import Image from "next/image";

import type { Banner } from "@prisma/client";

export function Hero({ banner }: { banner: Banner }) {
  return (
    <section className="relative overflow-hidden bg-brand-secondary">
      <Image src={banner.image} alt={banner.imageAlt} fill preload sizes="100vw" className="object-cover" />
      <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent" />
      <div className="relative container-shell grid min-h-[520px] items-center lg:grid-cols-[1.1fr_0.9fr]">
        <div className="max-w-[520px] py-16 lg:py-20">
          <p className="text-[11px] font-bold uppercase tracking-[0.28em] text-brand">{banner.eyebrow}</p>
          <h1 className="mt-5 text-[38px] font-bold leading-[1.04] tracking-[-0.07em] text-white lg:text-[44px]">
            {banner.title.split("\n").map((line,index)=><span key={index} className={index ? "mt-2 block" : "block"}>{line}</span>)}
          </h1>
          <p className="mt-6 max-w-[500px] text-[15px] leading-7 text-[#f4f0ea]">
            {banner.description}
          </p>
          <div className="mt-8 flex items-center gap-3">
            <a href={banner.buttonUrl} className="rounded-[2px] border border-[#1f1f1f] bg-surface px-6 py-3 text-[11px] font-bold uppercase tracking-[0.12em] text-foreground transition hover:bg-surface-muted">
              {banner.buttonLabel}
            </a>
          </div>
        </div>
        <div className="hidden lg:block" aria-hidden="true" />
      </div>
    </section>
  );
}

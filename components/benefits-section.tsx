import Image from "next/image";
import { CheckCircle2, Gift, Headphones, ShieldCheck, Truck, BadgePercent } from "lucide-react";

const icons = { CheckCircle2, Gift, Headphones, ShieldCheck, Truck, BadgePercent };
import type { SectionConfig } from "@/lib/validation";

export function BenefitsSection({ title, config }: { title: string; config: SectionConfig }) {
  return (
    <section className="bg-brand">
      <div className="container-shell py-12 lg:py-16">
        <div className="mb-8 text-center">
          <h2 className="text-[32px] font-bold tracking-[-0.06em] text-foreground">{title}</h2>
          <p className="mt-3 text-[14px] text-foreground/75">{config.description}</p>
        </div>

        <div className="grid gap-4 lg:grid-cols-[1fr_1.2fr_1fr] lg:items-stretch">
          <div className="space-y-4">
            {(config.items || []).slice(0, 3).map(({ title, text, icon }) => (
              <div key={title} className="flex gap-3 rounded-[4px] border border-border bg-surface p-4">
                <div className="mt-1 flex h-10 w-10 items-center justify-center rounded-[4px] bg-surface-muted text-foreground">
                  {(() => { const Icon=icons[icon as keyof typeof icons] || ShieldCheck; return <Icon className="h-4 w-4" />; })()}
                </div>
                <div>
                  <h3 className="text-[12px] font-bold uppercase tracking-[0.08em] text-foreground">{title}</h3>
                  <p className="mt-1 text-[12px] leading-5 text-muted">{text}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="relative min-h-[320px] overflow-hidden rounded-[4px]">
            <Image src={config.image || "/images/zalmi-logo.png"} alt={title} fill sizes="(min-width: 1024px) 40vw, 100vw" className="object-contain" />
          </div>

          <div className="space-y-4">
            {(config.items || []).slice(3).map(({ title, text, icon }) => (
              <div key={title} className="flex gap-3 rounded-[4px] border border-border bg-surface p-4">
                <div className="mt-1 flex h-10 w-10 items-center justify-center rounded-[4px] bg-surface-muted text-foreground">
                  {(() => { const Icon=icons[icon as keyof typeof icons] || ShieldCheck; return <Icon className="h-4 w-4" />; })()}
                </div>
                <div>
                  <h3 className="text-[12px] font-bold uppercase tracking-[0.08em] text-foreground">{title}</h3>
                  <p className="mt-1 text-[12px] leading-5 text-muted">{text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

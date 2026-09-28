import { ShieldCheck, Truck, Headphones, RefreshCw } from "lucide-react";

const icons = { ShieldCheck, Truck, Headphones, RefreshCw };
import type { SectionConfig } from "@/lib/validation";

export function TrustStrip({ items }: { items: NonNullable<SectionConfig["items"]> }) {
  return (
    <section className="bg-brand">
      <div className="container-shell grid gap-3 py-5 text-foreground md:grid-cols-2 xl:grid-cols-4">
        {items.map(({ title, text, icon }) => (
          <div key={title} className="flex items-center gap-3 border border-brand-hover bg-brand px-2 py-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full border border-[#1f1f1f]/20 bg-surface/20">
              {(() => { const Icon=icons[icon as keyof typeof icons] || ShieldCheck; return <Icon className="h-4 w-4" />; })()}
            </div>
            <div>
              <div className="text-[11px] font-bold uppercase tracking-[0.08em]">{title}</div>
              <div className="mt-1 text-[11px] text-foreground/75">{text}</div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

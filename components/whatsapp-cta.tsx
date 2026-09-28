import { MessageCircleMore, Phone } from "lucide-react";

import type { SectionConfig, StoreSettings } from "@/lib/validation";
export function WhatsAppCTA({ title, config, settings }: { title: string; config: SectionConfig; settings: StoreSettings }) {
  return (
    <section className="bg-success/10">
      <div className="container-shell grid gap-6 py-8 md:grid-cols-[auto_1fr_auto] md:items-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-success text-white">
          <MessageCircleMore className="h-7 w-7" />
        </div>
        <div>
          <h3 className="text-[20px] font-bold tracking-[-0.05em] text-foreground">{title}</h3>
          <p className="mt-2 text-[14px] text-muted">
            {config.description}
          </p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <a href={`https://wa.me/${settings.whatsapp.replace(/\D/g, "")}`} className="inline-flex items-center gap-2 bg-success px-5 py-3 text-[11px] font-bold uppercase tracking-[0.12em] text-white">
            <Phone className="h-4 w-4" />
            {config.buttonLabel}
          </a>
          <div className="text-[13px] font-semibold text-foreground">{settings.phone}</div>
        </div>
      </div>
    </section>
  );
}

export function AnnouncementBar({ text }: { text: string }) {
  return (
    <div className="bg-brand text-foreground">
      <div className="container-shell flex h-9 items-center justify-center text-center text-[11px] font-semibold uppercase tracking-[0.12em]">
        {text}
      </div>
    </div>
  );
}

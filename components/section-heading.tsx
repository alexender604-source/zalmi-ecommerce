type SectionHeadingProps = {
  eyebrow?: string;
  title: string;
  centered?: boolean;
  withLink?: boolean;
  href?: string;
};

export function SectionHeading({ eyebrow, title, centered = false, withLink = false, href = "/shop" }: SectionHeadingProps) {
  return (
    <div className={centered ? "text-center" : "text-left"}>
      {eyebrow ? (
        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted">{eyebrow}</p>
      ) : null}
      <h2 className="mt-2 text-[28px] font-bold tracking-[-0.05em] text-foreground">{title}</h2>
      {withLink ? <a href={href} className="mt-3 inline-block text-[11px] font-semibold uppercase tracking-[0.12em] text-foreground">View all</a> : null}
    </div>
  );
}

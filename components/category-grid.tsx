import Image from "next/image";
import type { Category } from "@prisma/client";

export function CategoryGrid({ categories }: { categories: Category[] }) {
  return (
    <div className="mt-8 grid gap-4 md:grid-cols-3">
      {categories.map((category, index) => (
        <article key={category.id} className={"relative isolate overflow-hidden rounded-[4px] bg-brand-secondary p-6 text-white " + (index === 0 ? "md:col-span-3" : "")}>
          {category.image && <Image src={category.image} alt={category.name} fill sizes={index === 0 ? "100vw" : "(min-width: 768px) 33vw, 100vw"} className="-z-20 object-cover" />}
          <div className="absolute inset-0 -z-10 bg-gradient-to-t from-black/85 via-black/10 to-transparent" />
          <div className="flex min-h-[300px] flex-col justify-end">
            <p className="text-[11px] font-semibold uppercase tracking-[0.12em]">Featured Collection</p>
            <h3 className="mt-3 text-[26px] font-bold tracking-[-0.04em]">{category.name.replace(" collection", "")}</h3>
            <a href={`/category/${category.slug}`} className="mt-5 w-fit border border-white bg-surface px-4 py-2 text-[10px] font-bold uppercase tracking-[0.12em] text-foreground">Explore</a>
          </div>
        </article>
      ))}
    </div>
  );
}

import Image from "next/image";
import type { Review } from "@prisma/client";

function Stars({ rating = 5 }: { rating?: number }) {
  return (
    <div className="mt-2 flex gap-1" aria-label={`${rating} out of 5 stars`}>
      {Array.from({ length: rating }, (_, index) => (
        <Image key={index} src="/images/catalog/google-star-1.svg" alt="" width={17} height={17} />
      ))}
    </div>
  );
}

export function ReviewCarousel({ reviews }: { reviews: Review[] }) {
  return (
    <div className="mt-8">
      <div className="flex snap-x snap-mandatory gap-4 overflow-x-auto pb-4" tabIndex={0} role="region" aria-label="Customer reviews">
        {reviews.map((review) => (
          <article key={review.id} className="w-[85%] shrink-0 snap-start rounded-[4px] border border-border bg-surface p-5 sm:w-[45%] lg:w-[calc(25%-12px)]">
            <div className="flex items-center gap-3">
              {review.avatar && <Image src={review.avatar} alt={review.name + " profile picture"} width={40} height={40} className="rounded-full" />}
              <p className="flex-1 text-[13px] font-semibold">{review.name}</p>
              {review.source === "Google" && <Image src="/images/catalog/google.svg" alt="Google" width={20} height={20} />}
            </div>
            <Stars rating={review.rating} />
            <p className="mt-4 text-[13px] leading-6 text-muted">{review.content}</p>
          </article>
        ))}
      </div>
    </div>
  );
}

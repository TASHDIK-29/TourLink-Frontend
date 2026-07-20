"use client";

import { motion } from "framer-motion";
import { Quote, Star } from "lucide-react";
import { Skeleton } from "@/components/ui/Skeleton";
import { useGetToursQuery } from "@/redux/features/tour/tourApi";
import { cn } from "@/lib/utils";

/**
 * ⚠️ PLACEHOLDER CONTENT — these reviewers and quotes are invented.
 *
 * The backend has no review module, so there is nothing real to render here.
 * Each entry is paired with a REAL tour from the catalogue by index, so the
 * section looks alive on a demo, but nothing below is a genuine customer
 * opinion. Replace this component wholesale once a review API exists; do not
 * ship it to a production site where visitors would read it as real feedback.
 */
const PLACEHOLDER_REVIEWS = [
  {
    name: "Nusrat Jahan",
    initials: "NJ",
    rating: 5,
    quote:
      "The itinerary was paced perfectly — enough time at each stop to actually enjoy it instead of rushing for photos. Our guide knew every shortcut.",
  },
  {
    name: "Tanvir Ahmed",
    initials: "TA",
    rating: 5,
    quote:
      "Booking took two minutes and the invoice landed in my inbox before we'd left the house. Everything ran exactly to the schedule we were sent.",
  },
  {
    name: "Farhana Rahman",
    initials: "FR",
    rating: 4,
    quote:
      "Beautiful trip and genuinely good value. The morning start was earlier than I'd have liked, but it meant we beat the crowds completely.",
  },
  {
    name: "Sabbir Hossain",
    initials: "SH",
    rating: 5,
    quote:
      "Third trip I've booked here. The guides are the reason — they treat you like a guest, not a ticket number.",
  },
  {
    name: "Mehjabin Chowdhury",
    initials: "MC",
    rating: 5,
    quote:
      "Went solo and never felt out of place. Small group, easy company, and the accommodation was better than the photos suggested.",
  },
  {
    name: "Rakibul Islam",
    initials: "RI",
    rating: 4,
    quote:
      "Clear pricing with no surprises at the end, which is rarer than it should be. Would happily book the same route again.",
  },
];

export function Reviews() {
  // limit=6 so each placeholder review can be attached to a real tour title.
  const { data, isLoading } = useGetToursQuery({ limit: 6 });
  const tours = data?.tours ?? [];

  // Nothing to anchor the reviews to — better to show no section than
  // testimonials about tours that don't exist.
  if (!isLoading && !tours.length) return null;

  const reviews = PLACEHOLDER_REVIEWS.slice(0, Math.max(tours.length, 3)).map(
    (review, i) => ({ ...review, tour: tours[i] }),
  );

  return (
    <section className="bg-muted/40 py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <h2 className="text-2xl font-bold sm:text-3xl">What travellers say</h2>
        <p className="mt-1 text-muted-foreground">
          Recent feedback from trips across the country.
        </p>

        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {isLoading
            ? Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-52 rounded-card" />
              ))
            : reviews.map((review, i) => (
                <motion.figure
                  key={review.name}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-60px" }}
                  transition={{
                    duration: 0.35,
                    delay: Math.min(i * 0.05, 0.3),
                  }}
                  className="flex h-full flex-col rounded-card border border-border bg-card p-5"
                >
                  <Quote
                    aria-hidden
                    className="h-5 w-5 shrink-0 text-primary/40"
                  />

                  <div
                    className="mt-3 flex items-center gap-0.5"
                    aria-label={`${review.rating} out of 5 stars`}
                  >
                    {Array.from({ length: 5 }).map((_, star) => (
                      <Star
                        key={star}
                        aria-hidden
                        className={cn(
                          "h-3.5 w-3.5",
                          star < review.rating
                            ? "fill-amber-400 text-amber-400"
                            : "text-muted-foreground/30",
                        )}
                      />
                    ))}
                  </div>

                  <blockquote className="mt-3 flex-1 text-sm leading-relaxed text-muted-foreground">
                    {review.quote}
                  </blockquote>

                  <figcaption className="mt-5 flex items-center gap-3 border-t border-border pt-4">
                    <span
                      aria-hidden
                      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary"
                    >
                      {review.initials}
                    </span>
                    <span className="min-w-0">
                      <span className="block truncate text-sm font-medium">
                        {review.name}
                      </span>
                      {review.tour && (
                        <span className="block truncate text-xs text-muted-foreground">
                          {review.tour.title}
                        </span>
                      )}
                    </span>
                  </figcaption>
                </motion.figure>
              ))}
        </div>
      </div>
    </section>
  );
}

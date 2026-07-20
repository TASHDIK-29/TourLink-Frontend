"use client";

import { motion } from "framer-motion";
import { Languages, MapPin, Star } from "lucide-react";
import { Skeleton } from "@/components/ui/Skeleton";
import { useGetDivisionsQuery } from "@/redux/features/division/divisionApi";

/**
 * ⚠️ PLACEHOLDER CONTENT — these guides are invented.
 *
 * The backend has a GUIDE role but no guide-profile or assignment endpoints,
 * so there is no real roster to read. Each entry is paired with a REAL division
 * by index, so the section reflects the actual catalogue's geography while the
 * people themselves are fictional. No photographs are used — initials avatars
 * only, so nobody's likeness is misrepresented.
 *
 * Replace once guide profiles exist on the backend.
 */
const PLACEHOLDER_GUIDES = [
  {
    name: "Imran Kabir",
    initials: "IK",
    specialty: "Hill tracks & trekking",
    years: 9,
    languages: "Bangla, English",
    rating: "4.9",
  },
  {
    name: "Shirin Akter",
    initials: "SA",
    specialty: "Tea gardens & waterfalls",
    years: 7,
    languages: "Bangla, English, Hindi",
    rating: "4.8",
  },
  {
    name: "Nayeem Chowdhury",
    initials: "NC",
    specialty: "Coastal & island routes",
    years: 11,
    languages: "Bangla, English",
    rating: "5.0",
  },
  {
    name: "Rumana Haque",
    initials: "RH",
    specialty: "Heritage & architecture",
    years: 6,
    languages: "Bangla, English",
    rating: "4.7",
  },
  {
    name: "Arif Mahmud",
    initials: "AM",
    specialty: "Wetlands & birdwatching",
    years: 8,
    languages: "Bangla, English",
    rating: "4.9",
  },
  {
    name: "Sadia Noor",
    initials: "SN",
    specialty: "Forest & wildlife trails",
    years: 5,
    languages: "Bangla, English",
    rating: "4.8",
  },
];

export function Guides() {
  const { data: divisions, isLoading } = useGetDivisionsQuery();

  // One guide per real division, so the roster never claims coverage of a
  // region that isn't in the catalogue.
  const guides = (divisions ?? [])
    .slice(0, 4)
    .map((division, i) => ({ ...PLACEHOLDER_GUIDES[i], division }));

  if (!isLoading && !guides.length) return null;

  return (
    <section className="py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <h2 className="text-2xl font-bold sm:text-3xl">Meet our guides</h2>
        <p className="mt-1 text-muted-foreground">
          Local experts who know their region street by street.
        </p>

        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {isLoading
            ? Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-56 rounded-card" />
              ))
            : guides.map((guide, i) => (
                <motion.article
                  key={guide.name}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-60px" }}
                  transition={{
                    duration: 0.35,
                    delay: Math.min(i * 0.05, 0.3),
                  }}
                  className="rounded-card border border-border bg-card p-5 text-center"
                >
                  <span
                    aria-hidden
                    className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-lg font-semibold text-primary"
                  >
                    {guide.initials}
                  </span>

                  <h3 className="mt-4 font-semibold">{guide.name}</h3>

                  <p className="mt-1 flex items-center justify-center gap-1 text-sm text-muted-foreground">
                    <MapPin aria-hidden className="h-3.5 w-3.5 shrink-0" />
                    <span className="truncate">{guide.division.name}</span>
                  </p>

                  <p className="mt-3 text-sm text-muted-foreground">
                    {guide.specialty}
                  </p>

                  <dl className="mt-4 space-y-1.5 border-t border-border pt-4 text-xs text-muted-foreground">
                    <div className="flex items-center justify-center gap-1.5">
                      <Star
                        aria-hidden
                        className="h-3.5 w-3.5 shrink-0 fill-amber-400 text-amber-400"
                      />
                      <dt className="sr-only">Rating</dt>
                      <dd>
                        <span className="font-medium text-foreground">
                          {guide.rating}
                        </span>{" "}
                        · {guide.years} yrs guiding
                      </dd>
                    </div>
                    <div className="flex items-center justify-center gap-1.5">
                      <Languages aria-hidden className="h-3.5 w-3.5 shrink-0" />
                      <dt className="sr-only">Languages</dt>
                      <dd className="truncate">{guide.languages}</dd>
                    </div>
                  </dl>
                </motion.article>
              ))}
        </div>
      </div>
    </section>
  );
}

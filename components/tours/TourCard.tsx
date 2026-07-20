"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { format } from "date-fns";
import { MapPin, Users } from "lucide-react";
import type { ITour } from "@/types";
import { formatCurrency } from "@/lib/utils";

export function TourCard({ tour, index = 0 }: { tour: ITour; index?: number }) {
  const cover = tour.images?.[0];

  return (
    <motion.article
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.35, delay: Math.min(index * 0.05, 0.3) }}
    >
      <Link href={`/tours/${tour.slug}`} className="group block">
        <div className="relative aspect-[4/3] overflow-hidden rounded-card bg-muted">
          {cover ? (
            <Image
              src={cover}
              alt={tour.title}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
              className="object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-muted-foreground">
              <MapPin className="h-8 w-8" />
            </div>
          )}
        </div>

        <div className="mt-3 space-y-1">
          <h3 className="truncate font-semibold text-foreground">
            {tour.title}
          </h3>

          {tour.location && (
            <p className="flex items-center gap-1 truncate text-sm text-muted-foreground">
              <MapPin className="h-3.5 w-3.5 shrink-0" />
              {tour.location}
            </p>
          )}

          <div className="flex items-center gap-3 text-sm text-muted-foreground">
            {tour.startDate && (
              <span>{format(new Date(tour.startDate), "MMM d, yyyy")}</span>
            )}
            {tour.maxGuest != null && (
              <span className="flex items-center gap-1">
                <Users className="h-3.5 w-3.5" />
                {tour.maxGuest}
              </span>
            )}
          </div>

          <p className="pt-0.5 text-sm">
            <span className="font-semibold text-foreground">
              {formatCurrency(tour.costFrom)}
            </span>
            <span className="text-muted-foreground"> / person</span>
          </p>
        </div>
      </Link>
    </motion.article>
  );
}

export function TourCardSkeleton() {
  return (
    <div className="space-y-3">
      <div className="aspect-[4/3] animate-pulse rounded-card bg-muted" />
      <div className="h-4 w-3/4 animate-pulse rounded bg-muted" />
      <div className="h-3 w-1/2 animate-pulse rounded bg-muted" />
      <div className="h-3 w-1/3 animate-pulse rounded bg-muted" />
    </div>
  );
}

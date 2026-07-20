"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { MapPin } from "lucide-react";
import { useGetDivisionsQuery } from "@/redux/features/division/divisionApi";
import { Skeleton } from "@/components/ui/Skeleton";

export function PopularDivisions() {
  const { data: divisions, isLoading } = useGetDivisionsQuery();

  if (!isLoading && !divisions?.length) return null;

  return (
    <section className="bg-muted/40 py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <h2 className="text-2xl font-bold sm:text-3xl">Explore destinations</h2>
        <p className="mt-1 text-muted-foreground">
          Every division has a story. Pick where yours begins.
        </p>

        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {isLoading
            ? Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="aspect-[3/2] rounded-card" />
              ))
            : divisions?.map((division, i) => (
                <motion.div
                  key={division._id}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-60px" }}
                  transition={{ duration: 0.35, delay: Math.min(i * 0.05, 0.3) }}
                >
                  <Link
                    href={`/tours?division=${division._id}`}
                    className="group relative block aspect-[3/2] overflow-hidden rounded-card bg-muted"
                  >
                    {division.thumbnail ? (
                      <Image
                        src={division.thumbnail}
                        alt={division.name}
                        fill
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-muted-foreground">
                        <MapPin className="h-8 w-8" />
                      </div>
                    )}
                    <div
                      aria-hidden
                      className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent"
                    />
                    <h3 className="absolute bottom-3 left-4 text-lg font-semibold text-white">
                      {division.name}
                    </h3>
                  </Link>
                </motion.div>
              ))}
        </div>
      </div>
    </section>
  );
}

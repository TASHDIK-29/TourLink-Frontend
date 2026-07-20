"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { motion } from "framer-motion";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useGetDivisionsQuery } from "@/redux/features/division/divisionApi";

export function Hero() {
  const router = useRouter();
  const { data: divisions } = useGetDivisionsQuery();

  const [searchTerm, setSearchTerm] = useState("");
  const [division, setDivision] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (searchTerm.trim()) params.set("searchTerm", searchTerm.trim());
    if (division) params.set("division", division);
    router.push(`/tours${params.toString() ? `?${params}` : ""}`);
  };

  return (
    <section className="relative overflow-hidden">
      {/* Decorative gradient wash; hidden from AT since it carries no meaning. */}
      <div
        aria-hidden
        className="absolute inset-0 -z-10 bg-gradient-to-b from-primary/10 via-background to-background"
      />

      <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-28">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mx-auto max-w-3xl text-center"
        >
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
            Find your next{" "}
            <span className="text-primary">unforgettable</span> journey
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-lg text-muted-foreground">
            Handpicked tours across Bangladesh — from the hills of Bandarban to
            the beaches of Cox&apos;s Bazar.
          </p>
        </motion.div>

        <motion.form
          onSubmit={handleSearch}
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.15 }}
          className="mx-auto mt-10 flex max-w-3xl flex-col gap-2 rounded-3xl border border-border bg-card p-2 shadow-lg sm:flex-row sm:items-center sm:rounded-full"
        >
          <div className="flex flex-1 items-center gap-2 px-4">
            <Search className="h-5 w-5 shrink-0 text-muted-foreground" />
            <input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search tours, places, activities…"
              aria-label="Search tours"
              className="h-12 w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
            />
          </div>

          <div className="sm:border-l sm:border-border sm:pl-2">
            <select
              value={division}
              onChange={(e) => setDivision(e.target.value)}
              aria-label="Filter by destination"
              className="h-12 w-full cursor-pointer rounded-full bg-transparent px-4 text-sm outline-none sm:w-44"
            >
              <option value="">Anywhere</option>
              {divisions?.map((d) => (
                <option key={d._id} value={d._id}>
                  {d.name}
                </option>
              ))}
            </select>
          </div>

          <Button type="submit" size="lg" className="sm:px-8">
            Search
          </Button>
        </motion.form>
      </div>
    </section>
  );
}

import { Hero } from "@/components/home/Hero";
import { FeaturedTours } from "@/components/home/FeaturedTours";
import { PopularDivisions } from "@/components/home/PopularDivisions";
import { ValueProps } from "@/components/home/ValueProps";
import { Reviews } from "@/components/home/Reviews";
import { Guides } from "@/components/home/Guides";
import { Faq } from "@/components/home/Faq";

export default function HomePage() {
  // Alternating surfaces: sections on bg-muted/40 (PopularDivisions, Reviews)
  // are interleaved with plain ones so the page reads as distinct bands.
  return (
    <>
      <Hero />
      <FeaturedTours />
      <PopularDivisions />
      <Guides />
      <Reviews />
      <ValueProps />
      <Faq />
    </>
  );
}

import type { Metadata } from "next";
import { DivisionsBrowser } from "@/components/divisions/DivisionsBrowser";

export const metadata: Metadata = {
  title: "Destinations",
  description:
    "Browse every division of Bangladesh and the tours departing from each.",
};

export default function DivisionsPage() {
  return <DivisionsBrowser />;
}

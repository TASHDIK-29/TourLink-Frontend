"use client";

import { motion } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { SITE_NAME } from "@/lib/config";

/**
 * Answers reflect how the system actually behaves — booking requires a phone
 * and address, payment goes through SSLCommerz, invoices are emailed on
 * success. Keep them in sync if those flows change.
 */
const FAQS = [
  {
    q: "How do I book a tour?",
    a: `Open any tour, choose your guest count and confirm. You'll need a phone number and address on your ${SITE_NAME} profile first — we pass them to the payment gateway — and we'll prompt you for both if they're missing.`,
  },
  {
    q: "Which payment methods can I use?",
    a: "Checkout runs through SSLCommerz, so any card, mobile wallet or internet-banking method it supports will work. You're taken to their secure page and returned here once the payment resolves.",
  },
  {
    q: "Can I pay for a booking later?",
    a: "Yes. A booking is created as soon as you confirm it, and stays unpaid until you're ready. Open My bookings and use Pay now on any unpaid trip to reopen the checkout — the same booking, not a new one.",
  },
  {
    q: "How do I get my invoice?",
    a: "We email a PDF invoice the moment a payment succeeds. You can also download it any time from My bookings, next to the trip it belongs to.",
  },
  {
    q: "Can I cancel a booking?",
    a: "You can cancel any booking that's still pending or has a failed payment, straight from My bookings. Once a trip is complete it can't be cancelled from the site — contact support about a refund instead.",
  },
  {
    q: "Do I need an account to browse?",
    a: "You can browse the catalogue and destinations freely. Opening a tour's full details — the itinerary, what's included and pricing — requires a free account, as does booking.",
  },
];

export function Faq() {
  return (
    <section className="py-16">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <h2 className="text-2xl font-bold sm:text-3xl">
          Frequently asked questions
        </h2>
        <p className="mt-1 text-muted-foreground">
          The things travellers ask us most.
        </p>

        <div className="mt-8 space-y-3">
          {FAQS.map((faq, i) => (
            <motion.details
              key={faq.q}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.3, delay: Math.min(i * 0.04, 0.2) }}
              // <details>/<summary> gives keyboard support, screen-reader
              // semantics and open/close state for free — no ARIA to get wrong.
              className="group overflow-hidden rounded-card border border-border bg-card"
            >
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 p-5 font-medium [&::-webkit-details-marker]:hidden">
                {faq.q}
                <ChevronDown
                  aria-hidden
                  className="h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200 group-open:rotate-180"
                />
              </summary>
              <p className="px-5 pb-5 text-sm leading-relaxed text-muted-foreground">
                {faq.a}
              </p>
            </motion.details>
          ))}
        </div>
      </div>
    </section>
  );
}

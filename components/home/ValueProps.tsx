import { ShieldCheck, Sparkles, Wallet } from "lucide-react";

const ITEMS = [
  {
    icon: Sparkles,
    title: "Curated trips",
    body: "Every tour is reviewed before it goes live, so you only see trips worth taking.",
  },
  {
    icon: ShieldCheck,
    title: "Secure checkout",
    body: "Payments run through SSLCommerz. Your card details never touch our servers.",
  },
  {
    icon: Wallet,
    title: "Clear pricing",
    body: "What's included and what isn't is listed up front — no surprises at the counter.",
  },
];

export function ValueProps() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="grid gap-8 sm:grid-cols-3">
        {ITEMS.map(({ icon: Icon, title, body }) => (
          <div key={title}>
            <span className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-full bg-primary/10 text-primary">
              <Icon className="h-5 w-5" />
            </span>
            <h3 className="font-semibold">{title}</h3>
            <p className="mt-1 text-sm text-muted-foreground">{body}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

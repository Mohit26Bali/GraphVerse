import Link from "next/link";
import { Button } from "@/components/ui/button";
import { HeroVideo } from "@/components/landing/HeroVideo";
import { modules } from "@/modules";

// Only numbers the app can back up.
const STATS = [
  { label: "Modules", value: String(modules.length) },
  { label: "Tabs in each", value: "3" },
  { label: "Free sandbox", value: "1" },
  { label: "Sign-ups", value: "0" },
];

export function Hero() {
  return (
    <section className="relative flex min-h-[92vh] flex-col items-center justify-end overflow-hidden border-b border-border">
      <HeroVideo />
      <div
        aria-hidden
        className="absolute inset-0 bg-linear-to-b from-transparent via-background/60 to-background"
      />

      <div className="relative mx-auto flex max-w-4xl flex-col items-center gap-8 px-6 pb-6 text-center">
        <div className="flex flex-col gap-3 sm:flex-row">
          <Button size="lg" render={<Link href="#modules" />} nativeButton={false}>
            Start Learning
          </Button>
          <Button size="lg" variant="outline" render={<Link href="/sandbox" />} nativeButton={false}>
            Explore Sandbox
          </Button>
        </div>

        <dl className="grid w-full max-w-2xl grid-cols-2 gap-6 border-t border-border pt-8 sm:grid-cols-4">
          {STATS.map((stat) => (
            <div key={stat.label} className="flex flex-col gap-1">
              <dt className="text-xs uppercase tracking-wide text-muted-foreground">{stat.label}</dt>
              <dd className="font-mono text-lg font-medium">{stat.value}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}

import Link from "next/link";
import { modules } from "@/modules";
import { CATEGORY_LABELS, type ModuleCategory } from "@/types/module";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";

const CATEGORY_ORDER: ModuleCategory[] = [
  "foundations",
  "algebra",
  "trigonometry",
  "analysis",
  "advanced",
];

export function LearningPath() {
  return (
    <section id="modules" className="border-b border-border">
      <div className="mx-auto max-w-5xl px-6 py-16">
        <div className="mb-10 flex max-w-2xl flex-col gap-2">
          <h2 className="text-3xl font-semibold tracking-tight">Learning path</h2>
          <p className="text-lg text-muted-foreground">
            {modules.length} modules, grouped the way you&apos;d actually work through them.
          </p>
        </div>

        <Accordion defaultValue={["foundations"]}>
          {CATEGORY_ORDER.map((category) => {
            const items = modules.filter((m) => m.category === category);
            return (
              <AccordionItem key={category} value={category}>
                <AccordionTrigger>
                  <span className="flex items-center gap-2 text-base font-medium tracking-tight">
                    {CATEGORY_LABELS[category]}
                    <span className="font-mono text-sm text-muted-foreground">({items.length})</span>
                  </span>
                </AccordionTrigger>
                <AccordionContent>
                  <ul className="flex flex-col divide-y divide-border rounded-lg border border-border">
                    {items.map((mod) => (
                      <li key={mod.id}>
                        <Link
                          href={`/modules/${mod.slug}`}
                          className="flex items-center gap-4 px-4 py-3 transition-colors hover:bg-card"
                        >
                          <span className="w-6 shrink-0 font-mono text-sm text-muted-foreground">
                            {String(mod.order).padStart(2, "0")}
                          </span>
                          <div className="flex-1">
                            <p className="text-base font-medium tracking-tight">{mod.title}</p>
                            <p className="text-sm text-muted-foreground">{mod.summary}</p>
                          </div>
                          <span
                            className={
                              mod.status === "available"
                                ? "h-1.5 w-1.5 shrink-0 rounded-full bg-chart-1"
                                : "h-1.5 w-1.5 shrink-0 rounded-full bg-muted-foreground/30"
                            }
                            title={mod.status === "available" ? "Available" : "Coming soon"}
                          />
                          <span className="sr-only">
                            {mod.status === "available" ? "Available" : "Coming soon"}
                          </span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </AccordionContent>
              </AccordionItem>
            );
          })}
        </Accordion>
      </div>
    </section>
  );
}

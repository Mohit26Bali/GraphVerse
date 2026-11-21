import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { CATEGORY_LABELS, type ModuleCategory } from "@/types/module";
import { HelpCircle } from "lucide-react";

export interface ModuleHelp {
  /** What this module covers. */
  what: string;
  /** Why it matters / what intuition it builds. */
  why: string;
  /** How to use the Explore/Practice/Sandbox tabs. */
  how: string;
}

export interface ModuleHeaderProps {
  order: number;
  category: ModuleCategory;
  title: string;
  help: ModuleHelp;
}

export function ModuleHeader({ order, category, title, help }: ModuleHeaderProps) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-border px-6 py-4">
      <div>
        <p className="text-xs uppercase tracking-wide text-muted-foreground">
          Module {String(order).padStart(2, "0")} · {CATEGORY_LABELS[category]}
        </p>
        <h1 className="text-xl font-semibold tracking-tight">{title}</h1>
      </div>

      <Popover>
        <PopoverTrigger
          aria-label={`About ${title}`}
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-border text-muted-foreground transition-colors hover:border-foreground/30 hover:text-foreground"
        >
          <HelpCircle className="h-4 w-4" />
        </PopoverTrigger>
        <PopoverContent align="end" className="w-80">
          <div className="flex flex-col gap-3">
            <section>
              <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">What</p>
              <p className="mt-1 text-sm">{help.what}</p>
            </section>
            <section>
              <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                Why it matters
              </p>
              <p className="mt-1 text-sm">{help.why}</p>
            </section>
            <section>
              <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                How to use it
              </p>
              <p className="mt-1 text-sm">{help.how}</p>
            </section>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}

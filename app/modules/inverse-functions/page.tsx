import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ModuleHeader } from "@/components/shared/ModuleHeader";
import { InverseExplore } from "@/modules/inverse-functions/InverseExplore";
import { InversePractice } from "@/modules/inverse-functions/InversePractice";
import { InverseSandbox } from "@/modules/inverse-functions/InverseSandbox";

export default function InverseFunctionsPage() {
  return (
    <div className="flex h-[calc(100dvh-3.5rem)] flex-col">
      <ModuleHeader
        order={13}
        category="analysis"
        title="Inverse Functions"
        help={{
          what: "Reflecting a function across y = x to undo it — and the catch: not every function has an inverse that's also a function, unless it's one-to-one (passes the horizontal line test).",
          why: "This generalizes what the Logarithms module showed for one specific pair (eˣ and ln x) to any function — and surfaces the part that pair conveniently skipped: x² and |x| aren't naturally invertible at all, and \"restricting the domain\" is the standard fix, not an edge case.",
          how: "Explore: pick a function, see whether it passes the horizontal line test (conflicting points marked in red if not), toggle a domain restriction to fix it, then press Reflect to watch it mirror across y = x. Practice: drag a domain boundary until a given function becomes genuinely invertible. Sandbox: type any function, set your own domain, and check + reflect it.",
        }}
      />

      <Tabs defaultValue="explore" className="min-h-0 flex-1">
        <TabsList className="mx-6 mt-3 self-start">
          <TabsTrigger value="explore">Explore</TabsTrigger>
          <TabsTrigger value="practice">Practice</TabsTrigger>
          <TabsTrigger value="sandbox">Sandbox</TabsTrigger>
        </TabsList>

        <TabsContent value="explore" className="min-h-0 h-full">
          <InverseExplore />
        </TabsContent>
        <TabsContent value="practice" className="min-h-0 h-full">
          <InversePractice />
        </TabsContent>
        <TabsContent value="sandbox" className="min-h-0 h-full">
          <InverseSandbox />
        </TabsContent>
      </Tabs>
    </div>
  );
}

import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ModuleHeader } from "@/components/shared/ModuleHeader";
import { DerivativeExplore } from "@/modules/derivatives/DerivativeExplore";
import { DerivativePractice } from "@/modules/derivatives/DerivativePractice";
import { DerivativeSandbox } from "@/modules/derivatives/DerivativeSandbox";

export default function DerivativesPage() {
  return (
    <div className="flex h-[calc(100dvh-3.5rem)] flex-col">
      <ModuleHeader
        order={15}
        category="analysis"
        title="Derivatives"
        help={{
          what: "The rate of change of a function at a point — the slope of its tangent line — and how that slope traces out an entirely new function, f'(x), as the point moves.",
          why: "The derivative is the mathematical answer to \"how fast is this changing right now,\" and it's built directly from the limit concept from the last module (it's literally the limit of the slope between two points as they get infinitely close). Watching the tangent line rotate while a second graph draws itself is the clearest way to see that f'(x) isn't a separate topic — it's just \"the slope of f, plotted.\"",
          how: "Explore: pick a function, press Play to sweep a point across it while the tangent line updates and f'(x) draws in alongside, or drag the point yourself. Practice: three modes — estimate a tangent slope, solve a related-rates problem (a sliding ladder), or find the width that maximizes a fenced area. Sandbox: type any function and see its exact derivative, computed symbolically, plotted live.",
        }}
      />

      <Tabs defaultValue="explore" className="min-h-0 flex-1">
        <TabsList className="mx-6 mt-3 self-start">
          <TabsTrigger value="explore">Explore</TabsTrigger>
          <TabsTrigger value="practice">Practice</TabsTrigger>
          <TabsTrigger value="sandbox">Sandbox</TabsTrigger>
        </TabsList>

        <TabsContent value="explore" className="min-h-0 h-full">
          <DerivativeExplore />
        </TabsContent>
        <TabsContent value="practice" className="min-h-0 h-full">
          <DerivativePractice />
        </TabsContent>
        <TabsContent value="sandbox" className="min-h-0 h-full">
          <DerivativeSandbox />
        </TabsContent>
      </Tabs>
    </div>
  );
}

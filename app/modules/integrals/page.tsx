import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ModuleHeader } from "@/components/shared/ModuleHeader";
import { IntegralExplore } from "@/modules/integrals/IntegralExplore";
import { IntegralPractice } from "@/modules/integrals/IntegralPractice";
import { IntegralSandbox } from "@/modules/integrals/IntegralSandbox";

export default function IntegralsPage() {
  return (
    <div className="flex h-[calc(100dvh-3.5rem)] flex-col">
      <ModuleHeader
        order={16}
        category="analysis"
        title="Integrals"
        help={{
          what: "The area between a curve and the x-axis, approximated by rectangles (Riemann sums) and accumulated as a running total: A(x) = the net area from a fixed starting point up to x.",
          why: "If derivatives answer \"how fast is this changing,\" integrals answer the reverse: \"how much has accumulated so far.\" Area below the axis counts as negative — net area, not total shaded region — which is the detail that trips people up first.",
          how: "Explore: watch the rectangle approximation tighten toward the true area as you increase the rectangle count, and press Play to watch the accumulation function A(x) draw itself in as x sweeps forward. Practice: estimate a net area by eye. Sandbox: type any function, set your own bounds, and see both the rectangles and the accumulation curve live.",
        }}
      />

      <Tabs defaultValue="explore" className="min-h-0 flex-1">
        <TabsList className="mx-6 mt-3 self-start">
          <TabsTrigger value="explore">Explore</TabsTrigger>
          <TabsTrigger value="practice">Practice</TabsTrigger>
          <TabsTrigger value="sandbox">Sandbox</TabsTrigger>
        </TabsList>

        <TabsContent value="explore" className="min-h-0 h-full">
          <IntegralExplore />
        </TabsContent>
        <TabsContent value="practice" className="min-h-0 h-full">
          <IntegralPractice />
        </TabsContent>
        <TabsContent value="sandbox" className="min-h-0 h-full">
          <IntegralSandbox />
        </TabsContent>
      </Tabs>
    </div>
  );
}

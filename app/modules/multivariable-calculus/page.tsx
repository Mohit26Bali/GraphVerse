import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ModuleHeader } from "@/components/shared/ModuleHeader";
import { MultivariableExplore } from "@/modules/multivariable-calculus/MultivariableExplore";
import { MultivariablePractice } from "@/modules/multivariable-calculus/MultivariablePractice";
import { MultivariableSandbox } from "@/modules/multivariable-calculus/MultivariableSandbox";

export default function MultivariableCalculusPage() {
  return (
    <div className="flex h-[calc(100dvh-3.5rem)] flex-col">
      <ModuleHeader
        order={22}
        category="advanced"
        title="Multivariable Calculus"
        help={{
          what: "What happens to derivatives and integrals once a function takes two inputs instead of one — a curve becomes a landscape (shown here as a colored contour map), and 'slope' splits into a whole vector of directions.",
          why: "Every calculus idea so far — slope, area, rate of change — has lived on a single curve. Almost everything calculus gets used for in the real world (physics, machine learning, economics) actually happens in more than one variable. This is the bridge from 'one input' to 'several,' using the same slope and area ideas you already have.",
          how: "Explore: pick a surface, click anywhere on the contour map to drop a probe point, and watch the two slice graphs (fixing x, fixing y) show the partial derivatives as ordinary tangent lines — the white arrow is the gradient, pointing in the steepest direction. Practice: find a surface's critical point, then classify it as a min, max, or saddle. Sandbox: type any f(x,y) and probe it the same way.",
        }}
      />

      <Tabs defaultValue="explore" className="min-h-0 flex-1">
        <TabsList className="mx-6 mt-3 self-start">
          <TabsTrigger value="explore">Explore</TabsTrigger>
          <TabsTrigger value="practice">Practice</TabsTrigger>
          <TabsTrigger value="sandbox">Sandbox</TabsTrigger>
        </TabsList>

        <TabsContent value="explore" className="min-h-0 h-full">
          <MultivariableExplore />
        </TabsContent>
        <TabsContent value="practice" className="min-h-0 h-full">
          <MultivariablePractice />
        </TabsContent>
        <TabsContent value="sandbox" className="min-h-0 h-full">
          <MultivariableSandbox />
        </TabsContent>
      </Tabs>
    </div>
  );
}

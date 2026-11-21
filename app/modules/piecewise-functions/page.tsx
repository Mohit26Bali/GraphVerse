import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ModuleHeader } from "@/components/shared/ModuleHeader";
import { PiecewiseExplore } from "@/modules/piecewise-functions/PiecewiseExplore";
import { PiecewisePractice } from "@/modules/piecewise-functions/PiecewisePractice";
import { PiecewiseSandbox } from "@/modules/piecewise-functions/PiecewiseSandbox";

export default function PiecewiseFunctionsPage() {
  return (
    <div className="flex h-[calc(100dvh-3.5rem)] flex-col">
      <ModuleHeader
        order={9}
        category="algebra"
        title="Piecewise Functions"
        help={{
          what: "Functions defined by different rules on different intervals: |x|, floor(x), ceiling(x), and step functions, plus how to tell continuous joins from jump discontinuities.",
          why: "Most real systems aren't one clean formula — tax brackets, shipping costs, and rounding all behave piecewise. This module also introduces the filled-vs-hollow dot convention for \"is this exact point included,\" which is the same visual language limits and continuity use later.",
          how: "Explore: switch between |x|, floor, ceiling, and step to see continuous corners versus real jumps, with filled/hollow dots marking which side actually includes the boundary. Practice: click where a function jumps. Sandbox: build your own piecewise function from custom expressions and intervals, toggling each bracket between included [ and excluded (.",
        }}
      />

      <Tabs defaultValue="explore" className="min-h-0 flex-1">
        <TabsList className="mx-6 mt-3 self-start">
          <TabsTrigger value="explore">Explore</TabsTrigger>
          <TabsTrigger value="practice">Practice</TabsTrigger>
          <TabsTrigger value="sandbox">Sandbox</TabsTrigger>
        </TabsList>

        <TabsContent value="explore" className="min-h-0 h-full">
          <PiecewiseExplore />
        </TabsContent>
        <TabsContent value="practice" className="min-h-0 h-full">
          <PiecewisePractice />
        </TabsContent>
        <TabsContent value="sandbox" className="min-h-0 h-full">
          <PiecewiseSandbox />
        </TabsContent>
      </Tabs>
    </div>
  );
}

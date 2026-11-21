import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ModuleHeader } from "@/components/shared/ModuleHeader";
import { LinearExplore } from "@/modules/linear-functions/LinearExplore";
import { LinearPractice } from "@/modules/linear-functions/LinearPractice";
import { LinearSandbox } from "@/modules/linear-functions/LinearSandbox";

export default function LinearFunctionsPage() {
  return (
    <div className="flex h-[calc(100dvh-3.5rem)] flex-col">
      <ModuleHeader
        order={2}
        category="foundations"
        title="Linear Functions"
        help={{
          what: "Straight-line functions y = mx + b: slope, intercept, and what makes two lines parallel or perpendicular.",
          why: "Linear functions are the simplest building block of change — a constant rate. Every more complex function gets compared back to \"is this steeper or flatter than a line\" at some point, including tangent lines in calculus later.",
          how: "Explore: drag the slope (m) and intercept (b) sliders and watch the line, equation, table, and slope triangle update together. Practice: match a target line's slope. Sandbox: add several lines and see where they intersect.",
        }}
      />

      <Tabs defaultValue="explore" className="min-h-0 flex-1">
        <TabsList className="mx-6 mt-3 self-start">
          <TabsTrigger value="explore">Explore</TabsTrigger>
          <TabsTrigger value="practice">Practice</TabsTrigger>
          <TabsTrigger value="sandbox">Sandbox</TabsTrigger>
        </TabsList>

        <TabsContent value="explore" className="min-h-0 h-full">
          <LinearExplore />
        </TabsContent>
        <TabsContent value="practice" className="min-h-0 h-full">
          <LinearPractice />
        </TabsContent>
        <TabsContent value="sandbox" className="min-h-0 h-full">
          <LinearSandbox />
        </TabsContent>
      </Tabs>
    </div>
  );
}

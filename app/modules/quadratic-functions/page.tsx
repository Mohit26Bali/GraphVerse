import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ModuleHeader } from "@/components/shared/ModuleHeader";
import { QuadraticExplore } from "@/modules/quadratic-functions/QuadraticExplore";
import { QuadraticPractice } from "@/modules/quadratic-functions/QuadraticPractice";
import { QuadraticSandbox } from "@/modules/quadratic-functions/QuadraticSandbox";

export default function QuadraticFunctionsPage() {
  return (
    <div className="flex h-[calc(100dvh-3.5rem)] flex-col">
      <ModuleHeader
        order={3}
        category="foundations"
        title="Quadratic Functions"
        help={{
          what: "Parabolas in vertex form y = a(x-h)² + k: the vertex, roots, axis of symmetry, and a first preview of the tangent line.",
          why: "Quadratics are the first curved functions most people meet, and the vertex/roots/symmetry pattern here repeats for every higher-degree polynomial. The tangent-line preview also quietly sets up derivatives, several modules from now.",
          how: "Explore: drag a, h, k and watch the vertex and roots update; toggle the tangent line and slide its point to see the slope change. Practice: match a target parabola by tuning all three parameters. Sandbox: compare several parabolas side by side.",
        }}
      />

      <Tabs defaultValue="explore" className="min-h-0 flex-1">
        <TabsList className="mx-6 mt-3 self-start">
          <TabsTrigger value="explore">Explore</TabsTrigger>
          <TabsTrigger value="practice">Practice</TabsTrigger>
          <TabsTrigger value="sandbox">Sandbox</TabsTrigger>
        </TabsList>

        <TabsContent value="explore" className="min-h-0 h-full">
          <QuadraticExplore />
        </TabsContent>
        <TabsContent value="practice" className="min-h-0 h-full">
          <QuadraticPractice />
        </TabsContent>
        <TabsContent value="sandbox" className="min-h-0 h-full">
          <QuadraticSandbox />
        </TabsContent>
      </Tabs>
    </div>
  );
}

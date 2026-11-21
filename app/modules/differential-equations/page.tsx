import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ModuleHeader } from "@/components/shared/ModuleHeader";
import { DifferentialExplore } from "@/modules/differential-equations/DifferentialExplore";
import { DifferentialPractice } from "@/modules/differential-equations/DifferentialPractice";
import { DifferentialSandbox } from "@/modules/differential-equations/DifferentialSandbox";

export default function DifferentialEquationsPage() {
  return (
    <div className="flex h-[calc(100dvh-3.5rem)] flex-col">
      <ModuleHeader
        order={20}
        category="advanced"
        title="Differential Equations"
        help={{
          what: "Equations defined by a rate of change, dy/dx = f(x, y), instead of a direct formula for y. A slope field shows the direction of change everywhere at once; a trajectory is the specific path a solution follows through one starting point.",
          why: "Most equations describing real change — population growth, cooling, orbits, epidemics — are naturally written as \"how fast is this changing\" rather than \"what is this equal to.\" A slope field lets you see every possible solution's shape at a glance, before solving anything.",
          how: "Explore: pick an equation, then click anywhere on the plane to trace the trajectory through that point (numerically, via Runge-Kutta) — click several times to compare paths. Practice: click on a hidden target curve to find a point that lies on it. Sandbox: type any dy/dx = f(x, y) and explore its own slope field.",
        }}
      />

      <Tabs defaultValue="explore" className="min-h-0 flex-1">
        <TabsList className="mx-6 mt-3 self-start">
          <TabsTrigger value="explore">Explore</TabsTrigger>
          <TabsTrigger value="practice">Practice</TabsTrigger>
          <TabsTrigger value="sandbox">Sandbox</TabsTrigger>
        </TabsList>

        <TabsContent value="explore" className="min-h-0 h-full">
          <DifferentialExplore />
        </TabsContent>
        <TabsContent value="practice" className="min-h-0 h-full">
          <DifferentialPractice />
        </TabsContent>
        <TabsContent value="sandbox" className="min-h-0 h-full">
          <DifferentialSandbox />
        </TabsContent>
      </Tabs>
    </div>
  );
}

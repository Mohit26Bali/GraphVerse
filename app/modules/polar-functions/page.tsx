import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ModuleHeader } from "@/components/shared/ModuleHeader";
import { PolarExplore } from "@/modules/polar-functions/PolarExplore";
import { PolarPractice } from "@/modules/polar-functions/PolarPractice";
import { PolarSandbox } from "@/modules/polar-functions/PolarSandbox";

export default function PolarFunctionsPage() {
  return (
    <div className="flex h-[calc(100dvh-3.5rem)] flex-col">
      <ModuleHeader
        order={11}
        category="trigonometry"
        title="Polar Functions"
        help={{
          what: "Curves defined by r(θ) — distance from the origin as a function of angle — instead of y as a function of x: rose curves, cardioids, lemniscates, and spirals.",
          why: "Some of the most naturally circular or radiating shapes in math and nature (flower petals, spirals, heart curves) are awkward in x/y terms but fall out almost for free once you describe them by angle and distance instead. It's also a second, completely different lens on the same parametric-curve idea from the last module.",
          how: "Explore: pick a curve, press Play to watch it sweep out from θ = 0 (rose curves visibly bloom petal by petal), and drag the parameters to reshape it. Practice: match a target curve's parameters. Sandbox: overlay several polar curves at once.",
        }}
      />

      <Tabs defaultValue="explore" className="min-h-0 flex-1">
        <TabsList className="mx-6 mt-3 self-start">
          <TabsTrigger value="explore">Explore</TabsTrigger>
          <TabsTrigger value="practice">Practice</TabsTrigger>
          <TabsTrigger value="sandbox">Sandbox</TabsTrigger>
        </TabsList>

        <TabsContent value="explore" className="min-h-0 h-full">
          <PolarExplore />
        </TabsContent>
        <TabsContent value="practice" className="min-h-0 h-full">
          <PolarPractice />
        </TabsContent>
        <TabsContent value="sandbox" className="min-h-0 h-full">
          <PolarSandbox />
        </TabsContent>
      </Tabs>
    </div>
  );
}

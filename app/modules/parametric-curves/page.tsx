import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ModuleHeader } from "@/components/shared/ModuleHeader";
import { ParametricExplore } from "@/modules/parametric-curves/ParametricExplore";
import { ParametricPractice } from "@/modules/parametric-curves/ParametricPractice";
import { ParametricSandbox } from "@/modules/parametric-curves/ParametricSandbox";

export default function ParametricCurvesPage() {
  return (
    <div className="flex h-[calc(100dvh-3.5rem)] flex-col">
      <ModuleHeader
        order={10}
        category="trigonometry"
        title="Parametric Curves"
        help={{
          what: "Curves where x and y are each their own function of a shared parameter t — circles, ellipses, Lissajous figures, cycloids, and spirographs.",
          why: "Some shapes simply can't be written as y = f(x) — a full circle fails the vertical line test. Parametric equations sidestep that by describing motion instead of shape: as t sweeps forward, a point traces the curve, which is also exactly how these shapes are actually drawn or generated mechanically.",
          how: "Explore: pick a curve, press Play to watch it get traced point-by-point as t increases, and drag the parameters to reshape it. Practice: match a target curve's parameters. Sandbox: overlay several different curve types at once.",
        }}
      />

      <Tabs defaultValue="explore" className="min-h-0 flex-1">
        <TabsList className="mx-6 mt-3 self-start">
          <TabsTrigger value="explore">Explore</TabsTrigger>
          <TabsTrigger value="practice">Practice</TabsTrigger>
          <TabsTrigger value="sandbox">Sandbox</TabsTrigger>
        </TabsList>

        <TabsContent value="explore" className="min-h-0 h-full">
          <ParametricExplore />
        </TabsContent>
        <TabsContent value="practice" className="min-h-0 h-full">
          <ParametricPractice />
        </TabsContent>
        <TabsContent value="sandbox" className="min-h-0 h-full">
          <ParametricSandbox />
        </TabsContent>
      </Tabs>
    </div>
  );
}

import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ModuleHeader } from "@/components/shared/ModuleHeader";
import { TrigExplore } from "@/modules/trigonometric-functions/TrigExplore";
import { TrigPractice } from "@/modules/trigonometric-functions/TrigPractice";
import { TrigSandbox } from "@/modules/trigonometric-functions/TrigSandbox";

export default function TrigonometricFunctionsPage() {
  return (
    <div className="flex h-[calc(100dvh-3.5rem)] flex-col">
      <ModuleHeader
        order={6}
        category="trigonometry"
        title="Trigonometric Functions"
        help={{
          what: "Sine, cosine, and tangent, and where they actually come from: a point rotating around the unit circle, plus amplitude, frequency, phase, and vertical shift.",
          why: "Sin and cos aren't arbitrary wavy shapes — they're literally the x and y coordinates of a rotating point. Seeing the circle and the wave move together is the fastest way to understand why trig functions repeat, and why sin and cos are just phase-shifted versions of each other.",
          how: "Explore: hit Play to rotate the point continuously, or drag the angle slider yourself; adjust amplitude/frequency/phase/shift and watch both the circle and the wave update together. Practice: match a target wave's parameters. Sandbox: overlay several sin/cos/tan waves for comparison.",
        }}
      />

      <Tabs defaultValue="explore" className="min-h-0 flex-1">
        <TabsList className="mx-6 mt-3 self-start">
          <TabsTrigger value="explore">Explore</TabsTrigger>
          <TabsTrigger value="practice">Practice</TabsTrigger>
          <TabsTrigger value="sandbox">Sandbox</TabsTrigger>
        </TabsList>

        <TabsContent value="explore" className="min-h-0 h-full">
          <TrigExplore />
        </TabsContent>
        <TabsContent value="practice" className="min-h-0 h-full">
          <TrigPractice />
        </TabsContent>
        <TabsContent value="sandbox" className="min-h-0 h-full">
          <TrigSandbox />
        </TabsContent>
      </Tabs>
    </div>
  );
}

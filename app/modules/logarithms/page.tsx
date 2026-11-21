import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ModuleHeader } from "@/components/shared/ModuleHeader";
import { LogarithmExplore } from "@/modules/logarithms/LogarithmExplore";
import { LogarithmPractice } from "@/modules/logarithms/LogarithmPractice";
import { LogarithmSandbox } from "@/modules/logarithms/LogarithmSandbox";

export default function LogarithmsPage() {
  return (
    <div className="flex h-[calc(100dvh-3.5rem)] flex-col">
      <ModuleHeader
        order={8}
        category="analysis"
        title="Logarithms"
        help={{
          what: "The inverse of an exponential: log_b(x) asks \"what power of b gives x?\" Its graph is the exponential's mirror image across the line y = x.",
          why: "Logs are how you undo exponential growth — turning multiplication into addition, and letting you solve for \"how long until this doubles\" instead of just watching it happen. The mirror relationship is also the cleanest example of what an inverse function actually is, visually.",
          how: "Explore: press Reflect to watch b^x morph point-by-point into log_b(x) across the y = x line, or scrub the slider yourself. Practice: given a fixed exponential, find the log base that's its exact mirror. Sandbox: plot several shifted/scaled log curves and see their domain restriction (x > h) show up as a natural break in the curve.",
        }}
      />

      <Tabs defaultValue="explore" className="min-h-0 flex-1">
        <TabsList className="mx-6 mt-3 self-start">
          <TabsTrigger value="explore">Explore</TabsTrigger>
          <TabsTrigger value="practice">Practice</TabsTrigger>
          <TabsTrigger value="sandbox">Sandbox</TabsTrigger>
        </TabsList>

        <TabsContent value="explore" className="min-h-0 h-full">
          <LogarithmExplore />
        </TabsContent>
        <TabsContent value="practice" className="min-h-0 h-full">
          <LogarithmPractice />
        </TabsContent>
        <TabsContent value="sandbox" className="min-h-0 h-full">
          <LogarithmSandbox />
        </TabsContent>
      </Tabs>
    </div>
  );
}

import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ModuleHeader } from "@/components/shared/ModuleHeader";
import { FractalExplore } from "@/modules/chaos-fractals/FractalExplore";
import { FractalPractice } from "@/modules/chaos-fractals/FractalPractice";
import { FractalSandbox } from "@/modules/chaos-fractals/FractalSandbox";

export default function ChaosFractalsPage() {
  return (
    <div className="flex h-[calc(100dvh-3.5rem)] flex-col">
      <ModuleHeader
        order={21}
        category="advanced"
        title="Chaos & Fractals"
        help={{
          what: "What happens when you iterate a simple rule over and over: the Mandelbrot set (which starting points z=0, c stay bounded under z→z²+c), Julia sets (the same rule with c fixed and the starting point varied), and the logistic map (a population model that goes from stable, to oscillating, to chaotic as one parameter increases).",
          why: "These are three views of the same core idea — simple, fully deterministic rules producing structure too intricate to predict by formula, only by iterating. The Mandelbrot set has detail at every zoom level forever; the logistic map's chaos isn't randomness, it's a fixed rule that's just too sensitive to predict — the actual mathematical meaning of \"chaos.\"",
          how: "Explore: click the Mandelbrot set to zoom in indefinitely, or switch to Julia mode and click a point on the small Mandelbrot to choose c and see its Julia set. Practice: given a Julia set, click where on the Mandelbrot set its c value came from. Sandbox: drag the logistic map's growth rate and watch it shift from stable to periodic to chaotic, alongside the full bifurcation diagram.",
        }}
      />

      <Tabs defaultValue="explore" className="min-h-0 flex-1">
        <TabsList className="mx-6 mt-3 self-start">
          <TabsTrigger value="explore">Explore</TabsTrigger>
          <TabsTrigger value="practice">Practice</TabsTrigger>
          <TabsTrigger value="sandbox">Sandbox</TabsTrigger>
        </TabsList>

        <TabsContent value="explore" className="min-h-0 h-full">
          <FractalExplore />
        </TabsContent>
        <TabsContent value="practice" className="min-h-0 h-full">
          <FractalPractice />
        </TabsContent>
        <TabsContent value="sandbox" className="min-h-0 h-full">
          <FractalSandbox />
        </TabsContent>
      </Tabs>
    </div>
  );
}

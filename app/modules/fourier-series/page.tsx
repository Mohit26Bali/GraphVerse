import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ModuleHeader } from "@/components/shared/ModuleHeader";
import { FourierExplore } from "@/modules/fourier-series/FourierExplore";
import { FourierPractice } from "@/modules/fourier-series/FourierPractice";
import { FourierSandbox } from "@/modules/fourier-series/FourierSandbox";

export default function FourierSeriesPage() {
  return (
    <div className="flex h-[calc(100dvh-3.5rem)] flex-col">
      <ModuleHeader
        order={19}
        category="advanced"
        title="Fourier Series"
        help={{
          what: "Building any periodic wave — a square wave, sawtooth, or triangle — out of nothing but simple sine waves at whole-number multiples of a base frequency (harmonics), visualized as a chain of rotating circles (epicycles).",
          why: "This is the same idea as Taylor series (approximate something complex with a sum of simple pieces), applied to waves instead of curves — and it's the actual mechanism behind audio compression, image compression, and signal processing. Watching the circles spin and the jagged wave emerge from pure sine curves is one of the more genuinely surprising things in math to see happen live.",
          how: "Explore: pick a wave shape, press Play to watch the epicycle chain spin and trace the reconstruction, and drag the harmonic count to see it sharpen. Practice: find how many harmonics it takes to closely match a target wave. Sandbox: mix any harmonics you want — pick your own frequencies and amplitudes and build a wave from scratch.",
        }}
      />

      <Tabs defaultValue="explore" className="min-h-0 flex-1">
        <TabsList className="mx-6 mt-3 self-start">
          <TabsTrigger value="explore">Explore</TabsTrigger>
          <TabsTrigger value="practice">Practice</TabsTrigger>
          <TabsTrigger value="sandbox">Sandbox</TabsTrigger>
        </TabsList>

        <TabsContent value="explore" className="min-h-0 h-full">
          <FourierExplore />
        </TabsContent>
        <TabsContent value="practice" className="min-h-0 h-full">
          <FourierPractice />
        </TabsContent>
        <TabsContent value="sandbox" className="min-h-0 h-full">
          <FourierSandbox />
        </TabsContent>
      </Tabs>
    </div>
  );
}

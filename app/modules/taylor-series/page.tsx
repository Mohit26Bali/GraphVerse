import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ModuleHeader } from "@/components/shared/ModuleHeader";
import { TaylorExplore } from "@/modules/taylor-series/TaylorExplore";
import { TaylorPractice } from "@/modules/taylor-series/TaylorPractice";
import { TaylorSandbox } from "@/modules/taylor-series/TaylorSandbox";

export default function TaylorSeriesPage() {
  return (
    <div className="flex h-[calc(100dvh-3.5rem)] flex-col">
      <ModuleHeader
        order={18}
        category="advanced"
        title="Taylor Series"
        help={{
          what: "Approximating a curved function like sin(x), cos(x), or eˣ with a polynomial built entirely from its derivatives at one point — and watching that approximation improve as more terms are added.",
          why: "This is why calculators and computers can evaluate sin or e^x at all: they're not looking anything up, they're summing a polynomial like this one. It also ties directly back to derivatives — each term literally is a derivative, divided by a factorial.",
          how: "Explore: pick a function, press Play (or drag the slider) to add terms one at a time, and watch the shaded error region between the true curve and the polynomial shrink near the center. Practice: find the smallest degree that hits a target accuracy at a given point. Sandbox: type any function, move the center point, and build its Taylor polynomial around anywhere.",
        }}
      />

      <Tabs defaultValue="explore" className="min-h-0 flex-1">
        <TabsList className="mx-6 mt-3 self-start">
          <TabsTrigger value="explore">Explore</TabsTrigger>
          <TabsTrigger value="practice">Practice</TabsTrigger>
          <TabsTrigger value="sandbox">Sandbox</TabsTrigger>
        </TabsList>

        <TabsContent value="explore" className="min-h-0 h-full">
          <TaylorExplore />
        </TabsContent>
        <TabsContent value="practice" className="min-h-0 h-full">
          <TaylorPractice />
        </TabsContent>
        <TabsContent value="sandbox" className="min-h-0 h-full">
          <TaylorSandbox />
        </TabsContent>
      </Tabs>
    </div>
  );
}

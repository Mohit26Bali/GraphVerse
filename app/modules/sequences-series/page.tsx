import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ModuleHeader } from "@/components/shared/ModuleHeader";
import { SequencesExplore } from "@/modules/sequences-series/SequencesExplore";
import { SequencesPractice } from "@/modules/sequences-series/SequencesPractice";
import { SequencesSandbox } from "@/modules/sequences-series/SequencesSandbox";

export default function SequencesSeriesPage() {
  return (
    <div className="flex h-[calc(100dvh-3.5rem)] flex-col">
      <ModuleHeader
        order={17}
        category="advanced"
        title="Sequences & Series"
        help={{
          what: "What it means for an infinite list of numbers to add up to a finite total — watching the running sum (the 'partial sums') either flatten out toward a limit, or keep climbing forever.",
          why: "This is the idea Taylor Series quietly depends on: an infinite sum of terms only means something if it actually converges. Seeing a few series settle down — and a couple that look similar but don't — makes that assumption visible before it's used.",
          how: "Explore: pick a series, press Play (or drag the slider) to add terms one at a time, and watch the dots approach the dashed limit line — or not. Practice: decide whether a series converges, then estimate its limit. Sandbox: type any term formula in n and watch its own running sum.",
        }}
      />

      <Tabs defaultValue="explore" className="min-h-0 flex-1">
        <TabsList className="mx-6 mt-3 self-start">
          <TabsTrigger value="explore">Explore</TabsTrigger>
          <TabsTrigger value="practice">Practice</TabsTrigger>
          <TabsTrigger value="sandbox">Sandbox</TabsTrigger>
        </TabsList>

        <TabsContent value="explore" className="min-h-0 h-full">
          <SequencesExplore />
        </TabsContent>
        <TabsContent value="practice" className="min-h-0 h-full">
          <SequencesPractice />
        </TabsContent>
        <TabsContent value="sandbox" className="min-h-0 h-full">
          <SequencesSandbox />
        </TabsContent>
      </Tabs>
    </div>
  );
}

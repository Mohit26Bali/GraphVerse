import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ModuleHeader } from "@/components/shared/ModuleHeader";
import { ExponentialExplore } from "@/modules/exponential-functions/ExponentialExplore";
import { ExponentialPractice } from "@/modules/exponential-functions/ExponentialPractice";
import { ExponentialSandbox } from "@/modules/exponential-functions/ExponentialSandbox";

export default function ExponentialFunctionsPage() {
  return (
    <div className="flex h-[calc(100dvh-3.5rem)] flex-col">
      <ModuleHeader
        order={7}
        category="analysis"
        title="Exponential Functions"
        help={{
          what: "Growth and decay of the form y = A·bˣ + k, and its continuous twin y = A·e^(rx) + k — plus why e shows up at all.",
          why: "Exponential growth is the reason \"it grows a little each step\" can become unrecognizably huge (or, in decay, vanish) far faster than intuition expects. It's also the mechanism behind population growth, compound interest, and radioactive decay — three completely different phenomena obeying the exact same equation.",
          how: "Explore: pick a real-world framing (population, finance, decay, continuous), switch between the discrete and continuous forms, and drag A/b (or r)/k to see the curve and doubling/halving time update. Practice: match a target curve's A, b, and k. Sandbox: compare several growth/decay curves at once.",
        }}
      />

      <Tabs defaultValue="explore" className="min-h-0 flex-1">
        <TabsList className="mx-6 mt-3 self-start">
          <TabsTrigger value="explore">Explore</TabsTrigger>
          <TabsTrigger value="practice">Practice</TabsTrigger>
          <TabsTrigger value="sandbox">Sandbox</TabsTrigger>
        </TabsList>

        <TabsContent value="explore" className="min-h-0 h-full">
          <ExponentialExplore />
        </TabsContent>
        <TabsContent value="practice" className="min-h-0 h-full">
          <ExponentialPractice />
        </TabsContent>
        <TabsContent value="sandbox" className="min-h-0 h-full">
          <ExponentialSandbox />
        </TabsContent>
      </Tabs>
    </div>
  );
}

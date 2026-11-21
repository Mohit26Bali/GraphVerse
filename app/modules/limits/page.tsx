import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ModuleHeader } from "@/components/shared/ModuleHeader";
import { LimitExplore } from "@/modules/limits/LimitExplore";
import { LimitPractice } from "@/modules/limits/LimitPractice";
import { LimitSandbox } from "@/modules/limits/LimitSandbox";

export default function LimitsPage() {
  return (
    <div className="flex h-[calc(100dvh-3.5rem)] flex-col">
      <ModuleHeader
        order={14}
        category="analysis"
        title="Limits"
        help={{
          what: "What a function approaches near a point, whether or not it's actually defined there: continuous behavior, removable holes, jump discontinuities, and infinite (asymptotic) behavior.",
          why: "Limits are the idea calculus is actually built on — derivatives and integrals are both defined as limits. This module is also the first honest look at functions that misbehave: a hole where the function is undefined but the limit still exists, or a jump where it simply doesn't.",
          how: "Explore: pick a classic example, drag the point of interest, and watch the epsilon table and the zoom-in panel converge as you zoom closer — literally \"infinite zoom\" on the point. Practice: classify a function's behavior from its graph alone. Sandbox: type any expression and analyze any point on it the same way.",
        }}
      />

      <Tabs defaultValue="explore" className="min-h-0 flex-1">
        <TabsList className="mx-6 mt-3 self-start">
          <TabsTrigger value="explore">Explore</TabsTrigger>
          <TabsTrigger value="practice">Practice</TabsTrigger>
          <TabsTrigger value="sandbox">Sandbox</TabsTrigger>
        </TabsList>

        <TabsContent value="explore" className="min-h-0 h-full">
          <LimitExplore />
        </TabsContent>
        <TabsContent value="practice" className="min-h-0 h-full">
          <LimitPractice />
        </TabsContent>
        <TabsContent value="sandbox" className="min-h-0 h-full">
          <LimitSandbox />
        </TabsContent>
      </Tabs>
    </div>
  );
}

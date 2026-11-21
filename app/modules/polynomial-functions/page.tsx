import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ModuleHeader } from "@/components/shared/ModuleHeader";
import { PolynomialExplore } from "@/modules/polynomial-functions/PolynomialExplore";
import { PolynomialPractice } from "@/modules/polynomial-functions/PolynomialPractice";
import { PolynomialSandbox } from "@/modules/polynomial-functions/PolynomialSandbox";

export default function PolynomialFunctionsPage() {
  return (
    <div className="flex h-[calc(100dvh-3.5rem)] flex-col">
      <ModuleHeader
        order={4}
        category="algebra"
        title="Polynomial Functions"
        help={{
          what: "Functions built from roots and their multiplicities: degree, how many times a root repeats, and turning points.",
          why: "This is where you see that a parabola is just a degree-2 special case — the same root/turning-point pattern scales to any degree. It's also the first module where the app has to find things numerically instead of with a formula, which matters for everything after it.",
          how: "Explore: add roots, drag their positions, and pick a multiplicity (1, 2, or 3) to see how the curve crosses or bounces off the x-axis. Practice: click where an unlabeled curve touches zero. Sandbox: type any polynomial expression and its real roots and turning points are found automatically.",
        }}
      />

      <Tabs defaultValue="explore" className="min-h-0 flex-1">
        <TabsList className="mx-6 mt-3 self-start">
          <TabsTrigger value="explore">Explore</TabsTrigger>
          <TabsTrigger value="practice">Practice</TabsTrigger>
          <TabsTrigger value="sandbox">Sandbox</TabsTrigger>
        </TabsList>

        <TabsContent value="explore" className="min-h-0 h-full">
          <PolynomialExplore />
        </TabsContent>
        <TabsContent value="practice" className="min-h-0 h-full">
          <PolynomialPractice />
        </TabsContent>
        <TabsContent value="sandbox" className="min-h-0 h-full">
          <PolynomialSandbox />
        </TabsContent>
      </Tabs>
    </div>
  );
}

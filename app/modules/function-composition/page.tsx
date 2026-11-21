import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ModuleHeader } from "@/components/shared/ModuleHeader";
import { CompositionExplore } from "@/modules/function-composition/CompositionExplore";
import { CompositionPractice } from "@/modules/function-composition/CompositionPractice";
import { CompositionSandbox } from "@/modules/function-composition/CompositionSandbox";

export default function FunctionCompositionPage() {
  return (
    <div className="flex h-[calc(100dvh-3.5rem)] flex-col">
      <ModuleHeader
        order={12}
        category="analysis"
        title="Function Composition"
        help={{
          what: "Feeding the output of one function into another: g(f(x)). An input flows through f first, and whatever comes out becomes g's input.",
          why: "Composition is how complex functions are actually built from simple ones — and it doesn't commute: g(f(x)) and f(g(x)) are usually completely different functions, which is one of the more counterintuitive facts in algebra until you actually watch it happen.",
          how: "Explore: pick f and g, then press \"Run the machine\" to watch a token travel from input through f through g, while the graph traces the same journey as a staircase between the two curves. Practice: given f, g, and an input, estimate the composed output before it's revealed. Sandbox: type any f and g and see g(f(x)) plotted against f(g(x)) side by side.",
        }}
      />

      <Tabs defaultValue="explore" className="min-h-0 flex-1">
        <TabsList className="mx-6 mt-3 self-start">
          <TabsTrigger value="explore">Explore</TabsTrigger>
          <TabsTrigger value="practice">Practice</TabsTrigger>
          <TabsTrigger value="sandbox">Sandbox</TabsTrigger>
        </TabsList>

        <TabsContent value="explore" className="min-h-0 h-full">
          <CompositionExplore />
        </TabsContent>
        <TabsContent value="practice" className="min-h-0 h-full">
          <CompositionPractice />
        </TabsContent>
        <TabsContent value="sandbox" className="min-h-0 h-full">
          <CompositionSandbox />
        </TabsContent>
      </Tabs>
    </div>
  );
}

import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ModuleHeader } from "@/components/shared/ModuleHeader";
import { TransformationsExplore } from "@/modules/transformations/TransformationsExplore";
import { TransformationsPractice } from "@/modules/transformations/TransformationsPractice";
import { TransformationsSandbox } from "@/modules/transformations/TransformationsSandbox";

export default function TransformationsPage() {
  return (
    <div className="flex h-[calc(100dvh-3.5rem)] flex-col">
      <ModuleHeader
        order={5}
        category="algebra"
        title="Function Transformations"
        help={{
          what: "How shifting, stretching, and reflecting a function changes its graph: f(x) → f(x)+k → f(x-h) → a·f(x) → f(bx) → -f(x), applied to any base function.",
          why: "Once you know these five moves, you can predict the shape of almost any function without plotting it — a shifted, stretched sine wave is still \"just\" sin(x) underneath. It's the single most reusable piece of intuition in algebra.",
          how: "Explore: hit Play to watch the walkthrough animate step by step, or drag the a/b/h/k sliders yourself at any point — dragging interrupts the animation and takes over. Practice: match a randomly transformed curve. Sandbox: type any function and transform it freely.",
        }}
      />

      <Tabs defaultValue="explore" className="min-h-0 flex-1">
        <TabsList className="mx-6 mt-3 self-start">
          <TabsTrigger value="explore">Explore</TabsTrigger>
          <TabsTrigger value="practice">Practice</TabsTrigger>
          <TabsTrigger value="sandbox">Sandbox</TabsTrigger>
        </TabsList>

        <TabsContent value="explore" className="min-h-0 h-full">
          <TransformationsExplore />
        </TabsContent>
        <TabsContent value="practice" className="min-h-0 h-full">
          <TransformationsPractice />
        </TabsContent>
        <TabsContent value="sandbox" className="min-h-0 h-full">
          <TransformationsSandbox />
        </TabsContent>
      </Tabs>
    </div>
  );
}

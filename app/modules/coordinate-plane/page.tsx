import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ModuleHeader } from "@/components/shared/ModuleHeader";
import { CoordinatePlaneExplore } from "@/modules/coordinate-plane/CoordinatePlaneExplore";
import { CoordinatePlanePractice } from "@/modules/coordinate-plane/CoordinatePlanePractice";
import { CoordinatePlaneSandbox } from "@/modules/coordinate-plane/CoordinatePlaneSandbox";

export default function CoordinatePlanePage() {
  return (
    <div className="flex h-[calc(100dvh-3.5rem)] flex-col">
      <ModuleHeader
        order={1}
        category="foundations"
        title="Coordinate Plane"
        help={{
          what: "The x-y grid every other module plots on: axes, the origin, quadrants, and how a point's coordinates locate it in space.",
          why: "Every function you'll ever graph lives on this plane. Getting comfortable reading and placing coordinates here is the prerequisite for everything after it.",
          how: "Explore: pan and zoom the plane and watch your cursor's coordinates update live. Practice: click where a given coordinate should be. Sandbox: click anywhere to drop your own labeled points.",
        }}
      />

      <Tabs defaultValue="explore" className="min-h-0 flex-1">
        <TabsList className="mx-6 mt-3 self-start">
          <TabsTrigger value="explore">Explore</TabsTrigger>
          <TabsTrigger value="practice">Practice</TabsTrigger>
          <TabsTrigger value="sandbox">Sandbox</TabsTrigger>
        </TabsList>

        <TabsContent value="explore" className="min-h-0 h-full">
          <CoordinatePlaneExplore />
        </TabsContent>
        <TabsContent value="practice" className="min-h-0 h-full">
          <CoordinatePlanePractice />
        </TabsContent>
        <TabsContent value="sandbox" className="min-h-0 h-full">
          <CoordinatePlaneSandbox />
        </TabsContent>
      </Tabs>
    </div>
  );
}

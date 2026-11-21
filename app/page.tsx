import { Hero } from "@/components/landing/Hero";
import { LearningPath } from "@/components/landing/LearningPath";
import { WhyGraphVerse } from "@/components/landing/WhyGraphVerse";
import { SandboxPreview } from "@/components/landing/SandboxPreview";

export default function Home() {
  return (
    <div className="flex flex-col">
      <Hero />
      <WhyGraphVerse />
      <LearningPath />
      <SandboxPreview />
    </div>
  );
}

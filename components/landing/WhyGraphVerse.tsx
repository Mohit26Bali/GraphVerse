const PILLARS = [
  {
    title: "Visual",
    description: "Every concept is animated — you watch a function behave instead of reading about it.",
  },
  {
    title: "Interactive",
    description: "Drag parameters and the graph responds immediately, in real time.",
  },
  {
    title: "Experimental",
    description: "Discover the mathematics yourself in the sandbox, instead of memorizing formulas.",
  },
];

export function WhyGraphVerse() {
  return (
    <section className="border-b border-border">
      <div className="mx-auto grid max-w-5xl grid-cols-1 gap-8 px-6 py-16 sm:grid-cols-3">
        {PILLARS.map((pillar) => (
          <div key={pillar.title} className="flex flex-col gap-2">
            <h3 className="text-base font-semibold tracking-tight">{pillar.title}</h3>
            <p className="text-sm text-muted-foreground">{pillar.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

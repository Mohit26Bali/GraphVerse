"use client";

import Link from "next/link";
import { GraphCanvas, FunctionPlot } from "@/graph-engine";
import { Button } from "@/components/ui/button";

export function SandboxPreview() {
  return (
    <section className="border-b border-border">
      <div className="mx-auto grid max-w-5xl grid-cols-1 items-center gap-10 px-6 py-16 lg:grid-cols-2">
        <div className="flex flex-col gap-4">
          <h2 className="text-2xl font-semibold tracking-tight">Sandbox</h2>
          <p className="text-muted-foreground">
            Type any function of x and it plots instantly. Overlay several,
            drag their parameters, and watch the graph respond live — this is
            the same engine every module is built on.
          </p>
          <div className="flex flex-col gap-1.5 font-mono text-sm text-muted-foreground">
            <p>y = sin(x)</p>
            <p className="text-foreground">↓ drag amplitude, frequency, phase</p>
            <p>graph updates in real time</p>
          </div>
          <div>
            <Button render={<Link href="/sandbox" />} nativeButton={false}>
              Open Sandbox
            </Button>
          </div>
        </div>

        <div className="aspect-square w-full overflow-hidden rounded-2xl ring-1 ring-border">
          <GraphCanvas initialXDomain={[-7, 7]} initialYDomain={[-3, 3]}>
            <FunctionPlot expression="sin(x)" />
          </GraphCanvas>
        </div>
      </div>
    </section>
  );
}

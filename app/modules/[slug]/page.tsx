import { notFound } from "next/navigation";
import { getModuleBySlug, modules } from "@/modules";
import { CATEGORY_LABELS } from "@/types/module";

export function generateStaticParams() {
  return modules.map((mod) => ({ slug: mod.slug }));
}

export default async function ModulePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const mod = getModuleBySlug(slug);
  if (!mod) notFound();

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-4 px-6 py-16">
      <p className="text-xs uppercase tracking-wide text-muted-foreground">
        Module {String(mod.order).padStart(2, "0")} &middot; {CATEGORY_LABELS[mod.category]}
      </p>
      <h1 className="text-3xl font-semibold tracking-tight">{mod.title}</h1>
      <p className="text-lg text-muted-foreground">{mod.summary}</p>
      <p className="mt-8 text-sm text-muted-foreground">
        This module&apos;s interactive lesson hasn&apos;t been built yet.
      </p>
    </div>
  );
}

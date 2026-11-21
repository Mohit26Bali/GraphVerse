import Link from "next/link";

export function Header() {
  return (
    <header className="sticky top-0 z-10 flex h-14 shrink-0 items-center justify-between border-b border-border bg-background/80 px-4 backdrop-blur">
      <Link href="/" className="text-sm font-bold tracking-wide">
        GraphVerse
      </Link>
      <nav className="flex items-center gap-4 text-sm text-muted-foreground">
        <Link href="/" className="transition-colors hover:text-foreground">
          Modules
        </Link>
        <Link href="/sandbox" className="transition-colors hover:text-foreground">
          Sandbox
        </Link>
      </nav>
    </header>
  );
}

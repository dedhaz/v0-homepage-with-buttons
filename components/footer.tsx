import Link from "next/link"

export function Footer() {
  return (
    <footer className="border-t border-border bg-card">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-6 py-8 md:flex-row">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary">
            <span className="text-xs font-bold text-primary-foreground">13</span>
          </div>
          <span className="text-sm font-semibold text-foreground">Склад 13</span>
        </div>

        <nav className="flex items-center gap-6" aria-label="Footer navigation">
          <Link
            href="#features"
            className="text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            Возможности
          </Link>
          <Link
            href="#about"
            className="text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            О нас
          </Link>
          <Link
            href="#pricing"
            className="text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            Цены
          </Link>
        </nav>

        <p className="text-sm text-muted-foreground">
          {'© 2026 Склад 13. Все права защищены.'}
        </p>
      </div>
    </footer>
  )
}

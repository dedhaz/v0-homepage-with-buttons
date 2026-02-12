import Link from "next/link"
import { Button } from "@/components/ui/button"

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/60 bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        <Link href="/" className="group relative flex items-center gap-2.5" aria-label="Склад 13 — Доставка товаров из Китая под ключ">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
            <span className="text-base font-bold text-primary-foreground">13</span>
          </div>
          <span className="text-lg font-bold font-display tracking-tight text-foreground">
            Склад 13
          </span>
          <span
            className="pointer-events-none absolute left-0 top-full mt-2 w-max max-w-xs rounded-md bg-foreground px-3 py-1.5 text-xs text-background opacity-0 shadow-lg transition-opacity duration-200 group-hover:opacity-100"
            role="tooltip"
          >
            Доставка товаров из Китая под ключ
          </span>
        </Link>

        <nav className="hidden items-center gap-8 md:flex" aria-label="Main navigation">
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

        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/login">Войти</Link>
          </Button>
          <Button size="sm" asChild>
            <Link href="/register">Регистрация</Link>
          </Button>
        </div>
      </div>
    </header>
  )
}

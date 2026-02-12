import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"

export function Hero() {
  return (
    <section className="relative flex flex-col items-center px-6 pb-24 pt-20 text-center md:pt-32 md:pb-32">
      <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-1.5">
        <span className="h-2 w-2 rounded-full bg-emerald-500" />
        <span className="text-sm text-muted-foreground">
          Новая версия 2.0 уже доступна
        </span>
      </div>

      <h1 className="max-w-3xl text-balance font-display text-4xl font-bold leading-tight tracking-tight text-foreground md:text-6xl md:leading-tight">
        Управляйте проектами на скорости мысли
      </h1>

      <p className="mt-6 max-w-xl text-pretty text-base leading-relaxed text-muted-foreground md:text-lg">
        Momentum помогает командам организовать работу, отслеживать прогресс и достигать целей быстрее. Простой и мощный инструмент для каждого.
      </p>

      <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row">
        <Button size="lg" className="gap-2 px-8" asChild>
          <Link href="/register">
            Начать бесплатно
            <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
        <Button variant="outline" size="lg" className="px-8" asChild>
          <Link href="#features">Узнать больше</Link>
        </Button>
      </div>
    </section>
  )
}

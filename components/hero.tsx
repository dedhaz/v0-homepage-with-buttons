import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"

export function Hero() {
  return (
    <section className="relative flex flex-col items-center px-6 pb-24 pt-20 text-center md:pt-32 md:pb-32">
      <h1 className="max-w-3xl text-balance font-display text-4xl font-bold leading-tight tracking-tight text-foreground md:text-6xl md:leading-tight">
        Сделаем процесс закупки товаров в Китае простым и понятным
      </h1>

      <p className="mt-6 max-w-xl text-pretty text-base leading-relaxed text-muted-foreground md:text-lg">
        Наша команда помогает российским компаниям и предпринимателям упростить процесс покупки и доставки товаров из Китая в Россию. Вы можете заказать у нас как отдельно любую услугу (таможенное оформление, доставку из Китая в РФ, маркировку, проверку ваших товаров в Китае, оплату), так и весь комплекс услуг.
      </p>

      <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row">
        <Button size="lg" className="gap-2 px-8" asChild>
          <a href="https://t.me/sklad13white" target="_blank" rel="noopener noreferrer">
            Связаться с нами
            <ArrowRight className="h-4 w-4" />
          </a>
        </Button>
        <Button variant="outline" size="lg" className="px-8" asChild>
          <Link href="#features">Узнать больше</Link>
        </Button>
      </div>
    </section>
  )
}

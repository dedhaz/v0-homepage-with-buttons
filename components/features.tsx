import Link from "next/link"
import { BarChart3, Layers, Zap } from "lucide-react"

const features = [
  {
    icon: Zap,
    title: "Расчет стоимости доставки",
    description:
      "Заполните форму и получите предварительный расчет, оставьте свои контакты и наш менеджер свяжется с вами для более детального расчета и подбора услуг и маршрутов.",
    href: "/calculator",
  },
  {
    icon: Layers,
    title: "Подбор кода ТНВЭД",
    description:
      "Подберите код по описанию или фото вашего товара. *Подбор является предварительным, для точного подбора свяжитесь с нами.",
    href: undefined,
  },
  {
    icon: BarChart3,
    title: "Примеры ВЭД документов",
    description:
      "Заполните данные и сгенерируйте договор, инвойс, пакинг лист.",
    href: undefined,
  },
]

export function Features() {
  return (
    <section id="features" className="px-6 pb-24">
      <div className="mx-auto grid max-w-6xl gap-6 md:grid-cols-3">
        {features.map((feature) => {
          const content = (
            <>
              <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-xl bg-primary">
                <feature.icon className="h-5 w-5 text-primary-foreground" />
              </div>
              <h3 className="mb-2 font-display text-lg font-semibold text-foreground">
                {feature.title}
              </h3>
              <p className="text-sm leading-relaxed text-muted-foreground">
                {feature.description}
              </p>
            </>
          )

          if (feature.href) {
            return (
              <Link
                key={feature.title}
                href={feature.href}
                className="group rounded-2xl border border-border bg-card p-8 transition-colors hover:bg-accent"
              >
                {content}
              </Link>
            )
          }

          return (
            <div
              key={feature.title}
              className="group rounded-2xl border border-border bg-card p-8 transition-colors hover:bg-accent"
            >
              {content}
            </div>
          )
        })}
      </div>
    </section>
  )
}

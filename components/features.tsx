import { BarChart3, Layers, Zap } from "lucide-react"

const features = [
  {
    icon: Zap,
    title: "Расчет стоимости доставки",
    description:
      "Заполните форму и получите предварительный расчет, оставьте свои контакты и наш менеджер свяжется с вами для более детального расчета и подбора услуг и маршрутов.",
  },
  {
    icon: Layers,
    title: "Подбор кода ТНВЭД",
    description:
      "Настраивайте рабочие пространства, доски и проекты так, как удобно именно вашей команде.",
  },
  {
    icon: BarChart3,
    title: "Аналитика и отчёты",
    description:
      "Отслеживайте продуктивность команды с помощью наглядных графиков и детальной аналитики.",
  },
]

export function Features() {
  return (
    <section id="features" className="px-6 pb-24">
      <div className="mx-auto grid max-w-6xl gap-6 md:grid-cols-3">
        {features.map((feature) => (
          <div
            key={feature.title}
            className="group rounded-2xl border border-border bg-card p-8 transition-colors hover:bg-accent"
          >
            <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-xl bg-primary">
              <feature.icon className="h-5 w-5 text-primary-foreground" />
            </div>
            <h3 className="mb-2 font-display text-lg font-semibold text-foreground">
              {feature.title}
            </h3>
            <p className="text-sm leading-relaxed text-muted-foreground">
              {feature.description}
            </p>
          </div>
        ))}
      </div>
    </section>
  )
}

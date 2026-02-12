import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { CalculatorForm } from "@/components/calculator-form"

export default function CalculatorPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1 px-6 py-12 md:py-20">
        <div className="mx-auto max-w-5xl">
          <h1 className="mb-2 text-center font-display text-3xl font-bold tracking-tight text-foreground md:text-4xl">
            Заявка на расчет доставки из Китая
          </h1>
          <p className="mb-10 text-center text-muted-foreground md:text-lg">
            Заполните данные — мы свяжемся с вами в Telegram для уточнения деталей
          </p>
          <CalculatorForm />
        </div>
      </main>
      <Footer />
    </div>
  )
}

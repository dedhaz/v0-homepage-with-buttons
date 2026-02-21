import { Wallet, TrendingUp, TrendingDown, Clock } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"

const summaryCards = [
  {
    title: "Выручка",
    value: "4 850 000 руб.",
    icon: TrendingUp,
    description: "За текущий месяц",
  },
  {
    title: "Задолженности",
    value: "1 120 000 руб.",
    icon: Clock,
    description: "Ожидают оплаты",
  },
  {
    title: "Расходы",
    value: "2 340 000 руб.",
    icon: TrendingDown,
    description: "За текущий месяц",
  },
  {
    title: "Баланс",
    value: "2 510 000 руб.",
    icon: Wallet,
    description: "Чистая прибыль",
  },
]

const operations = [
  {
    id: "F-001",
    date: "18.02.2026",
    type: "income",
    description: "Оплата от Иванов С.П. (S-001)",
    amount: "+625 000 руб.",
  },
  {
    id: "F-002",
    date: "17.02.2026",
    type: "expense",
    description: "Оплата перевозчику (D-001)",
    amount: "-180 000 руб.",
  },
  {
    id: "F-003",
    date: "15.02.2026",
    type: "income",
    description: "Оплата от Козлова А.М. (S-002)",
    amount: "+340 000 руб.",
  },
  {
    id: "F-004",
    date: "14.02.2026",
    type: "expense",
    description: "Таможенные пошлины (D-002)",
    amount: "-95 000 руб.",
  },
  {
    id: "F-005",
    date: "12.02.2026",
    type: "expense",
    description: "Складские услуги",
    amount: "-45 000 руб.",
  },
  {
    id: "F-006",
    date: "10.02.2026",
    type: "income",
    description: "Аванс от Смирнова Е.В. (S-004)",
    amount: "+280 000 руб.",
  },
]

const typeMap: Record<string, { label: string; variant: "default" | "secondary" | "outline" | "destructive" }> = {
  income: { label: "Приход", variant: "default" },
  expense: { label: "Расход", variant: "destructive" },
}

export default function FinancesPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-foreground">Финансы</h1>
        <p className="text-sm text-muted-foreground">
          Обзор финансовых показателей и операций
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {summaryCards.map((card) => (
          <Card key={card.title}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {card.title}
              </CardTitle>
              <card.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-xl font-bold text-foreground">{card.value}</div>
              <p className="text-xs text-muted-foreground">{card.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="rounded-xl border border-border bg-card">
        <div className="border-b border-border px-6 py-4">
          <h2 className="font-display text-lg font-semibold text-foreground">
            Последние операции
          </h2>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-20">Номер</TableHead>
              <TableHead>Дата</TableHead>
              <TableHead>Тип</TableHead>
              <TableHead>Описание</TableHead>
              <TableHead className="text-right">Сумма</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {operations.map((op) => {
              const type = typeMap[op.type]
              return (
                <TableRow key={op.id}>
                  <TableCell className="font-mono text-sm font-medium text-muted-foreground">
                    {op.id}
                  </TableCell>
                  <TableCell>{op.date}</TableCell>
                  <TableCell>
                    <Badge variant={type.variant}>{type.label}</Badge>
                  </TableCell>
                  <TableCell>{op.description}</TableCell>
                  <TableCell
                    className={`text-right font-medium ${
                      op.type === "income" ? "text-emerald-600" : "text-red-500"
                    }`}
                  >
                    {op.amount}
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}

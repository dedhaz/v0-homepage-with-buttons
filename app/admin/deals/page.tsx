import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"

const deals = [
  {
    id: "S-001",
    client: "Иванов С.П.",
    product: "Электроника (партия)",
    amount: "1 250 000 руб.",
    date: "15.01.2026",
    status: "in_progress",
  },
  {
    id: "S-002",
    client: "Козлова А.М.",
    product: "Текстиль",
    amount: "340 000 руб.",
    date: "22.01.2026",
    status: "completed",
  },
  {
    id: "S-003",
    client: "Петров Д.О.",
    product: "Автозапчасти",
    amount: "870 000 руб.",
    date: "03.02.2026",
    status: "in_progress",
  },
  {
    id: "S-004",
    client: "Смирнова Е.В.",
    product: "Косметика",
    amount: "560 000 руб.",
    date: "10.02.2026",
    status: "new",
  },
  {
    id: "S-005",
    client: "Петров Д.О.",
    product: "Инструменты",
    amount: "2 100 000 руб.",
    date: "14.02.2026",
    status: "cancelled",
  },
  {
    id: "S-006",
    client: "Иванов С.П.",
    product: "LED-оборудование",
    amount: "780 000 руб.",
    date: "18.02.2026",
    status: "new",
  },
]

const statusMap: Record<string, { label: string; variant: "default" | "secondary" | "outline" | "destructive" }> = {
  new: { label: "Новая", variant: "secondary" },
  in_progress: { label: "В работе", variant: "default" },
  completed: { label: "Завершена", variant: "outline" },
  cancelled: { label: "Отменена", variant: "destructive" },
}

export default function DealsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-foreground">Сделки</h1>
        <p className="text-sm text-muted-foreground">
          Отслеживание сделок с клиентами
        </p>
      </div>

      <div className="rounded-xl border border-border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-20">Номер</TableHead>
              <TableHead>Клиент</TableHead>
              <TableHead>Товар</TableHead>
              <TableHead>Сумма</TableHead>
              <TableHead>Дата</TableHead>
              <TableHead>Статус</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {deals.map((deal) => {
              const status = statusMap[deal.status]
              return (
                <TableRow key={deal.id}>
                  <TableCell className="font-mono text-sm font-medium text-muted-foreground">
                    {deal.id}
                  </TableCell>
                  <TableCell className="font-medium">{deal.client}</TableCell>
                  <TableCell>{deal.product}</TableCell>
                  <TableCell>{deal.amount}</TableCell>
                  <TableCell>{deal.date}</TableCell>
                  <TableCell>
                    <Badge variant={status.variant}>{status.label}</Badge>
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

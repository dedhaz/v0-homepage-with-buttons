import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"

const deliveries = [
  {
    id: "D-001",
    deal: "S-001",
    client: "Иванов С.П.",
    route: "Гуанчжоу — Москва",
    method: "Авто",
    weight: "1 200 кг",
    departure: "20.01.2026",
    arrival: "15.02.2026",
    status: "in_transit",
  },
  {
    id: "D-002",
    deal: "S-002",
    client: "Козлова А.М.",
    route: "Иу — Москва",
    method: "ЖД",
    weight: "800 кг",
    departure: "25.01.2026",
    arrival: "28.02.2026",
    status: "delivered",
  },
  {
    id: "D-003",
    deal: "S-003",
    client: "Петров Д.О.",
    route: "Шанхай — Владивосток",
    method: "Море",
    weight: "5 000 кг",
    departure: "05.02.2026",
    arrival: "20.03.2026",
    status: "in_transit",
  },
  {
    id: "D-004",
    deal: "S-004",
    client: "Смирнова Е.В.",
    route: "Пекин — Москва",
    method: "Авиа",
    weight: "150 кг",
    departure: "12.02.2026",
    arrival: "18.02.2026",
    status: "customs",
  },
  {
    id: "D-005",
    deal: "S-003",
    client: "Петров Д.О.",
    route: "Нинбо — Новороссийск",
    method: "Море",
    weight: "3 200 кг",
    departure: "—",
    arrival: "—",
    status: "pending",
  },
]

const statusMap: Record<string, { label: string; variant: "default" | "secondary" | "outline" | "destructive" }> = {
  pending: { label: "Ожидает", variant: "secondary" },
  in_transit: { label: "В пути", variant: "default" },
  customs: { label: "Таможня", variant: "outline" },
  delivered: { label: "Доставлено", variant: "outline" },
}

export default function DeliveriesPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-foreground">Доставки</h1>
        <p className="text-sm text-muted-foreground">
          Отслеживание отправок и маршрутов
        </p>
      </div>

      <div className="rounded-xl border border-border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-20">Номер</TableHead>
              <TableHead className="w-16">Сделка</TableHead>
              <TableHead>Клиент</TableHead>
              <TableHead>Маршрут</TableHead>
              <TableHead>Способ</TableHead>
              <TableHead>Вес</TableHead>
              <TableHead>Отправка</TableHead>
              <TableHead>Прибытие</TableHead>
              <TableHead>Статус</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {deliveries.map((d) => {
              const status = statusMap[d.status]
              return (
                <TableRow key={d.id}>
                  <TableCell className="font-mono text-sm font-medium text-muted-foreground">
                    {d.id}
                  </TableCell>
                  <TableCell className="font-mono text-sm text-muted-foreground">
                    {d.deal}
                  </TableCell>
                  <TableCell className="font-medium">{d.client}</TableCell>
                  <TableCell>{d.route}</TableCell>
                  <TableCell>{d.method}</TableCell>
                  <TableCell>{d.weight}</TableCell>
                  <TableCell>{d.departure}</TableCell>
                  <TableCell>{d.arrival}</TableCell>
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

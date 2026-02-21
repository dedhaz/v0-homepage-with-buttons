import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"

const products = [
  {
    id: 1,
    name: "Светодиодные панели 60x60",
    tnved: "9405 42 310 0",
    client: "Иванов С.П.",
    quantity: 500,
    priceUnit: "12.50 $",
    totalPrice: "6 250 $",
    status: "in_stock",
  },
  {
    id: 2,
    name: 'Хлопковая ткань (рулон 100м)',
    tnved: "5208 11 100 0",
    client: "Козлова А.М.",
    quantity: 200,
    priceUnit: "85 $",
    totalPrice: "17 000 $",
    status: "ordered",
  },
  {
    id: 3,
    name: "Тормозные колодки (комплект)",
    tnved: "8708 30 100 0",
    client: "Петров Д.О.",
    quantity: 1000,
    priceUnit: "8.20 $",
    totalPrice: "8 200 $",
    status: "in_transit",
  },
  {
    id: 4,
    name: "Крем для лица 50мл",
    tnved: "3304 99 000 0",
    client: "Смирнова Е.В.",
    quantity: 3000,
    priceUnit: "2.10 $",
    totalPrice: "6 300 $",
    status: "checking",
  },
  {
    id: 5,
    name: "Набор гаечных ключей",
    tnved: "8204 11 000 0",
    client: "Петров Д.О.",
    quantity: 800,
    priceUnit: "5.50 $",
    totalPrice: "4 400 $",
    status: "ordered",
  },
]

const statusMap: Record<string, { label: string; variant: "default" | "secondary" | "outline" | "destructive" }> = {
  ordered: { label: "Заказан", variant: "secondary" },
  checking: { label: "Проверка", variant: "outline" },
  in_transit: { label: "В пути", variant: "default" },
  in_stock: { label: "На складе", variant: "outline" },
}

export default function ProductsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-foreground">Товары</h1>
        <p className="text-sm text-muted-foreground">
          Каталог товаров клиентов
        </p>
      </div>

      <div className="rounded-xl border border-border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">ID</TableHead>
              <TableHead>Наименование</TableHead>
              <TableHead>Код ТНВЭД</TableHead>
              <TableHead>Клиент</TableHead>
              <TableHead className="text-right">Кол-во</TableHead>
              <TableHead className="text-right">Цена/шт</TableHead>
              <TableHead className="text-right">Сумма</TableHead>
              <TableHead>Статус</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.map((p) => {
              const status = statusMap[p.status]
              return (
                <TableRow key={p.id}>
                  <TableCell className="font-medium text-muted-foreground">
                    {p.id}
                  </TableCell>
                  <TableCell className="font-medium">{p.name}</TableCell>
                  <TableCell className="font-mono text-sm">{p.tnved}</TableCell>
                  <TableCell>{p.client}</TableCell>
                  <TableCell className="text-right">{p.quantity}</TableCell>
                  <TableCell className="text-right">{p.priceUnit}</TableCell>
                  <TableCell className="text-right font-medium">{p.totalPrice}</TableCell>
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

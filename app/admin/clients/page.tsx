import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"

const clients = [
  {
    id: 1,
    name: "Иванов Сергей Петрович",
    company: 'ООО "Техно-Импорт"',
    email: "ivanov@techno-import.ru",
    phone: "+7 (999) 123-45-67",
    deals: 5,
    status: "active",
  },
  {
    id: 2,
    name: "Козлова Анна Михайловна",
    company: "ИП Козлова А.М.",
    email: "kozlova@mail.ru",
    phone: "+7 (916) 555-12-34",
    deals: 2,
    status: "active",
  },
  {
    id: 3,
    name: "Петров Дмитрий Олегович",
    company: 'ООО "ГлобалТрейд"',
    email: "petrov@globaltrade.ru",
    phone: "+7 (903) 777-88-99",
    deals: 8,
    status: "active",
  },
  {
    id: 4,
    name: "Смирнова Елена Владимировна",
    company: 'ООО "СмартЛогистик"',
    email: "smirnova@smartlog.ru",
    phone: "+7 (926) 333-44-55",
    deals: 1,
    status: "new",
  },
  {
    id: 5,
    name: "Федоров Алексей Николаевич",
    company: "ИП Федоров А.Н.",
    email: "fedorov@yandex.ru",
    phone: "+7 (985) 666-77-88",
    deals: 0,
    status: "inactive",
  },
]

const statusMap: Record<string, { label: string; variant: "default" | "secondary" | "outline" | "destructive" }> = {
  active: { label: "Активный", variant: "default" },
  new: { label: "Новый", variant: "secondary" },
  inactive: { label: "Неактивный", variant: "outline" },
}

export default function ClientsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground">Клиенты</h1>
          <p className="text-sm text-muted-foreground">
            Управление базой клиентов
          </p>
        </div>
      </div>

      <div className="rounded-xl border border-border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">ID</TableHead>
              <TableHead>ФИО</TableHead>
              <TableHead>Компания</TableHead>
              <TableHead>E-mail</TableHead>
              <TableHead>Телефон</TableHead>
              <TableHead className="text-center">Сделки</TableHead>
              <TableHead>Статус</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {clients.map((client) => {
              const status = statusMap[client.status]
              return (
                <TableRow key={client.id}>
                  <TableCell className="font-medium text-muted-foreground">
                    {client.id}
                  </TableCell>
                  <TableCell className="font-medium">{client.name}</TableCell>
                  <TableCell>{client.company}</TableCell>
                  <TableCell>{client.email}</TableCell>
                  <TableCell>{client.phone}</TableCell>
                  <TableCell className="text-center">{client.deals}</TableCell>
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

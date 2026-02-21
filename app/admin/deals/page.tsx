"use client"

import { useState, useMemo } from "react"
import Link from "next/link"
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Plus, ArrowUpDown, ArrowUp, ArrowDown, Search, X, ExternalLink } from "lucide-react"

/* ---- lightweight local type for list only ---- */
interface DealRow {
  id: number
  number: string
  createdAt: string
  status: "draft" | "sent" | "approved" | "rejected"
  clientName: string
  supplierName: string
  cityFrom: string
  cityTo: string
  deliveryMethod: "auto" | "rail" | "sea_rail"
  totalRub: number
}

const statusColors: Record<DealRow["status"], string> = {
  draft: "bg-muted text-muted-foreground",
  sent: "bg-blue-100 text-blue-800",
  approved: "bg-emerald-100 text-emerald-800",
  rejected: "bg-red-100 text-red-800",
}
const statusLabels: Record<DealRow["status"], string> = {
  draft: "Черновик",
  sent: "Отправлено",
  approved: "Одобрено",
  rejected: "Отклонено",
}
const deliveryLabels: Record<string, string> = {
  auto: "Авто",
  rail: "ЖД",
  sea_rail: "Море + ЖД",
}

const seedDeals: DealRow[] = [
  {
    id: 1, number: "КП-2026/001", createdAt: "2026-01-20", status: "approved",
    clientName: 'ООО "Техно-Импорт"', supplierName: "Шэньчжэнь Хуацян Электроникс",
    cityFrom: "Шэньчжэнь", cityTo: "Москва", deliveryMethod: "auto", totalRub: 908433,
  },
  {
    id: 2, number: "КП-2026/002", createdAt: "2026-02-05", status: "draft",
    clientName: "ИП Козлова А.М.", supplierName: "Гуанчжоу Байда Трейдинг",
    cityFrom: "Гуанчжоу", cityTo: "Санкт-Петербург", deliveryMethod: "rail", totalRub: 1250000,
  },
  {
    id: 3, number: "КП-2026/003", createdAt: "2026-02-12", status: "sent",
    clientName: 'ООО "ГлобалТрейд"', supplierName: "Иу Цзиньчэн Импорт Экспорт",
    cityFrom: "Иу", cityTo: "Новосибирск", deliveryMethod: "sea_rail", totalRub: 2340000,
  },
]

function fmtRub(n: number) {
  return n.toLocaleString("ru-RU", { maximumFractionDigits: 0 }) + " \u20BD"
}

export default function DealsPage() {
  const [deals] = useState<DealRow[]>(seedDeals)
  const [search, setSearch] = useState("")
  const [filterStatus, setFilterStatus] = useState("")

  type SortKey = "id" | "number" | "createdAt" | "clientName" | "supplierName" | "status" | "totalRub"
  type SortDir = "asc" | "desc" | null
  const [sortKey, setSortKey] = useState<SortKey | null>(null)
  const [sortDir, setSortDir] = useState<SortDir>(null)

  function toggleSort(key: SortKey) {
    if (sortKey === key) {
      if (sortDir === "asc") setSortDir("desc")
      else if (sortDir === "desc") { setSortKey(null); setSortDir(null) }
      else setSortDir("asc")
    } else { setSortKey(key); setSortDir("asc") }
  }

  function SortIcon({ col }: { col: SortKey }) {
    if (sortKey !== col) return <ArrowUpDown className="ml-1 inline h-3 w-3 text-muted-foreground/50" />
    if (sortDir === "asc") return <ArrowUp className="ml-1 inline h-3 w-3" />
    return <ArrowDown className="ml-1 inline h-3 w-3" />
  }

  const display = useMemo(() => {
    let result = [...deals]
    if (search.trim()) {
      const q = search.toLowerCase()
      result = result.filter(
        (d) =>
          d.number.toLowerCase().includes(q) ||
          d.clientName.toLowerCase().includes(q) ||
          d.supplierName.toLowerCase().includes(q) ||
          d.cityFrom.toLowerCase().includes(q) ||
          d.cityTo.toLowerCase().includes(q)
      )
    }
    if (filterStatus) result = result.filter((d) => d.status === filterStatus)
    if (sortKey && sortDir) {
      result.sort((a, b) => {
        const va = a[sortKey]
        const vb = b[sortKey]
        if (typeof va === "number" && typeof vb === "number") return sortDir === "asc" ? va - vb : vb - va
        return sortDir === "asc" ? String(va).localeCompare(String(vb)) : String(vb).localeCompare(String(va))
      })
    }
    return result
  }, [deals, search, filterStatus, sortKey, sortDir])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground">Сделки</h1>
          <p className="text-sm text-muted-foreground">
            {"Коммерческие предложения \u00B7 " + display.length + " из " + deals.length}
          </p>
        </div>
        <Button asChild className="gap-2">
          <Link href="/admin/deals/new">
            <Plus className="h-4 w-4" />
            Новая сделка
          </Link>
        </Button>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="relative min-w-48 flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Поиск по номеру, клиенту, продавцу, городу..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="h-10 rounded-md border border-input bg-background px-3 text-sm text-foreground ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
        >
          <option value="">Все статусы</option>
          <option value="draft">Черновик</option>
          <option value="sent">Отправлено</option>
          <option value="approved">Одобрено</option>
          <option value="rejected">Отклонено</option>
        </select>
        {(search || filterStatus) && (
          <Button variant="ghost" size="sm" className="gap-1" onClick={() => { setSearch(""); setFilterStatus("") }}>
            <X className="h-3 w-3" /> Сбросить
          </Button>
        )}
      </div>

      <div className="rounded-xl border border-border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12 cursor-pointer select-none" onClick={() => toggleSort("id")}>
                ID<SortIcon col="id" />
              </TableHead>
              <TableHead className="cursor-pointer select-none" onClick={() => toggleSort("number")}>
                {"N\u00B0 КП"}<SortIcon col="number" />
              </TableHead>
              <TableHead className="cursor-pointer select-none" onClick={() => toggleSort("createdAt")}>
                Дата<SortIcon col="createdAt" />
              </TableHead>
              <TableHead className="cursor-pointer select-none" onClick={() => toggleSort("clientName")}>
                Клиент<SortIcon col="clientName" />
              </TableHead>
              <TableHead className="cursor-pointer select-none" onClick={() => toggleSort("supplierName")}>
                Продавец<SortIcon col="supplierName" />
              </TableHead>
              <TableHead>Маршрут</TableHead>
              <TableHead>Доставка</TableHead>
              <TableHead className="cursor-pointer select-none text-right" onClick={() => toggleSort("totalRub")}>
                {"Сумма"}<SortIcon col="totalRub" />
              </TableHead>
              <TableHead className="cursor-pointer select-none" onClick={() => toggleSort("status")}>
                Статус<SortIcon col="status" />
              </TableHead>
              <TableHead className="w-12" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {display.length === 0 ? (
              <TableRow>
                <TableCell colSpan={10} className="py-12 text-center text-muted-foreground">
                  Ничего не найдено
                </TableCell>
              </TableRow>
            ) : (
              display.map((d) => (
                <TableRow key={d.id} className="cursor-pointer hover:bg-accent/50">
                  <TableCell className="font-medium text-muted-foreground">{d.id}</TableCell>
                  <TableCell className="font-mono text-sm font-medium">{d.number}</TableCell>
                  <TableCell className="text-sm">{d.createdAt}</TableCell>
                  <TableCell className="font-medium">{d.clientName}</TableCell>
                  <TableCell className="text-sm">{d.supplierName}</TableCell>
                  <TableCell className="text-sm">{d.cityFrom + " \u2192 " + d.cityTo}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="text-xs">{deliveryLabels[d.deliveryMethod]}</Badge>
                  </TableCell>
                  <TableCell className="text-right font-mono text-sm">{fmtRub(d.totalRub)}</TableCell>
                  <TableCell>
                    <Badge className={statusColors[d.status] + " border-0"}>{statusLabels[d.status]}</Badge>
                  </TableCell>
                  <TableCell>
                    <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
                      <Link href={"/admin/deals/" + d.id}>
                        <ExternalLink className="h-4 w-4" />
                      </Link>
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}

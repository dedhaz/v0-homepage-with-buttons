"use client"

import { useState, useMemo } from "react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import Link from "next/link"
import { Plus, Pencil, ArrowUpDown, ArrowUp, ArrowDown, Search, X, Trash2, FileText } from "lucide-react"

/* ---------- types ---------- */
type ContractType = "supply" | "commission" | "transport"

interface Contract {
  number: string
  type: ContractType
  date: string
}

const contractTypeLabels: Record<ContractType, string> = {
  supply: "Поставки",
  commission: "Комиссии",
  transport: "Перевозки",
}

const emptyContract: Contract = { number: "", type: "supply", date: "" }

interface ClientAddress {
  index: string
  region: string
  city: string
  street: string
  house: string
  office: string
}

interface Client {
  id: number
  createdAt: string
  type: "ИП" | "ООО"
  internalName: string
  contracts: Contract[]
  inn: string
  kpp: string
  ogrn: string
  companyName: string
  bik: string
  bankName: string
  ks: string
  rs: string
  address: ClientAddress
  email: string
  phone: string
  wechat: string
  telegram: string
  status: "calc" | "active" | "inactive" | "blacklist"
  comment: string
}

const emptyAddress: ClientAddress = {
  index: "",
  region: "",
  city: "",
  street: "",
  house: "",
  office: "",
}

const emptyClient: Omit<Client, "id" | "createdAt"> = {
  type: "ООО",
  internalName: "",
  contracts: [],
  inn: "",
  kpp: "",
  ogrn: "",
  companyName: "",
  bik: "",
  bankName: "",
  ks: "",
  rs: "",
  address: { ...emptyAddress },
  email: "",
  phone: "",
  wechat: "",
  telegram: "",
  status: "calc",
  comment: "",
}

const statusMap: Record<
  string,
  { label: string; variant: "default" | "secondary" | "outline" | "destructive" }
> = {
  calc: { label: "Расчет", variant: "secondary" },
  active: { label: "Активный", variant: "default" },
  inactive: { label: "Неактивный", variant: "outline" },
  blacklist: { label: "Черный список", variant: "destructive" },
}

/* ---------- seed data ---------- */
const seedClients: Client[] = [
  {
    id: 1,
    createdAt: "2026-01-15",
    type: "ООО",
    internalName: "Техно основной",
    contracts: [
      { number: "ВЭД-2026/001", type: "supply", date: "2026-01-15" },
      { number: "ВЭД-2026/001-К", type: "commission", date: "2026-01-20" },
    ],
    inn: "7707123456",
    kpp: "770701001",
    ogrn: "1027700132195",
    companyName: 'ООО "Техно-Импорт"',
    bik: "044525225",
    bankName: "ПАО Сбербанк",
    ks: "30101810400000000225",
    rs: "40702810938000012345",
    address: { index: "101000", region: "Москва", city: "Москва", street: "Мясницкая", house: "11", office: "305" },
    email: "ivanov@techno-import.ru",
    phone: "+7 (999) 123-45-67",
    wechat: "techno_ivan",
    telegram: "@ivanov_tech",
    status: "active",
    comment: "Постоянный клиент, работаем с 2024 года",
  },
  {
    id: 2,
    createdAt: "2026-02-03",
    type: "ИП",
    internalName: "Козлова Анна",
    contracts: [
      { number: "ВЭД-2026/002", type: "transport", date: "2026-02-03" },
    ],
    inn: "771234567890",
    kpp: "",
    ogrn: "321774600012345",
    companyName: "ИП Козлова А.М.",
    bik: "044525974",
    bankName: "АО Тинькофф Банк",
    ks: "30101810145250000974",
    rs: "40802810100000054321",
    address: { index: "125009", region: "Москва", city: "Москва", street: "Тверская", house: "22", office: "" },
    email: "kozlova@mail.ru",
    phone: "+7 (916) 555-12-34",
    wechat: "",
    telegram: "@kozlova_am",
    status: "active",
    comment: "",
  },
  {
    id: 3,
    createdAt: "2026-02-10",
    type: "ООО",
    internalName: "Глобал новый",
    contracts: [],
    inn: "7709876543",
    kpp: "770901001",
    ogrn: "1027700987654",
    companyName: 'ООО "ГлобалТрейд"',
    bik: "044525225",
    bankName: "ПАО Сбербанк",
    ks: "30101810400000000225",
    rs: "40702810938000067890",
    address: { index: "109012", region: "Москва", city: "Москва", street: "Красная площадь", house: "1", office: "1" },
    email: "petrov@globaltrade.ru",
    phone: "+7 (903) 777-88-99",
    wechat: "global_petrov",
    telegram: "@petrov_global",
    status: "calc",
    comment: "Первая заявка, ждёт расчет",
  },
]

/* ---------- component ---------- */
export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>(seedClients)
  const [open, setOpen] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [form, setForm] = useState<Omit<Client, "id" | "createdAt">>({ ...emptyClient, address: { ...emptyAddress } })

  /* search & filters */
  const [search, setSearch] = useState("")
  const [filterStatus, setFilterStatus] = useState("")

  /* sorting */
  type SortKey = "id" | "createdAt" | "companyName" | "contracts" | "inn" | "email" | "phone" | "status"
  type SortDir = "asc" | "desc" | null
  const [sortKey, setSortKey] = useState<SortKey | null>(null)
  const [sortDir, setSortDir] = useState<SortDir>(null)

  function toggleSort(key: SortKey) {
    if (sortKey === key) {
      if (sortDir === "asc") setSortDir("desc")
      else if (sortDir === "desc") { setSortKey(null); setSortDir(null) }
      else setSortDir("asc")
    } else {
      setSortKey(key)
      setSortDir("asc")
    }
  }

  function SortIcon({ col }: { col: SortKey }) {
    if (sortKey !== col) return <ArrowUpDown className="ml-1 inline h-3 w-3 text-muted-foreground/50" />
    if (sortDir === "asc") return <ArrowUp className="ml-1 inline h-3 w-3" />
    return <ArrowDown className="ml-1 inline h-3 w-3" />
  }

  /* filtered & sorted */
  const displayClients = useMemo(() => {
    let result = [...clients]

    if (search.trim()) {
      const q = search.toLowerCase()
      result = result.filter(
        (c) =>
          c.companyName.toLowerCase().includes(q) ||
          c.inn.toLowerCase().includes(q) ||
          c.email.toLowerCase().includes(q) ||
          c.phone.toLowerCase().includes(q) ||
          c.contracts.some((ct) => ct.number.toLowerCase().includes(q)) ||
          c.internalName.toLowerCase().includes(q)
      )
    }

    if (filterStatus) result = result.filter((c) => c.status === filterStatus)

    if (sortKey && sortDir) {
      result.sort((a, b) => {
        let va: string | number = ""
        let vb: string | number = ""
        if (sortKey === "id") { va = a.id; vb = b.id }
        else if (sortKey === "contracts") { va = a.contracts[0]?.number ?? ""; vb = b.contracts[0]?.number ?? "" }
        else { va = a[sortKey]; vb = b[sortKey] }
        if (typeof va === "number" && typeof vb === "number") return sortDir === "asc" ? va - vb : vb - va
        return sortDir === "asc" ? String(va).localeCompare(String(vb)) : String(vb).localeCompare(String(va))
      })
    }

    return result
  }, [clients, search, filterStatus, sortKey, sortDir])

  function openNew() {
    setEditingId(null)
    setForm({ ...emptyClient, contracts: [], address: { ...emptyAddress } })
    setOpen(true)
  }

  function openEdit(client: Client) {
    setEditingId(client.id)
    const { id: _id, createdAt: _ca, ...rest } = client
    setForm({ ...rest, contracts: client.contracts.map((c) => ({ ...c })), address: { ...client.address } })
    setOpen(true)
  }

  function handleSave() {
    if (editingId !== null) {
      setClients((prev) =>
        prev.map((c) =>
          c.id === editingId ? { ...c, ...form, contracts: form.contracts.map((ct) => ({ ...ct })), address: { ...form.address } } : c
        )
      )
    } else {
      const newId = clients.length > 0 ? Math.max(...clients.map((c) => c.id)) + 1 : 1
      setClients((prev) => [
        ...prev,
        {
          id: newId,
          createdAt: new Date().toISOString().slice(0, 10),
          ...form,
          contracts: form.contracts.map((ct) => ({ ...ct })),
          address: { ...form.address },
        },
      ])
    }
    setOpen(false)
  }

  function updateField<K extends keyof Omit<Client, "id" | "createdAt">>(
    key: K,
    value: Omit<Client, "id" | "createdAt">[K]
  ) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  function updateAddress<K extends keyof ClientAddress>(key: K, value: string) {
    setForm((prev) => ({ ...prev, address: { ...prev.address, [key]: value } }))
  }

  return (
    <div className="space-y-6">
      {/* header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground">Клиенты</h1>
          <p className="text-sm text-muted-foreground">
            {"Управление базой клиентов \u00B7 " + displayClients.length + " из " + clients.length}
          </p>
        </div>
        <Button onClick={openNew} className="gap-2">
          <Plus className="h-4 w-4" />
          Добавить клиента
        </Button>
      </div>

      {/* filters */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div className="relative sm:col-span-2 lg:col-span-2">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Поиск по компании, ИНН, e-mail, телефону, договору..."
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
          <option value="calc">Расчет</option>
          <option value="active">Активный</option>
          <option value="inactive">Неактивный</option>
          <option value="blacklist">Черный список</option>
        </select>
        {(search || filterStatus) && (
          <Button
            variant="ghost"
            size="sm"
            className="gap-1"
            onClick={() => { setSearch(""); setFilterStatus("") }}
          >
            <X className="h-3 w-3" />
            Сбросить
          </Button>
        )}
      </div>

      {/* table */}
      <div className="rounded-xl border border-border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12 cursor-pointer select-none" onClick={() => toggleSort("id")}>
                ID<SortIcon col="id" />
              </TableHead>
              <TableHead className="cursor-pointer select-none" onClick={() => toggleSort("createdAt")}>
                Дата<SortIcon col="createdAt" />
              </TableHead>
              <TableHead className="cursor-pointer select-none" onClick={() => toggleSort("companyName")}>
                Компания<SortIcon col="companyName" />
              </TableHead>
              <TableHead className="cursor-pointer select-none" onClick={() => toggleSort("contracts")}>
                {"Договоры"}<SortIcon col="contracts" />
              </TableHead>
              <TableHead className="cursor-pointer select-none" onClick={() => toggleSort("inn")}>
                ИНН<SortIcon col="inn" />
              </TableHead>
              <TableHead className="cursor-pointer select-none" onClick={() => toggleSort("email")}>
                E-mail<SortIcon col="email" />
              </TableHead>
              <TableHead className="cursor-pointer select-none" onClick={() => toggleSort("phone")}>
                Телефон<SortIcon col="phone" />
              </TableHead>
              <TableHead className="cursor-pointer select-none" onClick={() => toggleSort("status")}>
                Статус<SortIcon col="status" />
              </TableHead>
              <TableHead className="w-12" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {displayClients.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} className="py-12 text-center text-muted-foreground">
                  Ничего не найдено
                </TableCell>
              </TableRow>
            ) : (
              displayClients.map((client) => {
                const st = statusMap[client.status]
                return (
                  <TableRow
                    key={client.id}
                    className="cursor-pointer hover:bg-accent/50"
                    onClick={() => openEdit(client)}
                  >
                    <TableCell className="font-medium text-muted-foreground">{client.id}</TableCell>
                    <TableCell className="text-muted-foreground">{client.createdAt}</TableCell>
                    <TableCell className="font-medium">{client.companyName}</TableCell>
                    <TableCell className="text-sm">
                      {client.contracts.length === 0 ? "\u2014" : (
                        <div className="flex flex-col gap-0.5">
                          {client.contracts.map((ct, i) => (
                            <span key={i} className="flex items-center gap-1.5">
                              <span className="font-mono">{ct.number}</span>
                              <Badge variant="outline" className="text-[10px] px-1 py-0">{contractTypeLabels[ct.type]}</Badge>
                            </span>
                          ))}
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="font-mono text-xs">{client.inn}</TableCell>
                    <TableCell>{client.email}</TableCell>
                    <TableCell>{client.phone}</TableCell>
                    <TableCell>
                      <Badge variant={st.variant}>{st.label}</Badge>
                    </TableCell>
  <TableCell>
  <div className="flex items-center gap-1">
  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={(e) => { e.stopPropagation(); openEdit(client) }}>
  <Pencil className="h-4 w-4" />
  </Button>
  <Button variant="ghost" size="icon" className="h-8 w-8" asChild onClick={(e) => e.stopPropagation()}>
  <Link href={"/admin/deals/new?client=" + encodeURIComponent(client.companyName)} title="Создать сделку">
  <FileText className="h-4 w-4" />
  </Link>
  </Button>
  </div>
  </TableCell>
                  </TableRow>
                )
              })
            )}
          </TableBody>
        </Table>
      </div>

      {/* sheet form */}
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent className="w-full overflow-y-auto sm:max-w-xl">
          <SheetHeader>
            <SheetTitle className="font-display">
              {editingId !== null ? `Редактирование клиента #${editingId}` : "Новый клиент"}
            </SheetTitle>
          </SheetHeader>

          <div className="mt-6 space-y-8">
            {/* --- main --- */}
            <section className="space-y-4">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Основное</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Тип</Label>
                  <Select value={form.type} onValueChange={(v) => updateField("type", v as "ИП" | "ООО")}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ИП">ИП</SelectItem>
                      <SelectItem value="ООО">ООО</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Статус</Label>
                  <Select value={form.status} onValueChange={(v) => updateField("status", v as Client["status"])}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="calc">Расчет</SelectItem>
                      <SelectItem value="active">Активный</SelectItem>
                      <SelectItem value="inactive">Неактивный</SelectItem>
                      <SelectItem value="blacklist">Черный список</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Название для нас (внутреннее)</Label>
                <Input value={form.internalName} onChange={(e) => updateField("internalName", e.target.value)} placeholder="Любое название, видно только админам" />
              </div>
            </section>

            {/* --- contracts --- */}
            <section className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Договоры</h3>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="gap-1"
                  onClick={() => setForm((prev) => ({ ...prev, contracts: [...prev.contracts, { ...emptyContract }] }))}
                >
                  <Plus className="h-3 w-3" />
                  Добавить
                </Button>
              </div>
              {form.contracts.length === 0 && (
                <p className="text-sm text-muted-foreground">Договоры не добавлены</p>
              )}
              {form.contracts.map((ct, idx) => (
                <div key={idx} className="rounded-lg border border-border p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-muted-foreground">{"Договор #" + (idx + 1)}</span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-destructive hover:text-destructive"
                      onClick={() => setForm((prev) => ({ ...prev, contracts: prev.contracts.filter((_, i) => i !== idx) }))}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    <div className="space-y-1">
                      <Label className="text-xs">{"N\u00B0 договора"}</Label>
                      <Input
                        value={ct.number}
                        onChange={(e) => {
                          const next = [...form.contracts]
                          next[idx] = { ...next[idx], number: e.target.value }
                          setForm((prev) => ({ ...prev, contracts: next }))
                        }}
                        placeholder="ВЭД-2026/001"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Тип</Label>
                      <select
                        value={ct.type}
                        onChange={(e) => {
                          const next = [...form.contracts]
                          next[idx] = { ...next[idx], type: e.target.value as ContractType }
                          setForm((prev) => ({ ...prev, contracts: next }))
                        }}
                        className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm text-foreground ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                      >
                        <option value="supply">Поставки</option>
                        <option value="commission">Комиссии</option>
                        <option value="transport">Перевозки</option>
                      </select>
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Дата</Label>
                      <Input
                        type="date"
                        value={ct.date}
                        onChange={(e) => {
                          const next = [...form.contracts]
                          next[idx] = { ...next[idx], date: e.target.value }
                          setForm((prev) => ({ ...prev, contracts: next }))
                        }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </section>

            {/* --- requisites --- */}
            <section className="space-y-4">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Реквизиты</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>ИНН</Label>
                  <Input value={form.inn} onChange={(e) => updateField("inn", e.target.value)} placeholder="7707123456" />
                </div>
                {form.type === "ООО" && (
                  <div className="space-y-2">
                    <Label>КПП</Label>
                    <Input value={form.kpp} onChange={(e) => updateField("kpp", e.target.value)} placeholder="770701001" />
                  </div>
                )}
                <div className="space-y-2">
                  <Label>ОГРН</Label>
                  <Input value={form.ogrn} onChange={(e) => updateField("ogrn", e.target.value)} placeholder="1027700132195" />
                </div>
                <div className="space-y-2">
                  <Label>Название компании</Label>
                  <Input value={form.companyName} onChange={(e) => updateField("companyName", e.target.value)} placeholder='ООО "Компания"' />
                </div>
              </div>
            </section>

            {/* --- bank --- */}
            <section className="space-y-4">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Банковские реквизиты</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>БИК</Label>
                  <Input value={form.bik} onChange={(e) => updateField("bik", e.target.value)} placeholder="044525225" />
                </div>
                <div className="space-y-2">
                  <Label>Название банка</Label>
                  <Input value={form.bankName} onChange={(e) => updateField("bankName", e.target.value)} placeholder="ПАО Сбербанк" />
                </div>
                <div className="space-y-2">
                  <Label>{"К/С"}</Label>
                  <Input value={form.ks} onChange={(e) => updateField("ks", e.target.value)} placeholder="30101810400000000225" />
                </div>
                <div className="space-y-2">
                  <Label>{"Р/С"}</Label>
                  <Input value={form.rs} onChange={(e) => updateField("rs", e.target.value)} placeholder="40702810938000012345" />
                </div>
              </div>
            </section>

            {/* --- address --- */}
            <section className="space-y-4">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Адрес</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Индекс</Label>
                  <Input value={form.address.index} onChange={(e) => updateAddress("index", e.target.value)} placeholder="101000" />
                </div>
                <div className="space-y-2">
                  <Label>Область</Label>
                  <Input value={form.address.region} onChange={(e) => updateAddress("region", e.target.value)} placeholder="Московская обл." />
                </div>
                <div className="space-y-2">
                  <Label>Город</Label>
                  <Input value={form.address.city} onChange={(e) => updateAddress("city", e.target.value)} placeholder="Москва" />
                </div>
                <div className="space-y-2">
                  <Label>Улица</Label>
                  <Input value={form.address.street} onChange={(e) => updateAddress("street", e.target.value)} placeholder="Мясницкая" />
                </div>
                <div className="space-y-2">
                  <Label>Дом</Label>
                  <Input value={form.address.house} onChange={(e) => updateAddress("house", e.target.value)} placeholder="11" />
                </div>
                <div className="space-y-2">
                  <Label>{"Квартира / Офис"}</Label>
                  <Input value={form.address.office} onChange={(e) => updateAddress("office", e.target.value)} placeholder="305" />
                </div>
              </div>
            </section>

            {/* --- contacts --- */}
            <section className="space-y-4">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Контакты</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>E-mail</Label>
                  <Input type="email" value={form.email} onChange={(e) => updateField("email", e.target.value)} placeholder="client@company.ru" />
                </div>
                <div className="space-y-2">
                  <Label>Телефон</Label>
                  <Input value={form.phone} onChange={(e) => updateField("phone", e.target.value)} placeholder="+7 (999) 123-45-67" />
                </div>
                <div className="space-y-2">
                  <Label>WeChat</Label>
                  <Input value={form.wechat} onChange={(e) => updateField("wechat", e.target.value)} placeholder="wechat_id" />
                </div>
                <div className="space-y-2">
                  <Label>Telegram</Label>
                  <Input value={form.telegram} onChange={(e) => updateField("telegram", e.target.value)} placeholder="@username" />
                </div>
              </div>
            </section>

            {/* --- comment --- */}
            <section className="space-y-4">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Внутренний комментарий</h3>
              <Textarea
                value={form.comment}
                onChange={(e) => updateField("comment", e.target.value)}
                placeholder="Информация о клиенте для внутреннего использования..."
                className="min-h-24"
              />
            </section>

            {/* --- actions --- */}
            <div className="flex gap-3 border-t border-border pt-6">
              <Button onClick={handleSave} className="flex-1">
                {editingId !== null ? "Сохранить" : "Добавить клиента"}
              </Button>
              <Button variant="outline" onClick={() => setOpen(false)} className="flex-1">
                Отмена
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  )
}

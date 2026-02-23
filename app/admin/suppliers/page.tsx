"use client"

import { useEffect, useState } from "react"
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
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { Plus, Pencil, Trash2 } from "lucide-react"

/* ---------- types ---------- */
interface SupplierAddress {
  zh: string
  en: string
  ru: string
}

interface SupplierBank {
  bankNameZh: string
  accountNumber: string
  cnaps: string
  beneficiary: string
}

type SupplierTag = "manufacturer" | "seller" | "exporter"

interface Supplier {
  id: number
  nameZh: string
  nameEn: string
  nameRu: string
  license: string
  address: SupplierAddress
  bank: SupplierBank
  tags: SupplierTag[]
}

const emptySupplier: Omit<Supplier, "id"> = {
  nameZh: "",
  nameEn: "",
  nameRu: "",
  license: "",
  address: { zh: "", en: "", ru: "" },
  bank: { bankNameZh: "", accountNumber: "", cnaps: "", beneficiary: "" },
  tags: [],
}

const tagLabels: Record<SupplierTag, string> = {
  manufacturer: "Производитель",
  seller: "Продавец",
  exporter: "Экспортер",
}

/* ---------- seed data ---------- */
const seedSuppliers: Supplier[] = [
  {
    id: 1,
    nameZh: "深圳市华强电子有限公司",
    nameEn: "Shenzhen Huaqiang Electronics Co., Ltd.",
    nameRu: "Шэньчжэнь Хуацян Электроникс",
    license: "91440300MA5EQXXX",
    address: {
      zh: "深圳市福田区华强北路1号",
      en: "No.1 Huaqiang North Road, Futian District, Shenzhen",
      ru: "г. Шэньчжэнь, район Футянь, ул. Хуацян Бэй, д. 1",
    },
    bank: {
      bankNameZh: "中国银行深圳分行",
      accountNumber: "7621 0815 0001 2345 678",
      cnaps: "104584000045",
      beneficiary: "SHENZHEN HUAQIANG ELECTRONICS CO LTD",
    },
    tags: ["manufacturer", "exporter"],
  },
  {
    id: 2,
    nameZh: "广州市百达贸易有限公司",
    nameEn: "Guangzhou Baida Trading Co., Ltd.",
    nameRu: "Гуанчжоу Байда Трейдинг",
    license: "91440101MA9UXXXX",
    address: {
      zh: "广州市越秀区北京路168号",
      en: "No.168 Beijing Road, Yuexiu District, Guangzhou",
      ru: "г. Гуанчжоу, район Юэсю, ул. Пекинская, д. 168",
    },
    bank: {
      bankNameZh: "中国工商银行广州分行",
      accountNumber: "3602 0231 0920 0012 345",
      cnaps: "102581000003",
      beneficiary: "GUANGZHOU BAIDA TRADING CO LTD",
    },
    tags: ["seller"],
  },
  {
    id: 3,
    nameZh: "义乌市锦程进出口有限公司",
    nameEn: "Yiwu Jincheng Import & Export Co., Ltd.",
    nameRu: "Иу Цзиньчэн Импорт Экспорт",
    license: "91330782MA2AXXXX",
    address: {
      zh: "义乌市国际商贸城A区3栋",
      en: "Block A-3, Yiwu International Trade City, Yiwu",
      ru: "г. Иу, Международный торговый центр, корпус А-3",
    },
    bank: {
      bankNameZh: "中国建设银行义乌支行",
      accountNumber: "3305 7001 0400 5012 345",
      cnaps: "105587000012",
      beneficiary: "YIWU JINCHENG IMPORT EXPORT CO LTD",
    },
    tags: ["manufacturer", "seller", "exporter"],
  },
]

/* ---------- component ---------- */
export default function SuppliersPage() {
  const [suppliers, setSuppliers] = useState<Supplier[]>(seedSuppliers)
  const [isSaving, setIsSaving] = useState(false)
  const [open, setOpen] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [form, setForm] = useState<Omit<Supplier, "id">>({
    ...emptySupplier,
    address: { ...emptySupplier.address },
    bank: { ...emptySupplier.bank },
    tags: [],
  })

  useEffect(() => {
    fetch("/api/admin/suppliers")
      .then((response) => response.json())
      .then((result) => {
        if (result?.ok && Array.isArray(result.items)) {
          setSuppliers(result.items)
        }
      })
      .catch(() => {})
  }, [])

  function openNew() {
    setEditingId(null)
    setForm({
      ...emptySupplier,
      address: { ...emptySupplier.address },
      bank: { ...emptySupplier.bank },
      tags: [],
    })
    setOpen(true)
  }

  function openEdit(supplier: Supplier) {
    setEditingId(supplier.id)
    const { id: _id, ...rest } = supplier
    setForm({
      ...rest,
      address: { ...supplier.address },
      bank: { ...supplier.bank },
      tags: [...supplier.tags],
    })
    setOpen(true)
  }

  async function handleSave() {
    setIsSaving(true)

    try {
    if (editingId !== null) {
      const payload = { ...form, address: { ...form.address }, bank: { ...form.bank }, tags: [...form.tags] }
      const response = await fetch(`/api/admin/suppliers/${editingId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
      if (!response.ok) throw new Error("save failed")

      setSuppliers((prev) => prev.map((s) => (s.id === editingId ? { ...s, ...payload } : s)))
    } else {
      const payload = { ...form, address: { ...form.address }, bank: { ...form.bank }, tags: [...form.tags] }
      const response = await fetch("/api/admin/suppliers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
      const result = await response.json().catch(() => null)
      if (!response.ok || !result?.id) throw new Error("create failed")

      setSuppliers((prev) => [{ id: result.id, ...payload }, ...prev])
    }
    setOpen(false)
    } catch {
      alert("Не удалось сохранить поставщика")
    } finally {
      setIsSaving(false)
    }
  }

  async function handleDelete(supplierId: number) {
    if (!confirm("Удалить поставщика?")) return

    const response = await fetch(`/api/admin/suppliers/${supplierId}`, { method: "DELETE" })
    if (!response.ok) {
      alert("Не удалось удалить поставщика")
      return
    }

    setSuppliers((prev) => prev.filter((item) => item.id !== supplierId))
  }

  function toggleTag(tag: SupplierTag) {
    setForm((prev) => ({
      ...prev,
      tags: prev.tags.includes(tag) ? prev.tags.filter((t) => t !== tag) : [...prev.tags, tag],
    }))
  }

  return (
    <div className="space-y-6">
      {/* header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground">Поставщики</h1>
          <p className="text-sm text-muted-foreground">Управление базой поставщиков</p>
        </div>
        <Button onClick={openNew} className="gap-2">
          <Plus className="h-4 w-4" />
          Добавить поставщика
        </Button>
      </div>

      {/* table */}
      <div className="rounded-xl border border-border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">ID</TableHead>
              <TableHead>Название (кит.)</TableHead>
              <TableHead>Название (англ.)</TableHead>
              <TableHead>Название (рус.)</TableHead>
              <TableHead>Лицензия</TableHead>
              <TableHead>Метки</TableHead>
              <TableHead className="w-12" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {suppliers.map((supplier) => (
              <TableRow
                key={supplier.id}
                className="cursor-pointer hover:bg-accent/50"
                onClick={() => openEdit(supplier)}
              >
                <TableCell className="font-medium text-muted-foreground">{supplier.id}</TableCell>
                <TableCell>{supplier.nameZh}</TableCell>
                <TableCell>{supplier.nameEn}</TableCell>
                <TableCell className="font-medium">{supplier.nameRu}</TableCell>
                <TableCell className="font-mono text-xs">{supplier.license}</TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-1">
                    {supplier.tags.map((tag) => (
                      <Badge key={tag} variant="secondary" className="text-xs">
                        {tagLabels[tag]}
                      </Badge>
                    ))}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={(e) => {
                        e.stopPropagation()
                        openEdit(supplier)
                      }}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleDelete(supplier.id)
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* sheet form */}
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent className="w-full overflow-y-auto sm:max-w-xl">
          <SheetHeader>
            <SheetTitle className="font-display">
              {editingId !== null ? `Редактирование поставщика #${editingId}` : "Новый поставщик"}
            </SheetTitle>
          </SheetHeader>

          <div className="mt-6 space-y-8">
            {/* --- names --- */}
            <section className="space-y-4">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                Название компании
              </h3>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Китайский</Label>
                  <Input
                    value={form.nameZh}
                    onChange={(e) => setForm({ ...form, nameZh: e.target.value })}
                    placeholder="深圳市华强电子有限公司"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Английский</Label>
                  <Input
                    value={form.nameEn}
                    onChange={(e) => setForm({ ...form, nameEn: e.target.value })}
                    placeholder="Shenzhen Huaqiang Electronics Co., Ltd."
                  />
                </div>
                <div className="space-y-2">
                  <Label>Русский</Label>
                  <Input
                    value={form.nameRu}
                    onChange={(e) => setForm({ ...form, nameRu: e.target.value })}
                    placeholder="Шэньчжэнь Хуацян Электроникс"
                  />
                </div>
              </div>
            </section>

            {/* --- license --- */}
            <section className="space-y-4">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                Лицензия
              </h3>
              <div className="space-y-2">
                <Label>Номер лицензии</Label>
                <Input
                  value={form.license}
                  onChange={(e) => setForm({ ...form, license: e.target.value })}
                  placeholder="91440300MA5EQXXX"
                />
              </div>
            </section>

            {/* --- address --- */}
            <section className="space-y-4">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                Адрес
              </h3>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Китайский</Label>
                  <Input
                    value={form.address.zh}
                    onChange={(e) => setForm({ ...form, address: { ...form.address, zh: e.target.value } })}
                    placeholder="深圳市福田区华强北路1号"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Английский</Label>
                  <Input
                    value={form.address.en}
                    onChange={(e) => setForm({ ...form, address: { ...form.address, en: e.target.value } })}
                    placeholder="No.1 Huaqiang North Road, Futian District, Shenzhen"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Русский</Label>
                  <Input
                    value={form.address.ru}
                    onChange={(e) => setForm({ ...form, address: { ...form.address, ru: e.target.value } })}
                    placeholder="г. Шэньчжэнь, район Футянь, ул. Хуацян Бэй, д. 1"
                  />
                </div>
              </div>
            </section>

            {/* --- bank --- */}
            <section className="space-y-4">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                Банковские реквизиты
              </h3>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Название банка (кит.)</Label>
                  <Input
                    value={form.bank.bankNameZh}
                    onChange={(e) => setForm({ ...form, bank: { ...form.bank, bankNameZh: e.target.value } })}
                    placeholder="中国银行深圳分行"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Номер счета</Label>
                  <Input
                    value={form.bank.accountNumber}
                    onChange={(e) => setForm({ ...form, bank: { ...form.bank, accountNumber: e.target.value } })}
                    placeholder="7621 0815 0001 2345 678"
                  />
                </div>
                <div className="space-y-2">
                  <Label>CNAPS</Label>
                  <Input
                    value={form.bank.cnaps}
                    onChange={(e) => setForm({ ...form, bank: { ...form.bank, cnaps: e.target.value } })}
                    placeholder="104584000045"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Имя бенефициара</Label>
                  <Input
                    value={form.bank.beneficiary}
                    onChange={(e) => setForm({ ...form, bank: { ...form.bank, beneficiary: e.target.value } })}
                    placeholder="SHENZHEN HUAQIANG ELECTRONICS CO LTD"
                  />
                </div>
              </div>
            </section>

            {/* --- tags --- */}
            <section className="space-y-4">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                Метка
              </h3>
              <p className="text-xs text-muted-foreground">
                Можно выбрать одну или несколько меток
              </p>
              <div className="flex flex-wrap gap-2">
                {(Object.keys(tagLabels) as SupplierTag[]).map((tag) => {
                  const isSelected = form.tags.includes(tag)
                  return (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => toggleTag(tag)}
                      className={`rounded-lg border px-4 py-2 text-sm font-medium transition-colors ${
                        isSelected
                          ? "border-primary bg-primary text-primary-foreground"
                          : "border-border bg-background text-muted-foreground hover:bg-accent hover:text-foreground"
                      }`}
                    >
                      {tagLabels[tag]}
                    </button>
                  )
                })}
              </div>
            </section>

            {/* --- actions --- */}
            <div className="flex gap-3 border-t border-border pt-6">
              <Button onClick={handleSave} className="flex-1" disabled={isSaving}>
                {isSaving ? "Сохраняем..." : editingId !== null ? "Сохранить" : "Добавить поставщика"}
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

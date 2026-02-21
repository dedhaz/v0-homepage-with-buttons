import type { DealCalcResult } from "./deal-calc"
import { fmtNum, toRub } from "./deal-calc"
import type { DealRates, Currency } from "./deal-types"
import { CURRENCY_SYMBOLS } from "./deal-types"

interface ExportParams {
  calc: DealCalcResult
  rates: DealRates
  incoterms: string
  cityFrom: string
  cityTo: string
  deliveryCostTotal: number
  deliveryCostCurrency: Currency
  deliveryRussiaLocal: number
  deliveryRussiaLocalCurrency: Currency
  commissionImporterUsd: number
  swiftUsd: number
  declarant: string
  importer: string
  commissionPercent: number
  itemsCurrency: Currency
}

export async function exportDealToExcel(params: ExportParams) {
  const { default: ExcelJS } = await import("exceljs")
  const wb = new ExcelJS.Workbook()
  const ws = wb.addWorksheet("КП Расчет")

  const { calc, rates, incoterms, cityFrom, cityTo, deliveryCostTotal, deliveryCostCurrency,
    deliveryRussiaLocal, deliveryRussiaLocalCurrency, commissionImporterUsd, swiftUsd,
    declarant, importer, commissionPercent, itemsCurrency } = params

  /* Header row */
  ws.columns = [
    { header: "Статья расходов", key: "name", width: 50 },
    { header: "Валюта", key: "cur", width: 10 },
    { header: "Сумма", key: "amount", width: 18 },
    { header: "Сумма, \u20BD", key: "rub", width: 22 },
  ]

  const headerRow = ws.getRow(1)
  headerRow.font = { bold: true }
  headerRow.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFE0E0E0" } }

  /* Invoice */
  const invoiceLabel = "Инвойс" + (importer === "longan" && commissionPercent ? " (Фин.логистика + компания импортер) " + commissionPercent + "%" : "")
  ws.addRow([invoiceLabel, CURRENCY_SYMBOLS[itemsCurrency], fmtNum(calc.totalGoodsOriginal + calc.invoiceCommissionOriginal), fmtNum(calc.totalGoodsRub + calc.invoiceCommissionRub) + " \u20BD"])

  /* Delivery */
  ws.addRow([incoterms + " " + cityFrom + " \u2013 " + cityTo, CURRENCY_SYMBOLS[deliveryCostCurrency], fmtNum(deliveryCostTotal), fmtNum(calc.deliveryTotalRub) + " \u20BD"])

  if (deliveryRussiaLocal > 0) {
    ws.addRow(["Автовывоз по " + cityTo, CURRENCY_SYMBOLS[deliveryRussiaLocalCurrency], fmtNum(deliveryRussiaLocal), fmtNum(calc.deliveryRussiaLocalRub) + " \u20BD"])
  }

  /* Customs */
  const customsRow = ws.addRow(["СТП - Совокупный Таможенный Платеж", "", "", fmtNum(calc.totalCustomsPayments + calc.customsFee) + " \u20BD"])
  customsRow.font = { bold: true }
  customsRow.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFFFFFCC" } }

  if (calc.customsFee > 0) ws.addRow(["  Сбор", "", fmtNum(calc.customsFee, 0), ""])
  ws.addRow(["  Пошлина", "", fmtNum(calc.totalDuty, 2), ""])
  if (calc.totalExcise > 0) ws.addRow(["  Акциз", "", fmtNum(calc.totalExcise, 2), ""])
  if (calc.totalAntiDumping > 0) ws.addRow(["  Антидемпинговая пошлина", "", fmtNum(calc.totalAntiDumping, 2), ""])
  ws.addRow(["  НДС", "", fmtNum(calc.totalVat, 2), ""])

  if (declarant === "our") {
    ws.addRow(["Таможенное оформление", "", "", fmtNum(calc.customsFee) + " \u20BD"])
  }

  if (commissionImporterUsd > 0) {
    ws.addRow(["Комиссия импортера", "$", fmtNum(commissionImporterUsd), fmtNum(calc.commissionImporterRub) + " \u20BD"])
  }

  if (swiftUsd > 0) {
    ws.addRow(["СВИФТ", "$", fmtNum(swiftUsd), fmtNum(calc.swiftRub) + " \u20BD"])
  }

  /* Grand total */
  const totalRow = ws.addRow(["Итого поставка:", "", "", fmtNum(calc.grandTotal) + " \u20BD"])
  totalRow.font = { bold: true, size: 13 }
  totalRow.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFCCFFCC" } }

  /* Summary */
  ws.addRow([])
  ws.addRow(["Общий объем:", fmtNum(calc.totalVolume, 4) + " m\u00B3"])
  ws.addRow(["Общий вес:", fmtNum(calc.totalWeight, 1) + " кг"])
  ws.addRow(["Позиций:", calc.items.length.toString()])

  /* Generate and download */
  const buf = await wb.xlsx.writeBuffer()
  const blob = new Blob([buf], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" })
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = "deal-calculation.xlsx"
  a.click()
  URL.revokeObjectURL(url)
}

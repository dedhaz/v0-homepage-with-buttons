import type { Deal, DealItem, DealRates, Currency } from "./deal-types"

export function toRub(amount: number, currency: Currency, rates: DealRates): number {
  if (currency === "RUB") return amount
  if (currency === "USD") return amount * rates.usd
  return amount * rates.cny
}

export function fmtNum(n: number, decimals = 2): string {
  return n.toLocaleString("ru-RU", { minimumFractionDigits: decimals, maximumFractionDigits: decimals })
}

function unitVolume(item: DealItem): number {
  const l = item.dimUnitL
  const w = item.dimUnitW
  const h = item.dimUnitH
  if (!l || !w || !h) return 0
  return (l * w * h) / 1_000_000
}

function packageVolume(item: DealItem): number {
  const l = item.dimPackageL
  const w = item.dimPackageW
  const h = item.dimPackageH
  if (!l || !w || !h) return 0
  return (l * w * h) / 1_000_000
}

function calcCustomsFee2026(customsValueRub: number) {
  if (customsValueRub <= 200_000) return 1231
  if (customsValueRub <= 450_000) return 2462
  if (customsValueRub <= 1_200_000) return 4924
  if (customsValueRub <= 2_700_000) return 13_541
  if (customsValueRub <= 4_200_000) return 18_465
  if (customsValueRub <= 5_500_000) return 21_344
  if (customsValueRub <= 10_000_000) return 49_240
  return 73_860
}

export interface ItemCalc {
  item: DealItem
  totalPriceOriginal: number
  totalPriceRub: number
  totalVolume: number
  totalWeight: number
  deliveryShareRub: number
  dutyBaseRub: number
  dutyRub: number
  exciseRub: number
  antiDumpingRub: number
  vatBaseRub: number
  vatRub: number
  customsTotal: number
}

export interface DealCalcResult {
  items: ItemCalc[]
  totalGoodsRub: number
  totalGoodsOriginal: number
  totalVolume: number
  totalWeight: number
  deliveryTotalRub: number
  deliveryChinaLocalRub: number
  deliveryRussiaLocalRub: number
  customsFee: number
  declarationFee: number
  totalDuty: number
  totalVat: number
  dutyByTnved: Array<{ tnved: string; amount: number }>
  totalExcise: number
  totalAntiDumping: number
  totalCustomsPayments: number
  invoiceCommissionRub: number
  invoiceCommissionOriginal: number
  commissionImporterRub: number
  swiftRub: number
  grandTotal: number
}

export function calcDeal(deal: Deal): DealCalcResult {
  const rates = deal.rates

  const itemCalcs: ItemCalc[] = deal.items.map((item) => {
    const totalPriceOriginal = item.priceSale * item.quantity
    const totalPriceRub = toRub(totalPriceOriginal, item.priceCurrency, rates)

    let totalVolume = 0
    let totalWeight = 0

    const hasPackageInfo =
      item.qtyInPackage > 0 &&
      packageVolume(item) > 0 &&
      item.weightBruttoPackage > 0

    if (hasPackageInfo) {
      const packages = Math.ceil(item.quantity / item.qtyInPackage)
      totalVolume = packages * packageVolume(item)
      totalWeight = packages * item.weightBruttoPackage
    } else {
      const uVol = unitVolume(item)
      totalVolume = uVol > 0 ? uVol * item.quantity * 1.25 : 0
      totalWeight = item.weightBruttoUnit > 0 ? item.weightBruttoUnit * item.quantity * 1.1 : 0
    }

    if ((item.manualTotalVolume || 0) > 0) {
      totalVolume = item.manualTotalVolume || 0
    }
    if ((item.manualTotalWeight || 0) > 0) {
      totalWeight = item.manualTotalWeight || 0
    }

    return {
      item,
      totalPriceOriginal,
      totalPriceRub,
      totalVolume,
      totalWeight,
      deliveryShareRub: 0,
      dutyBaseRub: 0,
      dutyRub: 0,
      exciseRub: 0,
      antiDumpingRub: 0,
      vatBaseRub: 0,
      vatRub: 0,
      customsTotal: 0,
    }
  })

  const totalVolume = itemCalcs.reduce((s, ic) => s + ic.totalVolume, 0)
  const totalWeight = itemCalcs.reduce((s, ic) => s + ic.totalWeight, 0)
  const totalGoodsRub = itemCalcs.reduce((s, ic) => s + ic.totalPriceRub, 0)
  const totalGoodsOriginal = itemCalcs.reduce((s, ic) => s + ic.totalPriceOriginal, 0)

  const deliveryTotalRub = toRub(deal.deliveryCostTotal, deal.deliveryCostCurrency, rates)
  const deliveryChinaLocalRub = toRub(deal.deliveryChinaLocal, deal.deliveryChinaLocalCurrency, rates)
  const deliveryRussiaLocalRub = toRub(deal.deliveryRussiaLocal, deal.deliveryRussiaLocalCurrency, rates)

  for (const ic of itemCalcs) {
    if (totalVolume > 0) {
      ic.deliveryShareRub = deliveryTotalRub * (ic.totalVolume / totalVolume)
    } else if (totalWeight > 0) {
      ic.deliveryShareRub = deliveryTotalRub * (ic.totalWeight / totalWeight)
    } else if (totalGoodsRub > 0) {
      ic.deliveryShareRub = deliveryTotalRub * (ic.totalPriceRub / totalGoodsRub)
    }
  }

  for (const ic of itemCalcs) {
    let chinaDeliveryShare = 0
    if (totalVolume > 0) {
      chinaDeliveryShare = deliveryChinaLocalRub * (ic.totalVolume / totalVolume)
    } else if (totalWeight > 0) {
      chinaDeliveryShare = deliveryChinaLocalRub * (ic.totalWeight / totalWeight)
    } else if (totalGoodsRub > 0) {
      chinaDeliveryShare = deliveryChinaLocalRub * (ic.totalPriceRub / totalGoodsRub)
    }

    // (общая стоимость + доставка по Китаю) * пошлина
    ic.dutyBaseRub = ic.totalPriceRub + chinaDeliveryShare
    ic.dutyRub = ic.dutyBaseRub * (ic.item.dutyPercent / 100)

    // (стоимость товара + доставка по Китаю + пошлина) * НДС
    ic.vatBaseRub = ic.totalPriceRub + chinaDeliveryShare + ic.dutyRub
    ic.vatRub = ic.vatBaseRub * (ic.item.vatPercent / 100)

    ic.exciseRub = ic.item.excise * ic.item.quantity
    ic.antiDumpingRub = ic.dutyBaseRub * (ic.item.antiDumping / 100)
    ic.customsTotal = ic.dutyRub + ic.vatRub + ic.exciseRub + ic.antiDumpingRub
  }

  const totalDuty = itemCalcs.reduce((s, ic) => s + ic.dutyRub, 0)
  const totalVat = itemCalcs.reduce((s, ic) => s + ic.vatRub, 0)
  const totalExcise = itemCalcs.reduce((s, ic) => s + ic.exciseRub, 0)
  const totalAntiDumping = itemCalcs.reduce((s, ic) => s + ic.antiDumpingRub, 0)
  const totalCustomsPayments = totalDuty + totalVat + totalExcise + totalAntiDumping

  const dutyByTnvedMap = new Map<string, number>()
  for (const ic of itemCalcs) {
    const key = ic.item.tnved?.trim() || "Без ТНВЭД"
    dutyByTnvedMap.set(key, (dutyByTnvedMap.get(key) || 0) + ic.dutyRub)
  }
  const dutyByTnved = Array.from(dutyByTnvedMap.entries()).map(([tnved, amount]) => ({ tnved, amount }))

  const itemCount = deal.items.length
  let declarationFee = 0
  let customsFee = 0
  if (deal.declarant === "our") {
    declarationFee = itemCount <= 5 ? 25000 : 25000 + (itemCount - 5) * 600
    customsFee = calcCustomsFee2026(totalGoodsRub + deliveryChinaLocalRub)
    if (deal.customsCostManual > 0) {
      declarationFee = deal.customsCostManual
    }
  }

  let invoiceCommissionRub = 0
  let invoiceCommissionOriginal = 0
  if (deal.importer === "longan" && deal.commissionPercent > 0) {
    invoiceCommissionOriginal = totalGoodsOriginal * (deal.commissionPercent / 100)
    invoiceCommissionRub = totalGoodsRub * (deal.commissionPercent / 100)
  }

  const commissionImporterRub = deal.commissionImporterUsd * rates.usd
  const swiftRub = deal.swiftUsd * rates.usd

  const grandTotal =
    totalGoodsRub +
    deliveryTotalRub +
    deliveryChinaLocalRub +
    deliveryRussiaLocalRub +
    totalCustomsPayments +
    customsFee +
    declarationFee +
    invoiceCommissionRub +
    commissionImporterRub +
    swiftRub

  return {
    items: itemCalcs,
    totalGoodsRub,
    totalGoodsOriginal,
    totalVolume,
    totalWeight,
    deliveryTotalRub,
    deliveryChinaLocalRub,
    deliveryRussiaLocalRub,
    customsFee,
    declarationFee,
    totalDuty,
    totalVat,
    dutyByTnved,
    totalExcise,
    totalAntiDumping,
    totalCustomsPayments,
    invoiceCommissionRub,
    invoiceCommissionOriginal,
    commissionImporterRub,
    swiftRub,
    grandTotal,
  }
}

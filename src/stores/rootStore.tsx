import { createContext, type ReactNode, useContext } from 'react'
import { makeAutoObservable } from 'mobx'

export type LanguageCode = 'ru' | 'en'

export type ScenarioType = 'base' | 'optimistic' | 'pessimistic'

export type IndicatorCategory =
  | 'economy'
  | 'investment'
  | 'construction'
  | 'demography'
  | 'labour'
  | 'social'

export interface SparkPoint {
  year: number
  value: number
}

export interface Indicator {
  id: string
  name: string
  category: IndicatorCategory
  description: string
  source: string
  updateFrequency: string
  currentValue: number
  unit: string
  yoyChangePercent: number
  sparkline: SparkPoint[]
}

export interface TimeSeriesPoint {
  year: number
  actual?: number
  forecast?: number
  lower?: number
  upper?: number
}

export interface ShapFactorContribution {
  id: string
  name: string
  contribution: number
}

class UiStore {
  language: LanguageCode = 'ru'

  notifications: {
    id: string
    type: 'info' | 'warning' | 'success'
    title: string
    time: string
  }[] = [
    {
      id: 'n1',
      type: 'info',
      title: 'Обновлены данные за январь 2026',
      time: 'сегодня',
    },
    {
      id: 'n2',
      type: 'warning',
      title: 'Существенное отклонение прогноза по инвестициям',
      time: 'вчера',
    },
    {
      id: 'n3',
      type: 'success',
      title: 'Добавлен новый дашборд по демографии',
      time: '3 дня назад',
    },
  ]

  constructor() {
    makeAutoObservable(this, {}, { autoBind: true })
  }

  setLanguage(language: LanguageCode) {
    this.language = language
  }
}

class IndicatorStore {
  indicators: Indicator[] = []
  favorites = new Set<string>()
  searchQuery = ''
  activeCategory: IndicatorCategory | 'all' = 'all'

  constructor() {
    makeAutoObservable(this, {}, { autoBind: true })
    this.indicators = this.createDemoIndicators()
  }

  private createDemoIndicators(): Indicator[] {
    return [
      {
        id: 'invest_total',
        name: 'Общий объём инвестиций',
        category: 'investment',
        description: 'Совокупный объём инвестиций в основной капитал по региону.',
        source: 'Росстат, региональные органы статистики',
        updateFrequency: 'ежеквартально',
        currentValue: 1250,
        unit: 'млрд ₽',
        yoyChangePercent: 6.4,
        sparkline: [
          { year: 2021, value: 980 },
          { year: 2022, value: 1050 },
          { year: 2023, value: 1120 },
          { year: 2024, value: 1175 },
          { year: 2025, value: 1250 },
        ],
      },
      {
        id: 'gdp_region',
        name: 'Валовой региональный продукт',
        category: 'economy',
        description: 'Совокупная стоимость товаров и услуг, произведённых в регионе.',
        source: 'Росстат',
        updateFrequency: 'ежегодно',
        currentValue: 3450,
        unit: 'млрд ₽',
        yoyChangePercent: 3.1,
        sparkline: [
          { year: 2021, value: 2950 },
          { year: 2022, value: 3100 },
          { year: 2023, value: 3250 },
          { year: 2024, value: 3340 },
          { year: 2025, value: 3450 },
        ],
      },
      {
        id: 'population',
        name: 'Численность населения',
        category: 'demography',
        description: 'Постоянное население региона на начало года.',
        source: 'Росстат, органы ЗАГС',
        updateFrequency: 'ежегодно',
        currentValue: 2.85,
        unit: 'млн человек',
        yoyChangePercent: -0.7,
        sparkline: [
          { year: 2021, value: 2.93 },
          { year: 2022, value: 2.91 },
          { year: 2023, value: 2.89 },
          { year: 2024, value: 2.87 },
          { year: 2025, value: 2.85 },
        ],
      },
      {
        id: 'unemployment',
        name: 'Уровень безработицы',
        category: 'labour',
        description: 'Доля безработных в экономически активном населении.',
        source: 'Служба занятости',
        updateFrequency: 'ежемесячно',
        currentValue: 4.6,
        unit: '%',
        yoyChangePercent: -0.5,
        sparkline: [
          { year: 2021, value: 5.8 },
          { year: 2022, value: 5.3 },
          { year: 2023, value: 5.0 },
          { year: 2024, value: 4.8 },
          { year: 2025, value: 4.6 },
        ],
      },
    ]
  }

  toggleFavorite(id: string) {
    if (this.favorites.has(id)) {
      this.favorites.delete(id)
    } else {
      this.favorites.add(id)
    }
  }

  setSearchQuery(query: string) {
    this.searchQuery = query
  }

  setActiveCategory(category: IndicatorCategory | 'all') {
    this.activeCategory = category
  }

  get filteredIndicators(): Indicator[] {
    const byCategory =
      this.activeCategory === 'all'
        ? this.indicators
        : this.indicators.filter((ind) => ind.category === this.activeCategory)

    if (!this.searchQuery.trim()) {
      return byCategory
    }

    const query = this.searchQuery.toLowerCase()
    return byCategory.filter(
      (ind) =>
        ind.name.toLowerCase().includes(query) ||
        ind.description.toLowerCase().includes(query),
    )
  }
}

class DashboardStore {
  selectedIndicatorId = 'invest_total'
  scenarioType: ScenarioType = 'base'
  timeRange: 'all' | 'last5' | 'last10' = 'last10'

  constructor(private readonly indicatorStore: IndicatorStore) {
    makeAutoObservable(this, {}, { autoBind: true })
  }

  setSelectedIndicator(id: string) {
    this.selectedIndicatorId = id
  }

  setScenarioType(type: ScenarioType) {
    this.scenarioType = type
  }

  setTimeRange(range: 'all' | 'last5' | 'last10') {
    this.timeRange = range
  }

  get selectedIndicator(): Indicator | undefined {
    return this.indicatorStore.indicators.find((ind) => ind.id === this.selectedIndicatorId)
  }

  get timeSeries(): TimeSeriesPoint[] {
    const baseHistory: TimeSeriesPoint[] = [
      { year: 2018, actual: 820 },
      { year: 2019, actual: 910 },
      { year: 2020, actual: 880 },
      { year: 2021, actual: 980 },
      { year: 2022, actual: 1050 },
      { year: 2023, actual: 1120 },
      { year: 2024, actual: 1175 },
      { year: 2025, actual: 1250 },
    ]

    const forecastBase: TimeSeriesPoint[] = [
      { year: 2026, forecast: 1320, lower: 1260, upper: 1380 },
      { year: 2027, forecast: 1395, lower: 1310, upper: 1480 },
      { year: 2028, forecast: 1475, lower: 1355, upper: 1595 },
      { year: 2029, forecast: 1560, lower: 1400, upper: 1720 },
    ]

    let multiplier = 1
    if (this.scenarioType === 'optimistic') {
      multiplier = 1.08
    } else if (this.scenarioType === 'pessimistic') {
      multiplier = 0.93
    }

    const adjustedForecast = forecastBase.map((point) => ({
      year: point.year,
      forecast: (point.forecast ?? 0) * multiplier,
      lower: (point.lower ?? 0) * multiplier,
      upper: (point.upper ?? 0) * multiplier,
    }))

    return [...baseHistory, ...adjustedForecast]
  }

  get shapContributions(): ShapFactorContribution[] {
    return [
      { id: 'f1', name: 'Федеральные инвестиции', contribution: 0.42 },
      { id: 'f2', name: 'Частные инвестиции', contribution: 0.31 },
      { id: 'f3', name: 'Курс валюты', contribution: -0.18 },
      { id: 'f4', name: 'Индекс деловой активности', contribution: 0.16 },
      { id: 'f5', name: 'Ставка по кредитам', contribution: -0.11 },
      { id: 'f6', name: 'Инфляция', contribution: -0.07 },
    ]
  }
}

export class RootStore {
  ui: UiStore
  indicators: IndicatorStore
  dashboards: DashboardStore

  constructor() {
    this.ui = new UiStore()
    this.indicators = new IndicatorStore()
    this.dashboards = new DashboardStore(this.indicators)
  }
}

const rootStore = new RootStore()

const RootStoreContext = createContext<RootStore | null>(null)

export function RootStoreProvider({ children }: { children: ReactNode }) {
  return (
    <RootStoreContext.Provider value={rootStore}>{children}</RootStoreContext.Provider>
  )
}

export function useRootStore(): RootStore {
  const ctx = useContext(RootStoreContext)
  if (!ctx) {
    throw new Error('useRootStore must be used within RootStoreProvider')
  }
  return ctx
}


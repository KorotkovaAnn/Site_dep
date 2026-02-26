import { observer } from 'mobx-react-lite'
import {
  Area,
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { useRootStore } from '../stores/rootStore.tsx'

export const DashboardsPage = observer(function DashboardsPage() {
  const { dashboards, indicators } = useRootStore()

  const selected = dashboards.selectedIndicator
  const series = dashboards.timeSeries
  const shap = dashboards.shapContributions

  const currentYearPoint = series.find((p) => p.year === 2025)

  const forecastCards = series.filter((p) => p.forecast != null)

  const positiveFactors = shap.filter((f) => f.contribution > 0).slice(0, 3)
  const negativeFactors = shap.filter((f) => f.contribution < 0).slice(0, 3)

  return (
    <div>
      <h1 className="page-title">Аналитические дашборды</h1>
      <p className="page-subtitle">
        Выберите показатель для анализа — прогноз, доверительные интервалы и SHAP-интерпретация
        обновятся автоматически.
      </p>

      <section className="glass-panel" style={{ padding: '14px 18px 16px', marginBottom: 18 }}>
        <div className="dashboard-filters">
          <div className="dashboard-filter-group">
            <div className="dashboard-filter-label">Показатель</div>
            <select
              className="dashboard-select"
              value={dashboards.selectedIndicatorId}
              onChange={(e) => dashboards.setSelectedIndicator(e.target.value)}
            >
              {groupByCategory(indicators.indicators).map((group) => (
                <optgroup key={group.category} label={group.label}>
                  {group.items.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.name}
                    </option>
                  ))}
                </optgroup>
              ))}
            </select>
          </div>

          <div className="dashboard-filter-group">
            <div className="dashboard-filter-label">Период</div>
            <div className="dashboard-segmented">
              <button
                type="button"
                className={segmentClass(dashboards.timeRange === 'all')}
                onClick={() => dashboards.setTimeRange('all')}
              >
                Весь ряд
              </button>
              <button
                type="button"
                className={segmentClass(dashboards.timeRange === 'last10')}
                onClick={() => dashboards.setTimeRange('last10')}
              >
                10 лет
              </button>
              <button
                type="button"
                className={segmentClass(dashboards.timeRange === 'last5')}
                onClick={() => dashboards.setTimeRange('last5')}
              >
                5 лет
              </button>
            </div>
          </div>

          <div className="dashboard-filter-group">
            <div className="dashboard-filter-label">Сценарий прогноза</div>
            <div className="dashboard-segmented">
              <button
                type="button"
                className={segmentClass(dashboards.scenarioType === 'base')}
                onClick={() => dashboards.setScenarioType('base')}
              >
                Базовый
              </button>
              <button
                type="button"
                className={segmentClass(dashboards.scenarioType === 'optimistic')}
                onClick={() => dashboards.setScenarioType('optimistic')}
              >
                Оптимистичный
              </button>
              <button
                type="button"
                className={segmentClass(dashboards.scenarioType === 'pessimistic')}
                onClick={() => dashboards.setScenarioType('pessimistic')}
              >
                Пессимистичный
              </button>
            </div>
          </div>
        </div>
      </section>

      <section className="dashboard-grid">
        <aside className="glass-panel dashboard-forecast-cards">
          <h2 className="home-section-title">Прогноз по годам</h2>
          <p className="home-section-subtitle">
            Прогноз на 4 года вперёд с динамикой относительно текущего значения.
          </p>
          <div className="forecast-cards-grid">
            {forecastCards.map((p) => {
              const base = currentYearPoint?.actual ?? currentYearPoint?.forecast ?? null
              const change =
                base && p.forecast != null ? ((p.forecast - base) / base) * 100 : null

              const changeClass =
                change == null
                  ? 'neutral'
                  : change > 0.5
                    ? 'positive'
                    : change < -0.5
                      ? 'negative'
                      : 'neutral'

              return (
                <div key={p.year} className="forecast-card">
                  <div className="forecast-card-year">{p.year}</div>
                  <div className="forecast-card-value">
                    {p.forecast?.toLocaleString('ru-RU', {
                      maximumFractionDigits: 0,
                    })}
                  </div>
                  <div className={`forecast-card-change ${changeClass}`}>
                    {change != null ? (
                      <>
                        <span>{change >= 0 ? '▲' : '▼'}</span>
                        <span>{Math.abs(change).toFixed(1)}%</span>
                      </>
                    ) : (
                      <span>—</span>
                    )}
                  </div>
                </div>
              )
            })}
          </div>

          <div className="dashboard-kpis">
            <div className="dashboard-kpi">
              <div className="dashboard-kpi-label">Текущий год</div>
              <div className="dashboard-kpi-value">
                {currentYearPoint?.actual?.toLocaleString('ru-RU', {
                  maximumFractionDigits: 0,
                }) ?? '—'}
              </div>
              <div className="dashboard-kpi-caption">
                {selected?.name} · {selected?.unit}
              </div>
            </div>
            <div className="dashboard-kpi">
              <div className="dashboard-kpi-label">Изменение к прошлому году</div>
              <div className="dashboard-kpi-value dashboard-kpi-value-small positive">
                +6,4%
              </div>
              <div className="dashboard-kpi-caption">по данным последних обновлений</div>
            </div>
            <div className="dashboard-kpi">
              <div className="dashboard-kpi-label">Среднегодовой темп роста</div>
              <div className="dashboard-kpi-value dashboard-kpi-value-small">
                +4,8% в год
              </div>
              <div className="dashboard-kpi-caption">за весь исторический период</div>
            </div>
          </div>
        </aside>

        <section className="glass-panel dashboard-chart-panel">
          <h2 className="home-section-title">Динамика показателя и прогноз</h2>
          <p className="home-section-subtitle">
            Синяя линия — фактические значения, фиолетовая — прогноз с доверительным интервалом.
          </p>
          <div className="dashboard-main-chart">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={applyTimeRange(series, dashboards.timeRange)}>
                <CartesianGrid stroke="#e5e7eb" strokeDasharray="3 3" />
                <XAxis dataKey="year" />
                <YAxis />
                <Tooltip
                  formatter={(value: number, key) => {
                    if (key === 'actual') {
                      return [value.toLocaleString('ru-RU'), 'Факт']
                    }
                    if (key === 'forecast') {
                      return [value.toLocaleString('ru-RU'), 'Прогноз']
                    }
                    return [value.toLocaleString('ru-RU'), '']
                  }}
                />
                <Legend />
                <Area
                  type="monotone"
                  dataKey="forecast"
                  stroke="none"
                  fill="url(#forecastArea)"
                  isAnimationActive
                  yAxisId={0}
                />
                <defs>
                  <linearGradient id="forecastArea" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0%" stopColor="#8b5cf6" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="#8b5cf6" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="forecastBand" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0%" stopColor="#c4b5fd" stopOpacity={0.4} />
                    <stop offset="100%" stopColor="#ddd6fe" stopOpacity={0.1} />
                  </linearGradient>
                </defs>
                <Area
                  type="monotone"
                  dataKey="upper"
                  stroke="none"
                  fill="url(#forecastBand)"
                  yAxisId={0}
                />
                <Area
                  type="monotone"
                  dataKey="lower"
                  stroke="none"
                  fill="#ffffff"
                  fillOpacity={1}
                  yAxisId={0}
                />
                <Line
                  type="monotone"
                  dataKey="actual"
                  name="Факт"
                  stroke="#2563eb"
                  strokeWidth={2.4}
                  dot={{ r: 3 }}
                  activeDot={{ r: 4.5 }}
                />
                <Line
                  type="monotone"
                  dataKey="forecast"
                  name="Прогноз"
                  stroke="#8b5cf6"
                  strokeDasharray="5 5"
                  strokeWidth={2.2}
                  dot={{ r: 3 }}
                  activeDot={{ r: 4.5 }}
                />
                <ReferenceLine
                  x={2025}
                  stroke="#9ca3af"
                  strokeDasharray="3 3"
                  label={{
                    value: 'Текущий год',
                    position: 'top',
                    fontSize: 11,
                    fill: '#6b7280',
                  }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="dashboard-legend-row">
            <span className="legend-item">
              <span className="legend-dot" style={{ background: '#2563eb' }} />
              Фактические значения
            </span>
            <span className="legend-item">
              <span
                className="legend-line legend-line-dashed"
                style={{ borderColor: '#8b5cf6' }}
              />
              Прогноз
            </span>
            <span className="legend-item">
              <span
                className="legend-band"
                style={{ background: 'rgba(167, 139, 250, 0.25)' }}
              />
              Доверительный интервал
            </span>
          </div>
        </section>
      </section>

      <section className="dashboard-grid" style={{ marginTop: 18 }}>
        <section className="glass-panel shap-panel">
          <h2 className="home-section-title">SHAP-анализ вклада факторов</h2>
          <p className="home-section-subtitle">
            Положительный вклад (зелёный) увеличивает прогнозируемое значение показателя,
            отрицательный (красный) — снижает.
          </p>
          <div className="shap-chart-wrapper">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={shap}
                layout="vertical"
                margin={{ left: 80, right: 16, top: 8, bottom: 8 }}
              >
                <CartesianGrid horizontal={false} stroke="#e5e7eb" strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis
                  type="category"
                  dataKey="name"
                  tick={{ fontSize: 11 }}
                  width={140}
                />
                <Tooltip
                  formatter={(value: number) => [
                    value.toFixed(2),
                    'Вклад в итоговое значение',
                  ]}
                />
                <Bar
                  dataKey="contribution"
                  barSize={18}
                  radius={9}
                  label={{
                    position: 'right',
                    formatter: (value: number) => value.toFixed(2),
                    fontSize: 11,
                  }}
                >
                  {shap.map((entry) => (
                    <cell
                      // eslint-disable-next-line react/no-array-index-key
                      key={entry.id}
                      fill={
                        entry.contribution >= 0
                          ? 'url(#shapPositive)'
                          : 'url(#shapNegative)'
                      }
                    />
                  ))}
                </Bar>
                <defs>
                  <linearGradient id="shapPositive" x1="0" x2="1" y1="0" y2="0">
                    <stop offset="0%" stopColor="#bbf7d0" />
                    <stop offset="100%" stopColor="#22c55e" />
                  </linearGradient>
                  <linearGradient id="shapNegative" x1="0" x2="1" y1="0" y2="0">
                    <stop offset="0%" stopColor="#fecaca" />
                    <stop offset="100%" stopColor="#ef4444" />
                  </linearGradient>
                </defs>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <p className="shap-caption">
            Факторы отсортированы по абсолютной величине влияния — самые важные находятся
            в верхней части диаграммы.
          </p>
        </section>

        <aside className="glass-panel shap-insights">
          <h2 className="home-section-title">Ключевые инсайты</h2>
          <p className="home-section-subtitle">
            Автоматически выделенные драйверы роста и факторы снижения по текущему показателю.
          </p>
          <div className="shap-insights-grid">
            <div>
              <div className="shap-insight-title">Топ-3 фактора роста</div>
              <ul className="shap-insight-list">
                {positiveFactors.map((f) => (
                  <li key={f.id}>
                    <span className="shap-factor-name">{f.name}</span>
                    <span className="shap-factor-value">
                      +{(f.contribution * 100).toFixed(1)}%
                    </span>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <div className="shap-insight-title">Топ-3 фактора снижения</div>
              <ul className="shap-insight-list">
                {negativeFactors.map((f) => (
                  <li key={f.id}>
                    <span className="shap-factor-name">{f.name}</span>
                    <span className="shap-factor-value shap-factor-negative">
                      {(f.contribution * 100).toFixed(1)}%
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </aside>
      </section>

      <section className="glass-panel" style={{ marginTop: 18, padding: '14px 18px 16px' }}>
        <h2 className="home-section-title">Расширенная аналитика</h2>
        <p className="home-section-subtitle">
          Дополнительные инструменты анализа: сценарии, корреляции, декомпозиция временного ряда
          и метрики качества моделей.
        </p>
        <div className="advanced-grid">
          <div className="advanced-block">
            <div className="advanced-title">Сравнение сценариев</div>
            <p className="advanced-text">
              Таблица с базовым, оптимистичным и пессимистичным сценариями прогноза на горизонте
              4 года, а также их визуальное сравнение.
            </p>
          </div>
          <div className="advanced-block">
            <div className="advanced-title">Корреляционная матрица</div>
            <p className="advanced-text">
              Тепловая карта корреляций между факторами позволяет выявить мультиколлинеарность и
              скорректировать спецификацию моделей.
            </p>
          </div>
          <div className="advanced-block">
            <div className="advanced-title">Декомпозиция временного ряда</div>
            <p className="advanced-text">
              Разложение на тренд, сезонность и остатки помогает объяснить структуру показателя и
              обосновать модельные допущения.
            </p>
          </div>
          <div className="advanced-block">
            <div className="advanced-title">Метрики качества моделей</div>
            <p className="advanced-text">
              Набор ключевых метрик (RMSE, MAE, MAPE, R2) показывает точность прогнозов и
              устойчивость моделей на исторических данных.
            </p>
          </div>
        </div>
      </section>
    </div>
  )
})

function segmentClass(active: boolean): string {
  return active ? 'dashboard-segment dashboard-segment-active' : 'dashboard-segment'
}

function applyTimeRange(
  series: ReturnType<typeof useRootStore>['dashboards']['timeSeries'],
  range: 'all' | 'last5' | 'last10',
) {
  if (range === 'all') return series
  const years = series.map((p) => p.year)
  const maxYear = Math.max(...years)
  const minYear = range === 'last5' ? maxYear - 4 : maxYear - 9
  return series.filter((p) => p.year >= minYear)
}

function groupByCategory(
  all: ReturnType<typeof useRootStore>['indicators']['indicators'],
) {
  const labels: Record<string, string> = {
    economy: 'Экономика',
    investment: 'Инвестиции',
    construction: 'Строительство',
    demography: 'Демография',
    labour: 'Рынок труда',
    social: 'Социальная сфера',
  }

  const groups: { category: string; label: string; items: typeof all }[] = []

  all.forEach((indicator) => {
    let group = groups.find((g) => g.category === indicator.category)
    if (!group) {
      group = {
        category: indicator.category,
        label: labels[indicator.category] ?? indicator.category,
        items: [],
      }
      groups.push(group)
    }
    group.items.push(indicator)
  })

  return groups
}


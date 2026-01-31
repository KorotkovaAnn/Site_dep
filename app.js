/* =========================
   Simple SPA navigation
========================= */
const pages = {
  home: document.getElementById("home"),
  dashboards: document.getElementById("dashboards"),
};

const navButtons = Array.from(document.querySelectorAll(".nav__item[data-page]"));

function setPage(name) {
  Object.entries(pages).forEach(([key, el]) => {
    el.classList.toggle("is-active", key === name);
  });
  navButtons.forEach(btn => btn.classList.toggle("is-active", btn.dataset.page === name));
  // закрыть sidebar на мобилке после перехода
  document.querySelector(".sidebar")?.classList.remove("open");
}

navButtons.forEach(btn => {
  btn.addEventListener("click", () => setPage(btn.dataset.page));
});

document.getElementById("goDashboards").addEventListener("click", () => setPage("dashboards"));

document.getElementById("learnMore").addEventListener("click", () => {
  alert("Возможности: мониторинг показателей, прогноз на 3–5 лет, интерпретация (SHAP), поддержка решений.");
});

document.getElementById("downloadMock").addEventListener("click", () => {
  alert("Макет: здесь будет формирование/скачивание отчёта (PDF).");
});

/* burger menu */
const burgerBtn = document.getElementById("burgerBtn");
burgerBtn?.addEventListener("click", () => {
  document.querySelector(".sidebar")?.classList.toggle("open");
});

/* Quick actions */
const indicatorSelect = document.getElementById("indicatorSelect");

document.getElementById("quickOpenInvest")?.addEventListener("click", () => {
  setPage("dashboards");
  indicatorSelect.value = "investments";
  updateDashboard("investments");
});
document.getElementById("quickOpenDeflator")?.addEventListener("click", () => {
  setPage("dashboards");
  indicatorSelect.value = "deflator";
  updateDashboard("deflator");
});
document.getElementById("quickScenario")?.addEventListener("click", () => {
  alert("Макет: сценарное моделирование (what-if) будет добавлено позже.");
});
document.getElementById("quickExport")?.addEventListener("click", () => {
  alert("Макет: экспорт (PDF/Excel) будет добавлен позже.");
});

/* =========================
   Data (примерные значения)
========================= */
const DATA = {
  deflator: {
    title: "Индекс-дефлятор",
    unit: "индекс",
    hist: { years: [2020, 2021, 2022, 2023, 2024, 2025], values: [103.2, 108.4, 112.1, 109.7, 106.6, 105.3] },
    forecast: { years: [2026, 2027, 2028, 2029], values: [104.8, 104.3, 103.9, 103.5] },
    shap: [
      { name: "Инфляция (CPI)", val: 0.38 },
      { name: "Курс рубля", val: 0.21 },
      { name: "Инвестиции", val: 0.12 },
      { name: "Доходы населения", val: -0.08 },
      { name: "Логистика/транспорт", val: -0.05 },
    ],
  },

  investments: {
    title: "Общий объём инвестиций",
    unit: "млрд ₽",
    hist: { years: [2020, 2021, 2022, 2023, 2024, 2025], values: [920, 980, 1045, 1120, 1195, 1230] },
    forecast: { years: [2026, 2027, 2028, 2029], values: [1245.3, 1312.8, 1389.4, 1472.1] },
    shap: [
      { name: "Нефтегазовый сектор", val: 0.52 },
      { name: "Строительство", val: 0.31 },
      { name: "Ставка (ключевая)", val: -0.22 },
      { name: "Госпрограммы", val: 0.18 },
      { name: "Безработица", val: -0.09 },
    ],
  },

  grp: {
    title: "ВРП",
    unit: "млрд ₽",
    hist: { years: [2020, 2021, 2022, 2023, 2024, 2025], values: [2150, 2320, 2490, 2605, 2740, 2860] },
    forecast: { years: [2026, 2027, 2028, 2029], values: [2985, 3120, 3268, 3425] },
    shap: [
      { name: "Инвестиции", val: 0.44 },
      { name: "Промпроизводство", val: 0.27 },
      { name: "Реальные доходы", val: 0.16 },
      { name: "Инфляция", val: -0.11 },
      { name: "Миграция", val: 0.06 },
    ],
  },

  unemployment: {
    title: "Уровень безработицы",
    unit: "%",
    hist: { years: [2020, 2021, 2022, 2023, 2024, 2025], values: [5.4, 4.9, 4.2, 3.8, 3.6, 3.7] },
    forecast: { years: [2026, 2027, 2028, 2029], values: [3.6, 3.5, 3.5, 3.4] },
    shap: [
      { name: "Инвестиции", val: -0.28 },
      { name: "Демография", val: -0.14 },
      { name: "Образование/кадры", val: -0.11 },
      { name: "Сезонность рынка труда", val: 0.09 },
      { name: "Миграция", val: 0.06 },
    ],
  },
};

/* =========================
   UI helpers
========================= */
const forecastCards = document.getElementById("forecastCards");
const unitBadge = document.getElementById("unitBadge");

const kpiCurrentYear = document.getElementById("kpiCurrentYear");
const kpiCurrentValue = document.getElementById("kpiCurrentValue");
const kpiYoY = document.getElementById("kpiYoY");

function formatValue(v, unit) {
  if (unit === "%") return `${v.toFixed(1)}%`;
  if (unit === "индекс") return `${v.toFixed(1)}`;
  if (unit === "млрд ₽") return `${v.toLocaleString("ru-RU", { maximumFractionDigits: 1 })} млрд ₽`;
  return `${v}`;
}

function renderForecast(indKey) {
  const d = DATA[indKey];
  unitBadge.textContent = d.unit;

  forecastCards.innerHTML = "";
  d.forecast.years.forEach((y, i) => {
    const val = d.forecast.values[i];
    const item = document.createElement("div");
    item.className = "forecast__item";
    item.innerHTML = `
      <div class="forecast__year">${y}</div>
      <div class="forecast__value">${formatValue(val, d.unit)}</div>
    `;
    forecastCards.appendChild(item);
  });
}

function renderMiniKPIs(indKey) {
  const d = DATA[indKey];
  const lastYear = d.hist.years[d.hist.years.length - 1];
  const lastVal = d.hist.values[d.hist.values.length - 1];
  const prevVal = d.hist.values[d.hist.values.length - 2];

  const yoy = prevVal !== 0 ? ((lastVal - prevVal) / prevVal) * 100 : 0;
  const sign = yoy > 0 ? "+" : "";

  kpiCurrentYear.textContent = `${lastYear}`;
  kpiCurrentValue.textContent = formatValue(lastVal, d.unit);
  kpiYoY.textContent = `${sign}${yoy.toFixed(1)}%`;
}

/* =========================
   Chart.js: Trend chart + external tooltip
========================= */
const tooltipEl = document.getElementById("trendTooltip");

function externalTooltipHandler(context) {
  const { chart, tooltip } = context;

  if (!tooltipEl) return;

  // скрываем, если нет наведения
  if (tooltip.opacity === 0) {
    tooltipEl.style.opacity = 0;
    return;
  }

  const dp = tooltip.dataPoints?.[0];
  if (!dp) return;

  const year = dp.label;
  const datasetLabel = dp.dataset.label;
  const value = dp.raw;

  tooltipEl.innerHTML = `
    <div class="tooltip__title">${year} • ${datasetLabel}</div>
    <div class="tooltip__row">
      <span>Значение</span>
      <span class="tooltip__val">${value}</span>
    </div>
  `;

  // ✅ КООРДИНАТЫ ВНУТРИ CANVAS/CHART-WRAP (а не страницы)
  const x = tooltip.caretX;
  const y = tooltip.caretY;

  tooltipEl.style.left = `${x}px`;
  tooltipEl.style.top = `${y}px`;
  tooltipEl.style.transform = `translate(12px, 12px)`; // небольшой отступ от курсора
  tooltipEl.style.opacity = 1;
}

let trendChart = null;

function buildTrendChart(indKey) {
  const d = DATA[indKey];

  const labels = [...d.hist.years, ...d.forecast.years];
  const actual = labels.map(y => {
    const idx = d.hist.years.indexOf(y);
    return idx >= 0 ? d.hist.values[idx] : null;
  });
  const forecast = labels.map(y => {
    const idx = d.forecast.years.indexOf(y);
    return idx >= 0 ? d.forecast.values[idx] : null;
  });

  const ctx = document.getElementById("trendChart");
  if (trendChart) trendChart.destroy();

  trendChart = new Chart(ctx, {
    type: "line",
    data: {
      labels,
      datasets: [
        { label: "Факт", data: actual, tension: 0.25, pointRadius: 3, borderWidth: 2 },
        { label: "Прогноз", data: forecast, tension: 0.25, pointRadius: 3, borderWidth: 2, borderDash: [6, 6] }
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: { mode: "index", intersect: false },
      plugins: {
        legend: { display: true },
        tooltip: { enabled: false, external: externalTooltipHandler },
      },
      scales: {
        x: { grid: { display: false } },
        y: { grid: { drawBorder: false } },
      },
    },
  });
}

/* =========================
   SHAP chart (horizontal bar)
========================= */
let shapChart = null;

function buildShapChart(indKey) {
  const d = DATA[indKey];
  const labels = d.shap.map(x => x.name);
  const values = d.shap.map(x => x.val);

  // Цвета: + зелёный, - красный
  const bgColors = values.map(v => v >= 0
    ? "rgba(123,211,137,0.55)"   // green
    : "rgba(255,99,132,0.45)"   // red
  );
  const borderColors = values.map(v => v >= 0
    ? "rgba(58,160,90,0.9)"
    : "rgba(220,60,90,0.9)"
  );

  const ctx = document.getElementById("shapChart");
  if (shapChart) shapChart.destroy();

  shapChart = new Chart(ctx, {
    type: "bar",
    data: {
      labels,
      datasets: [{
        label: "SHAP вклад",
        data: values,
        backgroundColor: bgColors,
        borderColor: borderColors,
        borderWidth: 1.2,
        borderRadius: 6
      }],
    },
    options: {
      indexAxis: "y",
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: (c) => ` ${c.parsed.x > 0 ? "+" : ""}${c.parsed.x.toFixed(2)}`
          }
        }
      },
      scales: {
        x: {
          beginAtZero: true,
          grid: {
            drawBorder: false,
            color: (ctx) => {
              // жирная нулевая линия
              if (ctx.tick && ctx.tick.value === 0) return "rgba(0,0,0,0.25)";
              return "rgba(0,0,0,0.08)";
            },
            lineWidth: (ctx) => (ctx.tick && ctx.tick.value === 0 ? 2 : 1),
          },
          ticks: {
            callback: (v) => (v > 0 ? `+${v}` : `${v}`)
          }
        },
        y: {
          grid: { display: false }
        }
      }
    },
  });
}


/* =========================
   Update all dashboard widgets
========================= */
function updateDashboard(indKey) {
  renderForecast(indKey);
  renderMiniKPIs(indKey);
  buildTrendChart(indKey);
  buildShapChart(indKey);
}

indicatorSelect.addEventListener("change", (e) => updateDashboard(e.target.value));
updateDashboard(indicatorSelect.value);

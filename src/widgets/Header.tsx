import { NavLink, useLocation, useNavigate } from 'react-router-dom'
import { observer } from 'mobx-react-lite'

import { NotificationCenter } from './NotificationCenter.tsx'
import {useRootStore} from "../stores/rootStore.tsx";

const navItems: { to: string; label: string }[] = [
  { to: '/', label: 'Главная' },
  { to: '/dashboards', label: 'Дашборды' },
  { to: '/indicators', label: 'Показатели' },
  { to: '/forecasts', label: 'Прогнозы' },
  { to: '/about', label: 'О проекте' },
  { to: '/docs', label: 'Документация' },
]

const breadcrumbMap: Record<string, string> = {
  '/': 'Главная',
  '/dashboards': 'Дашборды',
  '/indicators': 'Показатели',
  '/forecasts': 'Прогнозы',
  '/scenarios': 'Сценарное моделирование',
  '/about': 'О проекте',
  '/docs': 'Документация',
}

export const Header = observer(function Header() {
  const { ui } = useRootStore()
  const location = useLocation()
  const navigate = useNavigate()

  const segments = location.pathname.split('/').filter(Boolean)
  const breadcrumbPath = `/${segments[0] ?? ''}`
  const breadcrumbLabel = breadcrumbMap[breadcrumbPath] ?? 'Главная'

  return (
    <header className="app-header glass-panel">
      <div className="app-header-inner">
        <div className="app-header-left">
          <button
            type="button"
            className="logo-area"
            onClick={() => navigate('/')}
          >
            <div className="logo-mark">
              <span className="logo-bar logo-bar-1" />
              <span className="logo-bar logo-bar-2" />
              <span className="logo-bar logo-bar-3" />
            </div>
            <div className="logo-text">
              <span className="logo-title">REGION AI FORECAST</span>
              <span className="logo-subtitle">B2G платформа мониторинга</span>
            </div>
          </button>

          <nav className="app-nav">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `app-nav-link${isActive ? ' app-nav-link-active' : ''}`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>
        </div>

        <div className="app-header-right">
          <div className="language-switcher" aria-label="Переключение языка">
            <button
              type="button"
              className={`pill-button pill-button-small${
                ui.language === 'ru' ? ' pill-button-active' : ''
              }`}
              onClick={() => ui.setLanguage('ru')}
            >
              RU
            </button>
            <button
              type="button"
              className={`pill-button pill-button-small${
                ui.language === 'en' ? ' pill-button-active' : ''
              }`}
              onClick={() => ui.setLanguage('en')}
            >
              EN
            </button>
          </div>

          <NotificationCenter />

          <button type="button" className="btn btn-outline btn-small">
            Войти
          </button>
        </div>
      </div>

      <div className="app-header-breadcrumbs">
        <span className="breadcrumb-root" onClick={() => navigate('/')}>
          Главная
        </span>
        {breadcrumbPath !== '/' ? (
          <>
            <span className="breadcrumb-separator">›</span>
            <span className="breadcrumb-current">{breadcrumbLabel}</span>
          </>
        ) : null}
      </div>
    </header>
  )
})


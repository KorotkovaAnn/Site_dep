import type { ReactNode } from 'react'
import { Header } from '../shared/Header'
import { Footer } from '../shared/Footer'
import { HelpWidget } from '../shared/HelpWidget'

interface MainLayoutProps {
  children: ReactNode
}

export function MainLayout({ children }: MainLayoutProps) {
  return (
    <div className="app-root">
      <Header />
      <main className="app-main">{children}</main>
      <Footer />
      <HelpWidget />
    </div>
  )
}


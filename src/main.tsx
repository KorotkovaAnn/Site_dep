import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { App } from './app/App'
import { RootStoreProvider } from './stores/rootStore'
import './app/styles.css'

const container = document.getElementById('root')

if (container) {
  createRoot(container).render(
    <StrictMode>
      <RootStoreProvider>
        <App />
      </RootStoreProvider>
    </StrictMode>,
  )
}

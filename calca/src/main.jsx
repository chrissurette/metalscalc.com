import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'

const el = document.getElementById('scrap-calculator')
if (el) {
  createRoot(el).render(
    <StrictMode>
      <App />
    </StrictMode>
  )
}

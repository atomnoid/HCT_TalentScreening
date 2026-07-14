import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Toaster } from 'react-hot-toast'
import './index.css'
import App from './App.jsx'

// Application entry point
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
    <Toaster
      position="top-right"
      toastOptions={{
        duration: 2500,
        style: {
          background: "#ffffff",
          border: "1px solid #e2e8f0",
          color: "#334155",
          boxShadow: "0 4px 12px rgba(15, 23, 42, 0.12)",
        },
      }}
      containerClassName="app-toaster"
    />
  </StrictMode>,
)

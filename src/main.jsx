import React from 'react'
import ReactDOM from 'react-dom/client'
import { HashRouter } from 'react-router-dom'
import App from './App'
// Polices embarquées dans le build : aucune requête réseau (application hors ligne).
import '@fontsource-variable/lexend'
import '@fontsource/jetbrains-mono/400.css'
import './index.css'
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <HashRouter>
      <App />
    </HashRouter>
  </React.StrictMode>,
)

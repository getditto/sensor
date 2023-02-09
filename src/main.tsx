import React from 'react'
import ReactDOM from 'react-dom/client'
import DittoWrapperHost from './DittoWrapperHost'
import './index.css'

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <DittoWrapperHost />
  </React.StrictMode>,
)

import React from 'react'
import './DashboardGold.css'
import AdminPanel from './AdminPanel'

const CobranzasPanel = () => {
  return (
    <div className="dashboard-gold-bg min-h-screen p-6" style={{ background: 'linear-gradient(135deg, #FFD700 0%, #FFB300 100%)' }}>
      <AdminPanel initialSection={"cobranzas"} panelTitle="Panel de Cobranzas" />
    </div>
  )
}

export default CobranzasPanel

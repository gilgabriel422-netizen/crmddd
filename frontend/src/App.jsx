import React, { lazy, Suspense } from 'react'
const DashboardCobranzas = lazy(() => import('./pages/DashboardCobranzas.jsx'));
const CobranzasPanelModified = lazy(() => import('./pages/CobranzasPanel_modified.jsx'));
const DashboardContratos = lazy(() => import('./pages/DashboardContratos.jsx'));
const GestionContratos = lazy(() => import('./pages/GestionContratos.jsx'));
const DashboardAtencionCliente = lazy(() => import('./pages/DashboardAtencionCliente.jsx'));
const DashboardPostventa = lazy(() => import('./pages/DashboardPostventa.jsx'));
const PaquetesAdmin = lazy(() => import('./pages/PaquetesAdmin.jsx'));
const SoportePanel = lazy(() => import('./pages/SoportePanel.jsx'));
const ContratosFisicosPanel = lazy(() => import('./pages/ContratosFisicosPanel.jsx'));
const AyudaCliente = lazy(() => import('./pages/AyudaCliente.jsx'));
const SoportePage = lazy(() => import('./pages/SoportePAge.jsx'));
const Reservas = lazy(() => import('./pages/Reservas.jsx'));
const Beneficios = lazy(() => import('./pages/Beneficios.jsx'));
const EnviarAtencion = lazy(() => import('./pages/EnviarAtencion.jsx'));
const BandejaMensajesSoporte = lazy(() => import('./pages/BandejaMensajesSoporte.jsx'));
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import Navbar from './components/Navbar'
import Hero from './components/Hero'
import FeaturedPackages from './components/FeaturedPackages'
import StatsSection from './components/StatsSection'
import TestimonialsSection from './components/TestimonialsSection'
import Footer from './components/Footer'
import WhatsAppFloat from './components/WhatsAppFloat'
import Chatbot from './components/Chatbot'
import LocacionesDepartamentosAdmin from './components/LocacionesDepartamentosAdmin'
import NosotrosPage from './pages/NosotrosPage'
import PaquetesPage from './pages/PaquetesPage'
import ExperienciasPage from './pages/ExperienciasPage'
import ContactanosPage from './pages/ContactanosPage'
import LoginPage from './pages/LoginPage'
import HomePageDorada from './pages/HomePageDorada'
import Reviews from './pages/Reviews'
import AdminPanel from './pages/AdminPanel'
import ClientePanel from './pages/ClientePanel'
import ClienteIB1Panel from './pages/ClienteIB1Panel'
import ClienteIB2Panel from './pages/ClienteIB2Panel'

function App() {
  return (
    <Router>
      <AuthProvider>
        <div className="min-h-screen bg-gray-50">
          <Routes>
            <Route path="/" element={
              <>
                <Navbar />
                <HomePageDorada />
                <Footer />
                <WhatsAppFloat />
              </>
            } />
            <Route path="/resenias" element={<Navigate to="/experiencias" replace />} />
            <Route path="/nosotros" element={
              <>
                <Navbar />
                <NosotrosPage />
                <Footer />
                <WhatsAppFloat />
              </>
            } />
            <Route path="/paquetes" element={
              <>
                <Navbar />
                <PaquetesPage />
                <Footer />
                <WhatsAppFloat />
              </>
            } />
            <Route path="/experiencias" element={
              <>
                <Navbar />
                <ExperienciasPage />
                <Footer />
                <WhatsAppFloat />
              </>
            } />
            <Route path="/contactanos" element={
              <>
                <Navbar />
                <ContactanosPage />
                <Footer />
                <WhatsAppFloat />
              </>
            } />
            {/* Rutas de innovation */}
            <Route path="/paquetes-admin" element={<ProtectedRoute><Suspense fallback={<div>Cargando...</div>}><PaquetesAdmin /><WhatsAppFloat /></Suspense></ProtectedRoute>} />
            <Route path="/soporte-panel" element={<ProtectedRoute><Suspense fallback={<div>Cargando...</div>}><SoportePanel /><WhatsAppFloat /></Suspense></ProtectedRoute>} />
            <Route path="/soporte" element={
              <>
                <Navbar />
                <SoportePage />
                <Footer />
                <WhatsAppFloat />
              </>
            } />
            <Route path="/contratos-fisicos" element={<ProtectedRoute><Suspense fallback={<div>Cargando...</div>}><ContratosFisicosPanel /><WhatsAppFloat /></Suspense></ProtectedRoute>} />
            <Route path="/locaciones-departamentos" element={
              <ProtectedRoute>
                <LocacionesDepartamentosAdmin />
                <WhatsAppFloat />
              </ProtectedRoute>
            } />
            <Route path="/ayuda" element={
              <>
                <Navbar />
                <AyudaCliente />
                <Footer />
                <WhatsAppFloat />
              </>
            } />
            <Route path="/admin-login" element={<LoginPage />} />
            <Route path="/admin" element={<ProtectedRoute><Suspense fallback={<div>Cargando...</div>}><AdminPanel /><WhatsAppFloat /></Suspense></ProtectedRoute>} />
            <Route path="/cliente" element={<ProtectedRoute><Suspense fallback={<div>Cargando...</div>}><ClientePanel /><WhatsAppFloat /></Suspense></ProtectedRoute>} />
            <Route path="/cliente-ib1" element={<ProtectedRoute><Suspense fallback={<div>Cargando...</div>}><ClienteIB1Panel /><WhatsAppFloat /></Suspense></ProtectedRoute>} />
            <Route path="/cliente-black" element={<ProtectedRoute><Suspense fallback={<div>Cargando...</div>}><ClienteIB2Panel /><WhatsAppFloat /></Suspense></ProtectedRoute>} />
            <Route path="/login" element={<Navigate to="/" replace />} />
            {/* Removed /admin intermediate redirect route - dashboards accessed directly after login */}
            {/* /dashboard-cobranzas removed; cobranzas users are redirected to /admin */}
            <Route path="/dashboard-contratos" element={<Suspense fallback={<div>Cargando...</div>}><DashboardContratos /><WhatsAppFloat /></Suspense>} />
            <Route path="/gestion-contratos" element={<Suspense fallback={<div>Cargando...</div>}><GestionContratos /><WhatsAppFloat /></Suspense>} />
            <Route path="/reservas" element={<Suspense fallback={<div>Cargando...</div>}><Reservas /><WhatsAppFloat /></Suspense>} />
            <Route path="/beneficios" element={<Suspense fallback={<div>Cargando...</div>}><Beneficios /><WhatsAppFloat /></Suspense>} />
            <Route path="/enviar-atencion" element={<Suspense fallback={<div>Cargando...</div>}><EnviarAtencion /><WhatsAppFloat /></Suspense>} />
            <Route path="/bandeja-mensajes" element={<ProtectedRoute><Suspense fallback={<div>Cargando...</div>}><BandejaMensajesSoporte /><WhatsAppFloat /></Suspense></ProtectedRoute>} />
            <Route path="/dashboard-cobranzas" element={<ProtectedRoute><Suspense fallback={<div>Cargando...</div>}><CobranzasPanelModified /><WhatsAppFloat /></Suspense></ProtectedRoute>} />
            <Route path="/dashboard-atencion" element={<ProtectedRoute><Suspense fallback={<div>Cargando...</div>}><DashboardAtencionCliente /><WhatsAppFloat /></Suspense></ProtectedRoute>} />
            <Route path="/dashboard-postventa" element={<ProtectedRoute><Suspense fallback={<div>Cargando...</div>}><DashboardPostventa /><WhatsAppFloat /></Suspense></ProtectedRoute>} />
          </Routes>
          <Chatbot />
        </div>
      </AuthProvider>
    </Router>
  )
}

export default App

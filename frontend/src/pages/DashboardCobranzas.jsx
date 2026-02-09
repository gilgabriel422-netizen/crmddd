import React, { useState } from 'react';
import './DashboardGold.css';

export default function DashboardCobranzas() {
  const [authed, setAuthed] = useState(false);
  const [password, setPassword] = useState('');
  const [clientes, setClientes] = useState([]);
  const [pagos, setPagos] = useState([]);
  const [convenios, setConvenios] = useState([]);
  const [cancelaciones, setCancelaciones] = useState([]);
  const [showPago, setShowPago] = useState(false);
  const [showConvenio, setShowConvenio] = useState(false);
  const [showCancelacion, setShowCancelacion] = useState(false);
  const [selectedCliente, setSelectedCliente] = useState(null);

  // Autenticación estática
  if (!authed) {
    return (
      <div className="dashboard-gold-bg min-h-screen flex flex-col items-center justify-center" style={{background: 'linear-gradient(135deg, #FFD700 0%, #FFB300 100%)'}}>
        <h2 className="text-3xl font-bold mb-4" style={{color:'#222'}}>Dashboard Cobranzas</h2>
        <input
          type="password"
          placeholder="Contraseña"
          className="p-2 border-2 border-yellow-600 rounded mb-2 text-black bg-yellow-100"
          value={password}
          onChange={e => setPassword(e.target.value)}
        />
        <button
          className="bg-gradient-to-r from-yellow-400 to-yellow-700 text-black px-4 py-2 rounded font-bold border border-yellow-700 shadow-lg"
          onClick={() => setAuthed(password === 'innovetion')}
        >
          Entrar
        </button>
        {password && password !== 'innovetion' && <p className="text-red-600 mt-2">Contraseña incorrecta</p>}
      </div>
    );
  }

  // ...UI de módulos y formularios aquí (clientes, pagos, convenios, cancelaciones)...
  return (
    <div className="dashboard-gold-bg min-h-screen p-6" style={{background: 'linear-gradient(135deg, #FFD700 0%, #FFB300 100%)'}}>
      <h1 className="text-4xl font-bold mb-6" style={{color:'#222'}}>Panel de Cobranzas</h1>
      {/* Aquí irán los módulos: Clientes, Convenios, Cancelaciones */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Clientes */}
        <div className="bg-yellow-100 bg-opacity-90 rounded-lg shadow p-4 border-2 border-yellow-600">
          <h2 className="text-2xl font-bold mb-2" style={{color:'#222'}}>Clientes</h2>
          <button className="bg-gradient-to-r from-yellow-400 to-yellow-700 text-black px-3 py-1 rounded mb-2 border border-yellow-700 shadow" onClick={() => {
            const nombre = prompt('Nombre del cliente:');
            if (nombre) setClientes([...clientes, { nombre, id: Date.now() }]);
          }}>Nuevo Cliente</button>
          <ul>
            {clientes.map(c => <li key={c.id} className="flex justify-between items-center border-b border-yellow-400 py-1 text-black">
              <span>{c.nombre}</span>
              <button className="text-xs bg-yellow-300 px-2 py-1 rounded border border-yellow-600" onClick={() => { setSelectedCliente(c); setShowPago(true); }}>Nuevo Pago</button>
            </li>)}
          </ul>
        </div>
        {/* Convenios */}
        <div className="bg-yellow-100 bg-opacity-90 rounded-lg shadow p-4 border-2 border-yellow-600">
          <h2 className="text-2xl font-bold mb-2" style={{color:'#222'}}>Convenios</h2>
          <button className="bg-gradient-to-r from-yellow-400 to-yellow-700 text-black px-3 py-1 rounded mb-2 border border-yellow-700 shadow" onClick={() => setShowConvenio(true)}>Nuevo Convenio</button>
          <ul>
            {convenios.map((cv, i) => <li key={i} className="border-b border-yellow-400 py-1 text-black">{cv.cliente} - {cv.acuerdo}</li>)}
          </ul>
        </div>
        {/* Cancelaciones */}
        <div className="bg-yellow-100 bg-opacity-90 rounded-lg shadow p-4 border-2 border-yellow-600">
          <h2 className="text-2xl font-bold mb-2" style={{color:'#222'}}>Cancelaciones</h2>
          <button className="bg-gradient-to-r from-yellow-400 to-yellow-700 text-black px-3 py-1 rounded mb-2 border border-yellow-700 shadow" onClick={() => setShowCancelacion(true)}>Contrato Cancelado</button>
          <ul>
            {cancelaciones.map((c, i) => <li key={i} className="border-b border-yellow-400 py-1 text-black">{c.cliente} - ${c.monto}</li>)}
          </ul>
        </div>
      </div>
      {/* Modales para pagos, convenios, cancelaciones */}
      {showPago && selectedCliente && (
        <PagoModal cliente={selectedCliente} onClose={() => { setShowPago(false); setSelectedCliente(null); }} onSave={pago => { setPagos([...pagos, pago]); setShowPago(false); setSelectedCliente(null); }} />
      )}
      {showConvenio && (
        <ConvenioModal clientes={clientes} onClose={() => setShowConvenio(false)} onSave={cv => { setConvenios([...convenios, cv]); setShowConvenio(false); }} />
      )}
      {showCancelacion && (
        <CancelacionModal clientes={clientes} onClose={() => setShowCancelacion(false)} onSave={c => { setCancelaciones([...cancelaciones, c]); setShowCancelacion(false); }} />
      )}
    </div>
  );
}

// Modales auxiliares (Pago, Convenio, Cancelacion) se implementarán en el siguiente paso.

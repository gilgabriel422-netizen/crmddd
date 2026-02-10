import React, { useState, useEffect } from 'react';
import './DashboardGold.css';

// Modal Nuevo Pago: elegir cliente, valor, forma de pago, fecha, observación → Registrar
function PagoModal({ clientes, clientePreseleccionado, onClose, onSave }) {
  const [clientId, setClientId] = useState(clientePreseleccionado?.id ? String(clientePreseleccionado.id) : '');
  const [valor, setValor] = useState('');
  const [formaPago, setFormaPago] = useState('');
  const [fechaPago, setFechaPago] = useState(new Date().toISOString().split('T')[0]);
  const [observacion, setObservacion] = useState('');
  const [saving, setSaving] = useState(false);

  const handleRegistrar = async () => {
    if (!clientId || !valor || parseFloat(valor) <= 0) {
      alert('Seleccione un cliente e ingrese un valor válido.');
      return;
    }
    setSaving(true);
    try {
      const api = await import('../services/api');
      const res = await api.paymentService.createPayment({
        client_id: parseInt(clientId, 10),
        payment_amount: parseFloat(valor),
        payment_date: fechaPago,
        payment_method: formaPago || null,
        notes: observacion || null
      });
      const payment = res?.payment || res;
      onSave({ id: payment?.id, client_id: parseInt(clientId, 10), valor: parseFloat(valor), formaPago, fechaPago, observacion });
    } catch (e) {
      console.error(e);
      alert('Error al registrar el pago: ' + (e.response?.data?.error || e.message));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg p-6 max-w-md w-full shadow-xl">
        <h3 className="text-xl font-semibold mb-4">Nuevo pago</h3>
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Cliente</label>
            <select value={clientId} onChange={e => setClientId(e.target.value)} className="w-full border p-2 rounded" required>
              <option value="">-- Elegir cliente --</option>
              {(clientes || []).map(c => (
                <option key={c.id} value={c.id}>{c.first_name} {c.last_name} — {c.contract_number || c.email}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Valor del pago</label>
            <input type="number" step="0.01" min="0" value={valor} onChange={e => setValor(e.target.value)} placeholder="0.00" className="w-full border p-2 rounded" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Forma de pago</label>
            <select value={formaPago} onChange={e => setFormaPago(e.target.value)} className="w-full border p-2 rounded">
              <option value="">Seleccionar...</option>
              <option value="Efectivo">Efectivo</option>
              <option value="Transferencia">Transferencia</option>
              <option value="Tarjeta">Tarjeta</option>
              <option value="Cheque">Cheque</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Fecha de pago</label>
            <input type="date" value={fechaPago} onChange={e => setFechaPago(e.target.value)} className="w-full border p-2 rounded" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Observación</label>
            <textarea value={observacion} onChange={e => setObservacion(e.target.value)} rows={2} className="w-full border p-2 rounded" placeholder="Opcional" />
          </div>
        </div>
        <div className="mt-4 flex justify-end gap-2">
          <button type="button" onClick={onClose} className="px-3 py-1 border rounded">Cancelar</button>
          <button type="button" onClick={handleRegistrar} disabled={saving} className="px-3 py-1 bg-gradient-to-r from-yellow-400 to-yellow-700 text-black rounded disabled:opacity-50">
            {saving ? 'Guardando...' : 'Registrar pago'}
          </button>
        </div>
      </div>
    </div>
  );
}

// Modal Nuevo Convenio: elegir cliente, acuerdo de pago, fecha de pagos, manera de pagos, observación → Registrar
function ConvenioModal({ clientes, onClose, onSave }) {
  const [clientId, setClientId] = useState('');
  const [acuerdoPago, setAcuerdoPago] = useState('');
  const [fechaPagos, setFechaPagos] = useState(new Date().toISOString().split('T')[0]);
  const [maneraPagos, setManeraPagos] = useState('');
  const [observacion, setObservacion] = useState('');
  const [saving, setSaving] = useState(false);

  const handleRegistrar = async () => {
    if (!clientId || !acuerdoPago || parseFloat(acuerdoPago) <= 0) {
      alert('Seleccione un cliente e ingrese el acuerdo de pago (monto).');
      return;
    }
    setSaving(true);
    try {
      const api = await import('../services/api');
      const total = parseFloat(acuerdoPago);
      const res = await api.paymentAgreementService.createPaymentAgreement({
        client_id: parseInt(clientId, 10),
        total_amount: total,
        installment_count: 1,
        installment_amount: total,
        start_date: fechaPagos,
        notes: [maneraPagos, observacion].filter(Boolean).join(' | ') || null,
        status: 'active'
      });
      const agreement = res?.agreement || res;
      onSave({ id: agreement?.id, client_id: parseInt(clientId, 10), acuerdo: total, fechaPagos, maneraPagos, observacion });
    } catch (e) {
      console.error(e);
      alert('Error al registrar el convenio: ' + (e.response?.data?.error || e.message));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg p-6 max-w-md w-full shadow-xl">
        <h3 className="text-xl font-semibold mb-4">Nuevo convenio</h3>
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Cliente</label>
            <select value={clientId} onChange={e => setClientId(e.target.value)} className="w-full border p-2 rounded" required>
              <option value="">-- Elegir cliente --</option>
              {(clientes || []).map(c => (
                <option key={c.id} value={c.id}>{c.first_name} {c.last_name} — {c.contract_number || c.email}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Acuerdo de pago (monto total)</label>
            <input type="number" step="0.01" min="0" value={acuerdoPago} onChange={e => setAcuerdoPago(e.target.value)} placeholder="0.00" className="w-full border p-2 rounded" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Fecha de pagos</label>
            <input type="date" value={fechaPagos} onChange={e => setFechaPagos(e.target.value)} className="w-full border p-2 rounded" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Manera de pagos</label>
            <select value={maneraPagos} onChange={e => setManeraPagos(e.target.value)} className="w-full border p-2 rounded">
              <option value="">Seleccionar...</option>
              <option value="Efectivo">Efectivo</option>
              <option value="Transferencia">Transferencia</option>
              <option value="Tarjeta">Tarjeta</option>
              <option value="Cuotas">Cuotas</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Observación</label>
            <textarea value={observacion} onChange={e => setObservacion(e.target.value)} rows={2} className="w-full border p-2 rounded" placeholder="Opcional" />
          </div>
        </div>
        <div className="mt-4 flex justify-end gap-2">
          <button type="button" onClick={onClose} className="px-3 py-1 border rounded">Cancelar</button>
          <button type="button" onClick={handleRegistrar} disabled={saving} className="px-3 py-1 bg-gradient-to-r from-yellow-400 to-yellow-700 text-black rounded disabled:opacity-50">
            {saving ? 'Guardando...' : 'Registrar convenio'}
          </button>
        </div>
      </div>
    </div>
  );
}

// Modal simple para cancelación (local)
function CancelacionModal({ clientes, onClose, onSave }) {
  const [clientId, setClientId] = useState('');
  const [monto, setMonto] = useState('');
  const handleSave = () => {
    const c = (clientes || []).find(x => String(x.id) === String(clientId));
    onSave({ cliente: c ? `${c.first_name} ${c.last_name}` : 'Cliente', monto: monto || '0' });
  };
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg p-6 max-w-md w-full shadow-xl">
        <h3 className="text-xl font-semibold mb-4">Contrato cancelado</h3>
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Cliente</label>
            <select value={clientId} onChange={e => setClientId(e.target.value)} className="w-full border p-2 rounded">
              <option value="">-- Elegir --</option>
              {(clientes || []).map(c => (
                <option key={c.id} value={c.id}>{c.first_name} {c.last_name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Monto</label>
            <input type="text" value={monto} onChange={e => setMonto(e.target.value)} placeholder="0" className="w-full border p-2 rounded" />
          </div>
        </div>
        <div className="mt-4 flex justify-end gap-2">
          <button type="button" onClick={onClose} className="px-3 py-1 border rounded">Cancelar</button>
          <button type="button" onClick={handleSave} className="px-3 py-1 bg-yellow-600 text-black rounded">Registrar</button>
        </div>
      </div>
    </div>
  );
}

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
  const [loadingClients, setLoadingClients] = useState(false);

  useEffect(() => {
    if (!authed) return;
    const load = async () => {
      setLoadingClients(true);
      try {
        const api = await import('../services/api');
        const resp = await api.clientService.getClients({ limit: 1000 });
        setClientes(resp?.clients || []);
      } catch (e) {
        console.error('Error cargando clientes', e);
      } finally {
        setLoadingClients(false);
      }
    };
    load();
  }, [authed]);

  if (!authed) {
    return (
      <div className="dashboard-gold-bg min-h-screen flex flex-col items-center justify-center" style={{ background: 'linear-gradient(135deg, #FFD700 0%, #FFB300 100%)' }}>
        <h2 className="text-3xl font-bold mb-4" style={{ color: '#222' }}>Dashboard Cobranzas</h2>
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

  return (
    <div className="dashboard-gold-bg min-h-screen p-6" style={{ background: 'linear-gradient(135deg, #FFD700 0%, #FFB300 100%)' }}>
      <h1 className="text-4xl font-bold mb-6" style={{ color: '#222' }}>Panel de Cobranzas</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Módulo Pagos */}
        <div className="bg-yellow-100 bg-opacity-90 rounded-lg shadow p-4 border-2 border-yellow-600">
          <h2 className="text-2xl font-bold mb-2" style={{ color: '#222' }}>Pagos</h2>
          <button
            className="bg-gradient-to-r from-yellow-400 to-yellow-700 text-black px-3 py-1 rounded mb-2 border border-yellow-700 shadow"
            onClick={() => { setSelectedCliente(null); setShowPago(true); }}
          >
            Nuevo pago
          </button>
          {loadingClients ? <p className="text-sm text-gray-600">Cargando clientes...</p> : <p className="text-sm text-gray-600">{clientes.length} clientes</p>}
          <ul className="mt-2 max-h-48 overflow-y-auto">
            {pagos.map((p, i) => (
              <li key={i} className="border-b border-yellow-400 py-1 text-black text-sm">
                Cliente #{p.client_id} — ${p.valor} — {p.fechaPago}
              </li>
            ))}
          </ul>
        </div>

        {/* Módulo Convenios */}
        <div className="bg-yellow-100 bg-opacity-90 rounded-lg shadow p-4 border-2 border-yellow-600">
          <h2 className="text-2xl font-bold mb-2" style={{ color: '#222' }}>Convenios</h2>
          <button
            className="bg-gradient-to-r from-yellow-400 to-yellow-700 text-black px-3 py-1 rounded mb-2 border border-yellow-700 shadow"
            onClick={() => setShowConvenio(true)}
          >
            Nuevo convenio
          </button>
          <ul className="mt-2 max-h-48 overflow-y-auto">
            {convenios.map((cv, i) => (
              <li key={i} className="border-b border-yellow-400 py-1 text-black text-sm">
                Cliente #{cv.client_id} — ${cv.acuerdo} — {cv.fechaPagos}
              </li>
            ))}
          </ul>
        </div>

        {/* Cancelaciones */}
        <div className="bg-yellow-100 bg-opacity-90 rounded-lg shadow p-4 border-2 border-yellow-600">
          <h2 className="text-2xl font-bold mb-2" style={{ color: '#222' }}>Cancelaciones</h2>
          <button
            className="bg-gradient-to-r from-yellow-400 to-yellow-700 text-black px-3 py-1 rounded mb-2 border border-yellow-700 shadow"
            onClick={() => setShowCancelacion(true)}
          >
            Contrato cancelado
          </button>
          <ul className="mt-2 max-h-48 overflow-y-auto">
            {cancelaciones.map((c, i) => (
              <li key={i} className="border-b border-yellow-400 py-1 text-black text-sm">{c.cliente} — ${c.monto}</li>
            ))}
          </ul>
        </div>
      </div>

      {showPago && (
        <PagoModal
          clientes={clientes}
          clientePreseleccionado={selectedCliente}
          onClose={() => { setShowPago(false); setSelectedCliente(null); }}
          onSave={pago => { setPagos(prev => [...prev, pago]); setShowPago(false); setSelectedCliente(null); }}
        />
      )}
      {showConvenio && (
        <ConvenioModal
          clientes={clientes}
          onClose={() => setShowConvenio(false)}
          onSave={cv => { setConvenios(prev => [...prev, cv]); setShowConvenio(false); }}
        />
      )}
      {showCancelacion && (
        <CancelacionModal clientes={clientes} onClose={() => setShowCancelacion(false)} onSave={c => { setCancelaciones(prev => [...prev, c]); setShowCancelacion(false); }} />
      )}
    </div>
  );
}

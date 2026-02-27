import React, { useEffect, useMemo, useState } from 'react';
import './DashboardGold.css';
import { useAuth } from '../contexts/AuthContext';
import NotificationBell from '../components/NotificationBell';
import api from '../services/api';

const SECCIONES = {
  clientes: 'clientes',
  bitacora: 'bitacora',
  plantillas: 'plantillas',
  contactos: 'contactos',
  cancelaciones: 'cancelaciones'
};

const POSTVENTA_ESTADOS = [
  { value: 'en_proceso', label: 'En proceso' },
  { value: 'pendiente_respuesta_cliente', label: 'Pendiente respuesta cliente' },
  { value: 'solucionado', label: 'Solucionado' },
  { value: 'rescindio', label: 'Rescindió' },
  { value: 'no_quiso_solucionar', label: 'No quiso solucionar' },
  { value: 'no_contactar', label: 'No contactar' }
];

function normalizeUsers(resp) {
  return Array.isArray(resp?.users) ? resp.users : Array.isArray(resp) ? resp : [];
}
function normalizeClients(resp) {
  if (Array.isArray(resp?.clients)) return resp.clients;
  if (Array.isArray(resp)) return resp;
  if (Array.isArray(resp?.data)) return resp.data;
  return [];
}
function safeText(v) {
  return (v ?? '').toString();
}

export default function DashboardPostventa() {
  const { user, logout } = useAuth();
  const [seccionActiva, setSeccionActiva] = useState(SECCIONES.clientes);

  const [clientes, setClientes] = useState([]);
  const [allClients, setAllClients] = useState([]);
  const [clientesLoading, setClientesLoading] = useState(true);

  const [contactos, setContactos] = useState([]);
  const [loadingContactos, setLoadingContactos] = useState(false);

  // Modal caso
  const [showCaso, setShowCaso] = useState(false);
  const [clienteSeleccionado, setClienteSeleccionado] = useState(null);

  // Bitácora
  const [bitacora, setBitacora] = useState([]);
  const [bitacoraLoading, setBitacoraLoading] = useState(false);
  const [nota, setNota] = useState('');
  const [canal, setCanal] = useState('whatsapp');
  const [guardandoNota, setGuardandoNota] = useState(false);

  // Estado postventa
  const [estadoPostventa, setEstadoPostventa] = useState('en_proceso');
  const [motivoPostventa, setMotivoPostventa] = useState('');
  const [guardandoEstado, setGuardandoEstado] = useState(false);

  // Plantilla 72h (sección + dentro del caso)
  const analistaNombre = useMemo(() => {
    return user?.name || user?.full_name || user?.email || 'Postventa';
  }, [user]);

  const plantilla72Default = useMemo(() => {
    return `Hola {NOMBRE},

Hemos recibido tu requerimiento. En un plazo máximo de 72 horas recibirás una respuesta formal.

Tu caso será analizado por: ${analistaNombre}

Gracias,
Innovation Business – Postventa
Referencia contrato: {CONTRATO}`.trim();
  }, [analistaNombre]);

  const [plantilla72, setPlantilla72] = useState('');

  useEffect(() => {
    setPlantilla72(plantilla72Default);
  }, [plantilla72Default]);

  // Cargar clientes (asignados + todos)
  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        setClientesLoading(true);

        const apiMod = await import('../services/api');
        const resp = await apiMod.clientService.getClients({ limit: 1000 });
        const usersResp = await apiMod.userService.getUsers();
        const users = normalizeUsers(usersResp);

        const postUser = users.find(
          (u) => (u.email || '').toLowerCase() === 'postventa@crm.com' || (u.email || '').toLowerCase() === 'postventa'
        );

        const all = normalizeClients(resp);
        const filtered = all.filter((c) =>
          postUser
            ? String(c.usuario_asignado_id) === String(postUser.id)
            : (c.usuario_asignado_nombre || '').toLowerCase().includes('postven')
        );

        if (!cancelled) {
          setClientes(filtered);
          setAllClients(all);
        }
      } catch (e) {
        console.error(e);
        if (!cancelled) {
          setClientes([]);
          setAllClients([]);
        }
      } finally {
        if (!cancelled) setClientesLoading(false);
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  // Contactos
  useEffect(() => {
    if (seccionActiva !== SECCIONES.contactos) return;

    let cancelled = false;
    setLoadingContactos(true);

    api
      .get('/contactos')
      .then((res) => {
        if (cancelled) return;
        const data = Array.isArray(res.data) ? res.data : res.data?.data ?? [];
        setContactos(Array.isArray(data) ? data : []);
      })
      .catch(() => {
        if (!cancelled) setContactos([]);
      })
      .finally(() => {
        if (!cancelled) setLoadingContactos(false);
      });

    return () => {
      cancelled = true;
    };
  }, [seccionActiva]);

  const menuItem = (key, label) => (
    <li
      key={key}
      onClick={() => setSeccionActiva(key)}
      className={`py-2 px-3 rounded cursor-pointer ${
        seccionActiva === key ? 'bg-yellow-200 font-medium' : 'hover:bg-yellow-200'
      }`}
    >
      {label}
    </li>
  );

  const cargarBitacora = async (clienteId) => {
    if (!clienteId) return;
    setBitacoraLoading(true);
    try {
      const res = await api.get(`/postventa/bitacora/${clienteId}`);
      const data = Array.isArray(res.data) ? res.data : res.data?.data ?? [];
      setBitacora(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error('Error cargando bitácora:', e);
      setBitacora([]);
    } finally {
      setBitacoraLoading(false);
    }
  };

  const buildPlantillaParaCliente = (cliente) => {
    const nombre = `${safeText(cliente?.first_name)} ${safeText(cliente?.last_name)}`.trim() || 'cliente';
    const contrato = safeText(cliente?.contract_number || cliente?.numero_contrato || '');
    return (plantilla72 || plantilla72Default)
      .replaceAll('{NOMBRE}', nombre)
      .replaceAll('{CONTRATO}', contrato || '—');
  };

  const openCaso = async (cliente) => {
    setClienteSeleccionado(cliente);
    setShowCaso(true);

    setEstadoPostventa(cliente?.postventa_estado || 'en_proceso');
    setMotivoPostventa(cliente?.postventa_motivo || '');

    await cargarBitacora(cliente?.id);
  };

  const closeCaso = () => {
    setShowCaso(false);
    setClienteSeleccionado(null);
    setBitacora([]);
    setNota('');
    setCanal('whatsapp');
  };

  const guardarNota = async () => {
    const clienteId = clienteSeleccionado?.id;
    if (!clienteId) return alert('No hay cliente seleccionado');
    if (!nota.trim()) return alert('Escribe una nota');

    setGuardandoNota(true);
    try {
      const payload = {
        nota: nota.trim(),
        canal,
        usuario_id: user?.id || user?.usuario_id || null
      };
      const res = await api.post(`/postventa/bitacora/${clienteId}`, payload);
      const nueva = res.data?.data || res.data;

      if (nueva && (nueva.id || nueva.created_at)) {
        setBitacora((prev) => [nueva, ...prev]);
      } else {
        await cargarBitacora(clienteId);
      }
      setNota('');
    } catch (e) {
      console.error('Error guardando nota:', e);
      alert('Error al guardar nota: ' + (e.response?.data?.message || e.message));
    } finally {
      setGuardandoNota(false);
    }
  };

  const guardarEstado = async () => {
    const clienteId = clienteSeleccionado?.id;
    if (!clienteId) return alert('No hay cliente seleccionado');

    setGuardandoEstado(true);
    try {
      const payload = {
        postventa_estado: estadoPostventa,
        postventa_motivo: motivoPostventa
      };
      await api.patch(`/clientes/${clienteId}/postventa-estado`, payload);

      setClientes((prev) =>
        prev.map((c) =>
          String(c.id) === String(clienteId)
            ? { ...c, postventa_estado: estadoPostventa, postventa_motivo: motivoPostventa }
            : c
        )
      );
      setAllClients((prev) =>
        prev.map((c) =>
          String(c.id) === String(clienteId)
            ? { ...c, postventa_estado: estadoPostventa, postventa_motivo: motivoPostventa }
            : c
        )
      );
      setClienteSeleccionado((prev) =>
        prev ? { ...prev, postventa_estado: estadoPostventa, postventa_motivo: motivoPostventa } : prev
      );

      alert('Estado de postventa actualizado');
    } catch (e) {
      console.error('Error guardando estado:', e);
      alert('Error al guardar estado: ' + (e.response?.data?.message || e.message));
    } finally {
      setGuardandoEstado(false);
    }
  };

  const copiarTexto = async (txt) => {
    try {
      await navigator.clipboard.writeText(txt || '');
      alert('Copiado');
    } catch {
      alert('No se pudo copiar. Copia manualmente.');
    }
  };

  return (
    <div className="min-h-screen bg-yellow-50 text-black">
      <div className="max-w-7xl mx-auto p-6 grid grid-cols-12 gap-6">
        <aside className="col-span-3 bg-yellow-100 rounded-lg p-4 shadow">
          <h2 className="text-xl font-bold mb-4">Menú - Postventa</h2>
          <ul className="space-y-2">
            {menuItem(SECCIONES.clientes, 'Clientes')}
            {menuItem(SECCIONES.bitacora, 'Bitácora')}
            {menuItem(SECCIONES.plantillas, 'Plantillas')}
            {menuItem(SECCIONES.contactos, 'Contactos')}
            {menuItem(SECCIONES.cancelaciones, 'Cancelaciones')}
          </ul>
        </aside>

        <main className="col-span-9">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-3xl font-bold">Panel de Postventa</h1>
            <div className="flex gap-2 items-center">
              <NotificationBell />
              <button
                className="px-4 py-2 bg-gradient-to-r from-yellow-400 to-yellow-700 rounded text-black"
                onClick={() => window.location.reload()}
              >
                Actualizar
              </button>
              <button className="px-4 py-2 border rounded text-red-700 hover:bg-red-50" onClick={logout}>
                Salir
              </button>
            </div>
          </div>

          {/* CLIENTES */}
          {seccionActiva === SECCIONES.clientes && (
            <div className="bg-white rounded-lg shadow p-4">
              <h2 className="text-2xl font-bold mb-2">Clientes enviados a Postventa</h2>

              {clientesLoading ? (
                <p className="text-gray-600">Cargando clientes...</p>
              ) : clientes.length === 0 ? (
                <div className="text-gray-600">
                  <p>No hay clientes asignados a Postventa.</p>
                  <p className="text-sm mt-2">
                    Aun así puedes usar <b>Bitácora</b> para abrir un cliente y registrar notas.
                  </p>
                </div>
              ) : (
                <ul className="space-y-2">
                  {clientes.map((c) => (
                    <li key={c.id} className="border rounded p-3 flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="font-semibold">
                          {c.first_name} {c.last_name}
                        </div>
                        <div className="text-sm text-gray-700 break-words">{c.email}</div>
                        <div className="text-sm text-gray-700">Contrato: {c.contract_number || '—'}</div>
                        <div className="mt-2 flex flex-wrap gap-2 items-center">
                          <span className="text-xs px-2 py-1 rounded bg-gray-100">
                            Estado: {c.postventa_estado || 'en_proceso'}
                          </span>
                          {c.postventa_estado === 'no_contactar' && (
                            <span className="text-xs px-2 py-1 rounded bg-red-100 text-red-700 font-semibold">
                              NO CONTACTAR
                            </span>
                          )}
                        </div>
                      </div>

                      <button
                        className="px-3 py-2 bg-gradient-to-r from-yellow-400 to-yellow-700 text-black rounded font-medium hover:opacity-90"
                        onClick={() => openCaso(c)}
                      >
                        Ver caso / Bitácora
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}

          {/* BITÁCORA (VISIBLE AUNQUE NO HAYA CLIENTES ASIGNADOS) */}
          {seccionActiva === SECCIONES.bitacora && (
            <div className="bg-white rounded-lg shadow p-4">
              <h2 className="text-2xl font-bold mb-2">Bitácora</h2>
              <p className="text-sm text-gray-600 mb-4">
                Selecciona un cliente para abrir el caso y registrar notas por fecha.
              </p>

              <div className="flex flex-col md:flex-row gap-3 items-start md:items-end">
                <div className="flex-1 w-full">
                  <label className="block text-sm font-medium mb-1">Cliente</label>
                  <select
                    className="w-full border rounded px-3 py-2"
                    value={clienteSeleccionado?.id || ''}
                    onChange={(e) => {
                      const id = e.target.value || '';
                      const cli = (allClients || []).find((x) => String(x.id) === String(id));
                      if (cli) openCaso(cli);
                    }}
                  >
                    <option value="">-- Seleccionar cliente --</option>
                    {(allClients || []).map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.first_name} {c.last_name} — {c.contract_number || c.email}
                      </option>
                    ))}
                  </select>
                </div>

                <button
                  className="px-3 py-2 border rounded hover:bg-gray-50"
                  onClick={() => setSeccionActiva(SECCIONES.plantillas)}
                >
                  Ir a Plantillas
                </button>
              </div>

              <div className="mt-4 p-3 bg-gray-50 border rounded text-sm text-gray-600">
                Tip: si aún no tienes clientes, crea uno en Contratos y vuelve aquí.
              </div>
            </div>
          )}

          {/* PLANTILLAS */}
          {seccionActiva === SECCIONES.plantillas && (
            <div className="bg-white rounded-lg shadow p-4">
              <h2 className="text-2xl font-bold mb-2">Plantillas</h2>
              <p className="text-sm text-gray-600 mb-4">
                Plantilla para confirmar recepción y avisar respuesta en 72 horas. (Editable)
              </p>

              <textarea
                className="w-full border rounded p-3 h-48"
                value={plantilla72}
                onChange={(e) => setPlantilla72(e.target.value)}
                placeholder="Pega aquí la plantilla de Jorge..."
              />

              <div className="mt-3 flex flex-wrap gap-2 justify-end">
                <button className="px-3 py-2 border rounded hover:bg-gray-50" onClick={() => setPlantilla72(plantilla72Default)}>
                  Restaurar default
                </button>
                <button
                  className="px-3 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                  onClick={() => copiarTexto(plantilla72)}
                >
                  Copiar plantilla
                </button>
              </div>

              <div className="mt-3 text-xs text-gray-500">
                Variables soportadas: <span className="font-mono">{'{NOMBRE}'}</span>, <span className="font-mono">{'{CONTRATO}'}</span>
              </div>
            </div>
          )}

          {/* CONTACTOS */}
          {seccionActiva === SECCIONES.contactos && (
            <div className="bg-white rounded-lg shadow p-4">
              <h2 className="text-2xl font-bold mb-2">Contactos</h2>
              {loadingContactos ? (
                <p className="text-gray-600">Cargando contactos...</p>
              ) : contactos.length === 0 ? (
                <p className="text-gray-600">No hay contactos registrados.</p>
              ) : (
                <ul className="space-y-2">
                  {contactos.map((c, i) => (
                    <li key={c.id ?? i} className="border-b py-2 flex flex-wrap gap-x-4 gap-y-1">
                      <span className="font-medium">{c.nombre ?? '—'}</span>
                      {c.cargo && <span className="text-gray-600">{c.cargo}</span>}
                      {c.email && <span>{c.email}</span>}
                      {c.telefono && <span>{c.telefono}</span>}
                      {c.es_principal && <span className="text-amber-600 text-sm">Principal</span>}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}

          {/* CANCELACIONES */}
          {seccionActiva === SECCIONES.cancelaciones && (
            <div className="bg-white rounded-lg shadow p-4">
              <h2 className="text-2xl font-bold mb-2">Cancelaciones</h2>
              <p className="text-gray-600">
                Solicitudes y gestiones de cancelación. Aquí podrás ver las solicitudes de cancelación de contratos cuando estén disponibles.
              </p>
              <div className="mt-4 p-4 bg-gray-50 rounded border border-gray-200">
                <p className="text-sm text-gray-500">No hay solicitudes de cancelación pendientes.</p>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* MODAL CASO (BITÁCORA + ESTADO + PLANTILLA PARA ESE CLIENTE) */}
      {showCaso && clienteSeleccionado && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-4xl w-full shadow-xl max-h-[88vh] overflow-y-auto">
            <div className="flex items-start justify-between gap-3 mb-4">
              <div className="min-w-0">
                <h3 className="text-xl font-bold">
                  Caso Postventa — {clienteSeleccionado.first_name} {clienteSeleccionado.last_name}
                </h3>
                <p className="text-sm text-gray-600 break-words">{clienteSeleccionado.email}</p>
                <p className="text-sm text-gray-600">Contrato: {clienteSeleccionado.contract_number || '—'}</p>
              </div>
              <button className="px-3 py-2 border rounded hover:bg-gray-50" onClick={closeCaso}>
                Cerrar
              </button>
            </div>

            {/* ESTADO */}
            <div className="border rounded-lg p-4 mb-4 bg-yellow-50/40">
              <h4 className="font-semibold mb-2">Estado de Postventa</h4>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Estado</label>
                  <select
                    className="w-full border rounded px-3 py-2"
                    value={estadoPostventa}
                    onChange={(e) => setEstadoPostventa(e.target.value)}
                    disabled={guardandoEstado}
                  >
                    {POSTVENTA_ESTADOS.map((s) => (
                      <option key={s.value} value={s.value}>
                        {s.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Motivo / Observación</label>
                  <input
                    className="w-full border rounded px-3 py-2"
                    value={motivoPostventa}
                    onChange={(e) => setMotivoPostventa(e.target.value)}
                    placeholder="Ej: Cliente pidió no contactar, se resolvió por..."
                    disabled={guardandoEstado}
                  />
                </div>
              </div>

              <div className="mt-3 flex justify-end">
                <button
                  className="px-4 py-2 bg-gradient-to-r from-yellow-400 to-yellow-700 text-black rounded font-medium hover:opacity-90 disabled:opacity-50"
                  onClick={guardarEstado}
                  disabled={guardandoEstado}
                >
                  {guardandoEstado ? 'Guardando...' : 'Guardar estado'}
                </button>
              </div>
            </div>

            {/* PLANTILLA PARA ESTE CLIENTE */}
            <div className="border rounded-lg p-4 mb-4">
              <h4 className="font-semibold mb-2">Plantilla 72 horas (para este cliente)</h4>
              <div className="text-xs text-gray-500 mb-2">
                Se rellenan automáticamente: <span className="font-mono">{'{NOMBRE}'}</span> y <span className="font-mono">{'{CONTRATO}'}</span>
              </div>
              <textarea
                className="w-full border rounded p-3 h-40"
                value={buildPlantillaParaCliente(clienteSeleccionado)}
                readOnly
              />
              <div className="mt-3 flex flex-wrap gap-2 justify-end">
                <button
                  className="px-3 py-2 border rounded hover:bg-gray-50"
                  onClick={() => copiarTexto(buildPlantillaParaCliente(clienteSeleccionado))}
                >
                  Copiar texto
                </button>
                <button
                  className="px-3 py-2 border rounded hover:bg-gray-50"
                  onClick={() => setSeccionActiva(SECCIONES.plantillas)}
                >
                  Editar plantilla base
                </button>
              </div>
            </div>

            {/* BITÁCORA */}
            <div className="border rounded-lg p-4">
              <h4 className="font-semibold mb-2">Bitácora</h4>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-2 mb-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Canal</label>
                  <select
                    className="w-full border rounded px-3 py-2"
                    value={canal}
                    onChange={(e) => setCanal(e.target.value)}
                    disabled={guardandoNota}
                  >
                    <option value="whatsapp">WhatsApp</option>
                    <option value="llamada">Llamada</option>
                    <option value="email">Email</option>
                    <option value="presencial">Presencial</option>
                    <option value="otro">Otro</option>
                  </select>
                </div>
                <div className="md:col-span-3">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nueva nota</label>
                  <input
                    className="w-full border rounded px-3 py-2"
                    value={nota}
                    onChange={(e) => setNota(e.target.value)}
                    placeholder="Ej: Se contactó al cliente, quedó en enviar documentos..."
                    disabled={guardandoNota}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') guardarNota();
                    }}
                  />
                </div>
              </div>

              <div className="flex justify-end mb-4">
                <button
                  className="px-4 py-2 bg-gradient-to-r from-yellow-400 to-yellow-700 text-black rounded font-medium hover:opacity-90 disabled:opacity-50"
                  onClick={guardarNota}
                  disabled={guardandoNota}
                >
                  {guardandoNota ? 'Guardando...' : 'Agregar a bitácora'}
                </button>
              </div>

              {bitacoraLoading ? (
                <p className="text-gray-600">Cargando bitácora...</p>
              ) : bitacora.length === 0 ? (
                <p className="text-gray-600">No hay notas aún.</p>
              ) : (
                <ul className="space-y-2">
                  {bitacora.map((b) => (
                    <li key={b.id || `${b.created_at}-${Math.random()}`} className="border rounded p-3 bg-gray-50">
                      <div className="flex flex-wrap items-center gap-2 justify-between">
                        <div className="text-sm text-gray-700">
                          <span className="font-semibold">{(b.canal || 'otro').toString().toUpperCase()}</span>
                          <span className="mx-2">•</span>
                          <span>
                            {b.created_at
                              ? new Date(b.created_at).toLocaleString('es-EC', {
                                  year: 'numeric',
                                  month: '2-digit',
                                  day: '2-digit',
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })
                              : 'Fecha no disponible'}
                          </span>
                        </div>
                        {b.usuario_nombre && <div className="text-xs text-gray-500">por {b.usuario_nombre}</div>}
                      </div>
                      <div className="mt-2 whitespace-pre-wrap text-gray-800">{b.nota}</div>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="mt-5 flex justify-end">
              <button className="px-4 py-2 border rounded hover:bg-gray-50" onClick={closeCaso}>
                Cerrar
              </button>
            </div>

            <div className="mt-3 text-xs text-gray-500">
              Endpoints esperados:
              <span className="font-mono"> GET/POST /postventa/bitacora/:clienteId </span>
              y <span className="font-mono"> PATCH /clientes/:id/postventa-estado</span>.
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
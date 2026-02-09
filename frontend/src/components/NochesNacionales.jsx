import React, { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import pointsService from '../services/pointsService'
import Calendar3DModal from './Calendar3DModal'

const LOCATIONS = [
  {
    id: 'quito',
    title: 'DEPARTAMENTO EN QUITO',
    image: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=1200&q=60',
    price: 120
  },
  {
    id: 'cuenca',
    title: 'DEPARTAMENTO EN CUENCA',
    image: 'https://images.unsplash.com/photo-1505904267569-6b6f1d0a7f11?auto=format&fit=crop&w=1200&q=60',
    price: 90
  }
]

function formatDate(d) {
  if (!d) return ''
  return new Date(d).toLocaleDateString()
}

const STORAGE_KEY = 'ib_reservas'

const NochesNacionales = () => {
  const [selected, setSelected] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [calendarDept, setCalendarDept] = useState(null)
  const [start, setStart] = useState('')
  const [end, setEnd] = useState('')
  const [people, setPeople] = useState(2)
  const [usePoints, setUsePoints] = useState(false)
  const [pointsAvailable, setPointsAvailable] = useState(0)
  const { user } = useAuth()

  useEffect(() => {
    const loadPoints = async () => {
      if (user?.email) {
        try {
          const pts = await pointsService.getPointsForUser(user.email)
          setPointsAvailable(pts)
        } catch (err) {
          console.error('Error loading points', err)
        }
      }
    }
    loadPoints()
  }, [user])
  const [receiptPreview, setReceiptPreview] = useState(null)

  const openReserve = (loc) => {
    setSelected(loc)
    setShowModal(true)
  }

  const handleFile = (e) => {
    const f = e.target.files[0]
    if (!f) return
    const reader = new FileReader()
    reader.onload = () => setReceiptPreview(reader.result)
    reader.readAsDataURL(f)
  }

  const submitReservation = async () => {
    if (!start || !end) return alert('Elige fechas')
    // validate date order
    const s = new Date(start)
    const e = new Date(end)
    if (e <= s) return alert('La fecha de egreso debe ser posterior a la de ingreso')

    // check overlapping reservations for the same department (mock block)
    const existing = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]')
    const overlap = existing.some(r => r.dept === selected.id && !(new Date(r.end) <= s || new Date(r.start) >= e))
    if (overlap) return alert('Las fechas seleccionadas confligen con otra reserva. Elige otras fechas.')
    // compute nights and totals
    const nights = Math.max(1, Math.round((e - s) / (24 * 60 * 60 * 1000)))
    const total = nights * Number(selected.price || 0)

    const pointsToUse = usePoints ? Math.min(pointsAvailable, total) : 0

    const resv = {
      id: Date.now(),
      dept: selected.id,
      start, end, people,
      nights,
      total,
      pointsUsed: pointsToUse,
      paidWithPoints: usePoints,
      receipt: receiptPreview || null,
      createdBy: user?.email || user?.username || 'guest',
      createdAt: new Date().toISOString()
    }

    existing.push(resv)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(existing))
    // if used points, deduct from user's balance via backend
    if (usePoints && (pointsAvailable > 0) && user?.email) {
      try {
        const newBalance = Math.max(0, pointsAvailable - pointsToUse)
        await pointsService.setPointsForUser(user.email, newBalance)
        setPointsAvailable(newBalance)
      } catch (err) {
        console.error('Error updating points', err)
      }
    }
    alert('Reserva registrada en historial (mock). Fechas bloqueadas localmente.')
    setShowModal(false)
    setStart('')
    setEnd('')
    setReceiptPreview(null)
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Noches Nacionales</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {LOCATIONS.map(loc => (
          <div key={loc.id} className="card overflow-hidden">
            <div className="h-48 w-full overflow-hidden">
              <img src={loc.image} alt={loc.title} className="w-full h-full object-cover" />
            </div>
            <div className="p-4">
              <h3 className="font-bold text-lg">{loc.title}</h3>
              <p className="text-sm text-gray-600 mb-2">Beneficios: Cama matrimonial, WiFi, cocina equipada.</p>
              <div className="flex items-center justify-between">
                <div className="text-xl font-semibold">${loc.price} / noche</div>
                <div className="flex gap-2">
                  <button className="btn-primary" onClick={() => openReserve(loc)}>Hacer Reserva</button>
                  <button className="btn-outline" onClick={() => setCalendarDept(loc.id)}>Ver calendario</button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {calendarDept && <Calendar3DModal deptId={calendarDept} deptName={LOCATIONS.find(l=>l.id===calendarDept)?.title} onClose={()=>setCalendarDept(null)} />}

      {showModal && selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full p-6">
            <h3 className="text-xl font-bold mb-2">Reservar - {selected.title}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm">Fecha de ingreso</label>
                <input type="date" value={start} onChange={e=>setStart(e.target.value)} className="border p-2 rounded w-full" />
              </div>
              <div>
                <label className="block text-sm">Fecha de egreso</label>
                <input type="date" value={end} onChange={e=>setEnd(e.target.value)} className="border p-2 rounded w-full" />
              </div>
            </div>

            <div className="mb-4">
              <p><b>Cantidad de personas:</b></p>
              <select value={people} onChange={e=>setPeople(Number(e.target.value))} className="border p-2 rounded mt-2">
                <option value={1}>1</option>
                <option value={2}>2</option>
                <option value={3}>3</option>
                <option value={4}>4</option>
              </select>
            </div>

            <div className="mb-4 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-semibold">Normativas</h4>
                <ul className="list-disc ml-4 text-sm">
                  <li>No fumar dentro del departamento.</li>
                  <li>Horario de silencio desde las 22:00.</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold">Beneficios</h4>
                <ul className="list-disc ml-4 text-sm">
                  <li>WiFi gratis</li>
                  <li>Limpieza incluida</li>
                </ul>
              </div>
            </div>

            <div className="mb-4">
              <p><b>Horarios:</b> Ingreso 14:00 - Salida 11:00</p>
              {start && end ? (
                (() => {
                  const s = new Date(start)
                  const e = new Date(end)
                  const nights = Math.max(1, Math.round((e - s) / (24 * 60 * 60 * 1000)))
                  const total = nights * Number(selected.price || 0)
                  const canApply = usePoints ? Math.min(pointsAvailable, total) : 0
                  const remaining = Math.max(0, total - canApply)
                  return (
                    <div>
                      <p className="font-semibold">Noches: {nights}</p>
                      <p><b>Valor total estimado:</b> ${total} ({nights} × ${selected.price})</p>
                      {usePoints ? (
                        <p className="text-sm mt-2">Se aplicarán {canApply} puntos; restante a pagar: ${remaining}.</p>
                      ) : (
                        <p className="text-sm mt-2">No estás usando puntos. Total a pagar: ${total}.</p>
                      )}
                    </div>
                  )
                })()
              ) : (
                <p><b>Valor por noche:</b> ${selected.price}</p>
              )}
            </div>

            <div className="mb-4">
              <label className="inline-flex items-center">
                <input type="checkbox" checked={usePoints} onChange={e=>setUsePoints(e.target.checked)} className="mr-2" /> Usar PUNTOS IB (Disponibles: {pointsAvailable})
              </label>
            </div>

            <div className="mb-4">
              <h4 className="font-semibold">Pago</h4>
              <p>Número de cuenta: <b>ECU-000-000-000</b></p>
              <div className="mt-2">
                <label className="block text-sm">Subir comprobante de transferencia</label>
                <input type="file" accept="image/*,application/pdf" onChange={handleFile} className="mt-2" />
                {receiptPreview && <img src={receiptPreview} alt="comprobante" className="mt-2 max-h-40" />}
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <button className="px-4 py-2 bg-gray-200 rounded" onClick={()=>setShowModal(false)}>Cancelar</button>
              <button className="btn-primary px-4 py-2" onClick={submitReservation}>Aceptar y Registrar Reserva</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default NochesNacionales

import React, { useState, useEffect } from 'react'

const STORAGE_KEY = 'ib_reservas'

const HistorialReservasModal = ({ deptId, onClose }) => {
  const [reservas, setReservas] = useState([])

  useEffect(() => {
    const all = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]')
    setReservas(all.filter(r => r.dept === deptId))
  }, [deptId])

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-lg max-w-3xl w-full p-6">
        <h3 className="text-xl font-bold mb-4">Historial de Reservas - {deptId}</h3>
        {reservas.length === 0 ? (
          <p>No hay reservas para este departamento (mock).</p>
        ) : (
          <ul className="space-y-4">
            {reservas.map(r => (
              <li key={r.id} className="border p-3 rounded">
                <p><b>Fechas:</b> {new Date(r.start).toLocaleDateString()} - {new Date(r.end).toLocaleDateString()}</p>
                {r.nights && <p><b>Noches:</b> {r.nights}</p>}
                {r.total !== undefined && <p><b>Total:</b> ${r.total}</p>}
                <p><b>Personas:</b> {r.people}</p>
                <p><b>Puntos aplicados:</b> {r.pointsUsed || 0}</p>
                <p><b>Restante a pagar:</b> ${Math.max(0, (r.total || 0) - (r.pointsUsed || 0))}</p>
                <p><b>Pagó con puntos:</b> {r.paidWithPoints ? 'Sí' : 'No'}</p>
                {r.receipt && <img src={r.receipt} alt="comprobante" className="mt-2 max-h-40" />}
              </li>
            ))}
          </ul>
        )}
        <div className="flex justify-end mt-4">
          <button className="px-4 py-2 bg-gray-200 rounded" onClick={onClose}>Cerrar</button>
        </div>
      </div>
    </div>
  )
}

export default HistorialReservasModal

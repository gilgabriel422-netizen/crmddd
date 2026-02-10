import React from 'react'

const STORAGE_KEY = 'ib_reservas'

function getReservationsFor(deptId, allowedEmails = null) {
  try {
    const all = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]')
    return all.filter(r => {
      const matchDept = (r.dept === deptId) || (r.dept === (deptId || '')) || ((''+r.dept).toLowerCase() === (''+deptId).toLowerCase())
      if (!matchDept) return false
      if (Array.isArray(allowedEmails) && allowedEmails.length > 0) {
        const creator = (r.createdBy || r.user || r.email || '').toString().toLowerCase()
        return allowedEmails.map(e=>e.toString().toLowerCase()).includes(creator)
      }
      return true
    })
  } catch (e) { return [] }
}

// Simple utility to get days for a month
function daysInMonth(year, month) {
  return new Date(year, month+1, 0).getDate()
}

const Calendar3DModal = ({ deptId, deptName, onClose, allowedEmails = null }) => {
  const reservations = getReservationsFor(deptId || deptName, allowedEmails)

  const now = new Date()
  const monthsToShow = 3
  const months = []
  for (let i = 0; i < monthsToShow; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() + i, 1)
    months.push(d)
  }

  const isDateReserved = (y,m,d) => {
    const day = new Date(y, m, d)
    return reservations.some(r => {
      const s = new Date(r.start)
      const e = new Date(r.end)
      // inclusive start, exclusive end
      return day >= s && day < e
    })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="bg-white rounded-lg p-4 max-w-5xl w-full relative transform-gpu perspective-1000">
        <button className="absolute right-3 top-3 text-gray-600" onClick={onClose}>Cerrar</button>
        <h3 className="text-xl font-semibold mb-2">Calendario 3D - {deptName || deptId}</h3>
        <div className="flex gap-6 overflow-x-auto py-2">
          {months.map((mDate, idx) => (
            <div key={idx} className="min-w-[280px] bg-gradient-to-br from-slate-50 to-white p-3 rounded-lg shadow-2xl transform transition-transform hover:rotate-3 hover:scale-105" style={{transformStyle:'preserve-3d'}}>
              <div className="text-center mb-2 font-medium text-black">{mDate.toLocaleString('default', { month: 'long' })} {mDate.getFullYear()}</div>
              <div className="grid grid-cols-7 gap-1 text-xs">
                {['D','L','M','M','J','V','S'].map(h => (<div key={h} className="text-center font-semibold text-black">{h}</div>))}
                {(() => {
                  const firstDay = new Date(mDate.getFullYear(), mDate.getMonth(), 1).getDay()
                  const blanks = (firstDay + 6) % 7 // adjust so Monday=0
                  const total = daysInMonth(mDate.getFullYear(), mDate.getMonth())
                  const cells = []
                  for (let b=0; b<blanks; b++) cells.push(<div key={'b'+b}></div>)
                  for (let d=1; d<=total; d++) {
                    const reserved = isDateReserved(mDate.getFullYear(), mDate.getMonth(), d)
                    cells.push(
                      <div key={d} className={`p-1 rounded text-center ${reserved ? 'bg-red-500 text-white font-semibold' : 'bg-white text-black font-medium'}`}>
                        {d}
                      </div>
                    )
                  }
                  return cells
                })()}
              </div>
            </div>
          ))}
        </div>
        <div className="mt-4 text-sm text-gray-600">Fechas en rojo están reservadas por otros usuarios.</div>
      </div>
    </div>
  )
}

export default Calendar3DModal

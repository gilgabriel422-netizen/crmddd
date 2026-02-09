import React from 'react'

const packages = [
  { id: 1, name: "Río de Janeiro - Búzios", image: "/images/paquetes/RioBuzios.jpeg", price: "Desde $1,299" },
  { id: 2, name: "Panamá - Medellín", image: "/images/paquetes/PanamaMedellin.jpeg", price: "Desde $899" },
  { id: 3, name: "Bogotá Clásico", image: "/images/paquetes/BogotaClasico.jpeg", price: "Desde $699" },
  { id: 7, name: "Galápagos - Santa Cruz", image: "/images/paquetes/GalapagosSantaCruz.jpeg", price: "Desde $1,499" },
]

const SolicitarReservaList = ({ whatsappNumber = '0984707978' }) => {
  const openWhatsApp = (packageName) => {
    const message = `quiero mas informacion hacerca de este paquete: ${packageName}`
    window.open(`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`, '_blank')
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {packages.map((pkg) => (
          <div key={pkg.id} className="card bg-gray-800 p-0 overflow-hidden">
            <div className="h-40 w-full overflow-hidden">
              <img src={pkg.image} alt={pkg.name} className="w-full h-full object-cover" />
            </div>
            <div className="p-4">
              <h3 className="font-bold text-lg mb-1">{pkg.name}</h3>
              <div className="text-sm mb-3">{pkg.price}</div>
              <div className="flex justify-end">
                <button onClick={() => openWhatsApp(pkg.name)} className="btn-primary inline-flex items-center gap-2">
                  Hacer Reserva
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default SolicitarReservaList

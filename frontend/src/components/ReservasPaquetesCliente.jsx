import React from 'react';
import { paquetesInicio, openWhatsAppMasInfo } from '../data/paquetesInicio';

export default function ReservasPaquetesCliente() {
  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Reservas - Paquetes</h2>
      <p className="text-sm text-gray-600 mb-4">Todos los paquetes disponibles. Usa &quot;Más información&quot; para consultar por WhatsApp.</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {paquetesInicio.map((pkg) => (
          <div key={pkg.id} className="bg-white rounded-lg shadow border border-gray-200 overflow-hidden">
            <div className="h-40 bg-gray-100">
              <img src={pkg.image} alt={pkg.name} className="w-full h-full object-cover" />
            </div>
            <div className="p-3">
              <h3 className="font-semibold text-gray-900 truncate">{pkg.name}</h3>
              <p className="text-sm text-gray-600 line-clamp-2 mt-1">{pkg.description}</p>
              <p className="text-sm font-medium text-amber-600 mt-1">{pkg.price}</p>
              <button
                type="button"
                className="mt-2 w-full py-2 px-3 bg-green-600 hover:bg-green-700 text-white rounded text-sm font-medium"
                onClick={() => openWhatsAppMasInfo(pkg.name)}
              >
                Más información
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

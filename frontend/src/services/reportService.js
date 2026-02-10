import axios from 'axios';
import { api } from './api';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const reportService = {
  // Obtener reporte de ventas
  getSalesReport: async (period = 'month') => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await api.get(`/reports/sales?period=${period}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error obteniendo reporte de ventas:', error);
      throw error;
    }
  },

  // Obtener reporte de cobranzas
  getCollectionsReport: async (period = 'month') => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await api.get(`/reports/collections?period=${period}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error obteniendo reporte de cobranzas:', error);
      throw error;
    }
  },

  // Obtener reporte de requerimientos
  getRequirementsReport: async (period = 'month') => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await api.get(`/reports/requirements?period=${period}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error obteniendo reporte de requerimientos:', error);
      throw error;
    }
  },

  // Obtener reporte de reservas
  getBookingsReport: async (period = 'month') => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await api.get(`/reports/bookings?period=${period}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error obteniendo reporte de reservas:', error);
      throw error;
    }
  },

  // Obtener reporte general/dashboard
  getDashboardReport: async (period = 'month') => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await api.get(`/reports/dashboard?period=${period}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error obteniendo reporte general:', error);
      throw error;
    }
  },

  // Obtener resumen de pagos
  getPaymentsSummary: async () => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await api.get('/reports/payments-summary', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error obteniendo resumen de pagos:', error);
      throw error;
    }
  },

  // Obtener sumatorias del último mes
  getLastMonthSummary: async (period = 'this_month') => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await api.get(`/reportes/summary?period=${period}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error obteniendo sumatorias del período:', error);
      // Retornar datos por defecto si falla
      return {
        sales: { total_ventas: 0, total_monto: 0 },
        collections: { total_cobranzas: 0, total_monto: 0 },
        bookings: { total_reservas: 0, total_monto: 0 }
      };
    }
  },

  // Obtener datos del dashboard para empleados
  getEmployeeDashboard: async (period = 'this_month') => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await api.get(`/reports/employee-dashboard?period=${period}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      // Retornar datos con estructura por defecto si no existen
      return response.data?.data || {
        periodSummary: {
          sales: { total_ventas: 0, total_monto: 0, ventas_pagadas: 0, monto_pagado: 0 },
          bookings: { total_reservas: 0, total_monto: 0, confirmadas: 0, canceladas: 0 },
          requirements: { total_requerimientos: 0, completados: 0, pendientes: 0 }
        }
      };
    } catch (error) {
      console.error('Error obteniendo datos del dashboard para empleados:', error);
      // Retornar estructura vacía en caso de error para evitar crash
      return {
        periodSummary: {
          sales: { total_ventas: 0, total_monto: 0, ventas_pagadas: 0, monto_pagado: 0 },
          bookings: { total_reservas: 0, total_monto: 0, confirmadas: 0, canceladas: 0 },
          requirements: { total_requerimientos: 0, completados: 0, pendientes: 0 }
        }
      };
    }
  },

  // Obtener datos del dashboard para cobranzas
  getCobranzasDashboard: async (period = 'this_month') => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await api.get(`/reports/cobranzas-dashboard?period=${period}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      return response.data.data;
    } catch (error) {
      console.error('Error obteniendo datos del dashboard para cobranzas:', error);
      throw error;
    }
  },

  // Obtener reporte detallado de cobranzas
  getCollectionsDetailedReport: async () => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await api.get(`/reports/collections-detailed`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error obteniendo reporte detallado de cobranzas:', error);
      throw error;
    }
  },

  // Obtener reporte completo de cobranzas para exportación
  getCollectionsFullReport: async () => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await api.get(`/reports/collections-full-report`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error obteniendo reporte completo de cobranzas:', error);
      throw error;
    }
  },

  // Obtener historial completo de un cliente (gestiones, pagos, convenios)
  getClientCollectionsHistory: async (clientId, startDate = null, endDate = null) => {
    try {
      const token = localStorage.getItem('authToken');
      let url = `/reports/collections-history/${clientId}`;
      const params = [];
      
      if (startDate) {
        params.push(`startDate=${encodeURIComponent(startDate)}`);
      }
      if (endDate) {
        params.push(`endDate=${encodeURIComponent(endDate)}`);
      }
      
      if (params.length > 0) {
        url += `?${params.join('&')}`;
      }
      
      const response = await api.get(url, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error obteniendo historial del cliente:', error);
      throw error;
    }
  },

  // Funciones de exportación
  exportToCSV: (data, filename) => {
    console.log('📊 exportToCSV llamado con:', { data, filename });
    
    if (!data || data.length === 0) {
      console.warn('No hay datos para exportar');
      return;
    }

    console.log('🔄 Procesando datos para CSV...');
    
    // Convertir datos a CSV
    const headers = Object.keys(data[0]);
    const csvContent = [
      headers.join(','),
      ...data.map(row => 
        headers.map(header => {
          const value = row[header];
          // Escapar comillas y envolver en comillas si contiene comas
          return typeof value === 'string' && value.includes(',') 
            ? `"${value.replace(/"/g, '""')}"` 
            : value;
        }).join(',')
      )
    ].join('\n');

    console.log('📋 Contenido CSV generado:', csvContent);

    // Crear y descargar archivo
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `${filename}_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    console.log('🔗 Descargando archivo CSV...');
    link.click();
    document.body.removeChild(link);
    console.log('✅ Descarga CSV completada');
  },

  exportToExcel: (data, filename) => {
    console.log('📊 exportToExcel llamado con:', { data, filename });
    
    if (!data || data.length === 0) {
      console.warn('No hay datos para exportar');
      return;
    }

    console.log('🔄 Procesando datos para Excel...');

    // Crear HTML table para Excel
    const headers = Object.keys(data[0]);
    const tableHTML = `
      <table>
        <thead>
          <tr>
            ${headers.map(header => `<th>${header}</th>`).join('')}
          </tr>
        </thead>
        <tbody>
          ${data.map(row => 
            `<tr>${headers.map(header => `<td>${row[header] || ''}</td>`).join('')}</tr>`
          ).join('')}
        </tbody>
      </table>
    `;

    console.log('📋 HTML generado:', tableHTML);

    // Crear y descargar archivo Excel
    const blob = new Blob([
      `<html xmlns:o="urn:schemas-microsoft-com:office:office" 
             xmlns:x="urn:schemas-microsoft-com:office:excel" 
             xmlns="http://www.w3.org/TR/REC-html40">
       <head>
         <meta charset="utf-8">
         <meta name="ExcelAuthor" content="Kempery World Travel">
         <meta name="ExcelTitle" content="${filename}">
         <!--[if gte mso 9]>
         <xml>
           <x:ExcelWorkbook>
             <x:ExcelWorksheets>
               <x:ExcelWorksheet>
                 <x:Name>${filename}</x:Name>
                 <x:WorksheetOptions>
                   <x:DefaultRowHeight>285</x:DefaultRowHeight>
                 </x:WorksheetOptions>
               </x:ExcelWorksheet>
             </x:ExcelWorksheets>
           </x:ExcelWorkbook>
         </xml>
         <![endif]-->
       </head>
       <body>${tableHTML}</body>
       </html>`
    ], { type: 'application/vnd.ms-excel' });

    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `${filename}_${new Date().toISOString().split('T')[0]}.xls`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    console.log('🔗 Descargando archivo Excel...');
    link.click();
    document.body.removeChild(link);
    console.log('✅ Descarga Excel completada');
  }
};

export default reportService;




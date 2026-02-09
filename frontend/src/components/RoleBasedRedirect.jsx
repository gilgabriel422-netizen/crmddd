import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import AdminPanelWrapper from "./AdminPanelWrapper";
import EmployeePanel from "../pages/EmployeePanel";
import CobranzasPanel from "../pages/CobranzasPanel_modified";
import ClientePanel from "../pages/ClientePanel";
import ClienteIB1Panel from "../pages/ClienteIB1Panel";
import ClienteIB2Panel from "../pages/ClienteIB2Panel";
import DashboardContratos from "../pages/DashboardContratos";
import DashboardAtencionCliente from "../pages/DashboardAtencionCliente";
import DashboardPostventa from "../pages/DashboardPostventa";

const RoleBasedRedirect = () => {
  const { user } = useAuth();

  // Si no hay usuario, mostrar mensaje de carga
  if (!user) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Redirigir según el rol del usuario
  // El backend CRM usa 'rol' (español), pero también verificamos 'role' (inglés) por compatibilidad
  const userRole = user.rol || user.role;

  console.log("🔍 Usuario actual:", user);
  console.log("🔍 Rol detectado:", userRole);

  switch (userRole) {
    case "admin":
      return <AdminPanelWrapper />;
    case "cobranza":
    case "cobranzas":
      return <CobranzasPanel />;
    case "employee":
    case "agent":
    case "vendedor":
    case "soporte":
      return <EmployeePanel />;
    case "cliente":
    case "gold": // Cliente categoría Gold
      return <ClientePanel />;
    case "clienteIB1":
    case "cliente_ib1":
    case "cliente-ib1":
    case "blue": // Cliente categoría Blue
      return <ClienteIB1Panel />;
    case "clienteIB2":
    case "cliente_ib2":
    case "cliente-ib2":
    case "black": // Cliente categoría Black
      return <ClienteIB2Panel />;
    case "contratos":
    case "contrato":
      return <DashboardContratos />;
    case "atencion":
    case "atención":
      return <DashboardAtencionCliente />;
    case "postventa":
      return <DashboardPostventa />;
    default:
      return (
        <div className="min-h-screen bg-gray-100 flex items-center justify-center">
          <div className="bg-white p-8 rounded-lg shadow-lg text-center max-w-md">
            <h2 className="text-2xl font-bold text-red-600 mb-4">
              Rol No Reconocido
            </h2>
            <p className="text-gray-600 mb-4">
              Tu rol de usuario no está configurado correctamente.
            </p>
            <p className="text-sm text-gray-500 mb-2">
              Rol recibido: <strong>{userRole || "undefined"}</strong>
            </p>
            <details className="text-left mt-4">
              <summary className="cursor-pointer text-blue-600 hover:text-blue-800">
                Ver detalles del usuario
              </summary>
              <pre className="mt-2 p-2 bg-gray-100 rounded text-xs overflow-auto">
                {JSON.stringify(user, null, 2)}
              </pre>
            </details>
          </div>
        </div>
      );
  }
};

export default RoleBasedRedirect;

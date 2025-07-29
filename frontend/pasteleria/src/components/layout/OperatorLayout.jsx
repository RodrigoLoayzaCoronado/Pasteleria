import React, { useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { Link, Outlet } from 'react-router-dom';

const OperatorLayout = () => {
  const { user, sucursal, logout } = useContext(AuthContext);

  return (
    <div className="min-h-screen bg-crema flex">
      {/* Sidebar */}
      <div className="w-64 bg-pink-principal text-white p-4 fixed h-full">
        <h2 className="text-xl font-bold mb-6">Panel de Operador</h2>
        <nav className="space-y-2">
          <Link to="/operador/clientes" className="block p-2 hover:bg-marron-chocolate rounded">
            Buscar Clientes
          </Link>
          <Link to="/operador/clientes/nuevo" className="block p-2 hover:bg-marron-chocolate rounded">
            Crear Cliente
          </Link>
          <Link to="/operador/cotizaciones/nueva" className="block p-2 hover:bg-marron-chocolate rounded">
            Nueva Cotización
          </Link>
        </nav>
      </div>
      {/* Main Content */}
      <div className="flex-1 ml-64 p-6">
        {/* Top Bar */}
        <div className="bg-white p-4 shadow-md flex justify-between items-center">
          <h1 className="text-xl font-semibold text-marron-chocolate">
            Pastelería Dulce Tentación
          </h1>
          <div className="flex items-center space-x-4">
            <span className="text-marron-chocolate">
              {user?.nombre} ({user?.rol}) - {sucursal || 'Cargando...'}
            </span>
            <button
              onClick={logout}
              className="bg-marron-chocolate text-white py-1 px-3 rounded-md hover:bg-pink-principal"
            >
              Cerrar Sesión
            </button>
          </div>
        </div>
        {/* Content */}
        <div className="mt-6">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default OperatorLayout;
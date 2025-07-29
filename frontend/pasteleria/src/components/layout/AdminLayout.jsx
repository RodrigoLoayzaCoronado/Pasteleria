import React, { useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { Link, Outlet } from 'react-router-dom';

const AdminLayout = () => {
  const { user, sucursal, logout } = useContext(AuthContext);

  return (
    <div className="min-h-screen bg-crema flex">
      {/* Sidebar */}
      <div className="w-64 bg-pink-principal text-white p-4 fixed h-full">
        <h2 className="text-xl font-bold mb-6">Panel de Administrador</h2>
        <nav className="space-y-2">
          <Link to="/admin/dashboard" className="block p-2 hover:bg-marron-chocolate rounded">
            Dashboard
          </Link>
          <Link to="/admin/cotizaciones" className="block p-2 hover:bg-marron-chocolate rounded">
            Cotizaciones
          </Link>
          <Link to="/admin/usuarios" className="block p-2 hover:bg-marron-chocolate rounded">
            Usuarios
          </Link>
          <Link to="/admin/sucursales" className="block p-2 hover:bg-marron-chocolate rounded">
            Sucursales
          </Link>
          <Link to="/admin/productos" className="block p-2 hover:bg-marron-chocolate rounded">
            Productos
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

export default AdminLayout;
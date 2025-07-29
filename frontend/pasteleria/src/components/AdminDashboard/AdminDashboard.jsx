import React, { useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';

const AdminDashboard = () => {
  const { user, sucursal } = useContext(AuthContext);

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold text-pink-principal mb-4">
        Bienvenido, {user?.nombre}
      </h2>
      <p className="text-marron-chocolate">
        Estás en la sucursal {sucursal || 'N/A'}. Desde aquí puedes gestionar usuarios, sucursales, productos y ver todas las cotizaciones.
      </p>
      {/* Placeholder para estadísticas o contenido */}
    </div>
  );
};

export default AdminDashboard;
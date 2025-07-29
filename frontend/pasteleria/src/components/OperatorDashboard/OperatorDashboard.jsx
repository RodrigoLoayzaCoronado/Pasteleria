import React, { useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import ClientSearch from './ClientSearch';

const OperatorDashboard = () => {
  const { user, sucursal } = useContext(AuthContext);

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold text-pink-principal mb-4">
        Bienvenido, {user?.nombre}
      </h2>
      <p className="text-marron-chocolate mb-4">
        Estás en la sucursal {sucursal || 'N/A'}. Busca o crea clientes para comenzar una cotización.
      </p>
      <ClientSearch />
    </div>
  );
};

export default OperatorDashboard;
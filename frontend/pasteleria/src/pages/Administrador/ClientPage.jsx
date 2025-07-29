import React, { useState, useEffect } from 'react';
import axios from 'axios';
import DataTable from '../../components/DataTable';

const ClientPage = () => {
  const [clients, setClients] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchClients = async () => {
      try {
        const response = await axios.get('http://localhost:3000/api/clientes/listar', {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        });
        setClients(response.data);
      } catch (err) {
        setError('Error al cargar los clientes');
      } finally {
        setLoading(false);
      }
    };
    fetchClients();
  }, []);

  const handleCreateClient = async (newClient) => {
    try {
      const response = await axios.post('http://localhost:3000/api/clientes/crear', newClient, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      setClients([...clients, response.data]);
    } catch (err) {
      setError('Error al crear el cliente');
    }
  };

  const columns = [
    { header: 'ID', accessor: 'id' },
    { header: 'Nombre', accessor: 'nombre' },
    { header: 'Teléfono', accessor: 'telefono' },
    { header: 'Acciones', accessor: 'actions', render: (client) => (
      <button className="text-red-500 hover:text-red-700">Suspender</button>
    ) },
  ];

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold text-marron-chocolate mb-4">Gestión de Clientes</h1>
      {error && <p className="text-red-500">{error}</p>}
      {loading ? (
        <p>Cargando...</p>
      ) : (
        <DataTable columns={columns} data={clients} />
      )}
      <div className="mt-6">
        <h2 className="text-lg font-semibold text-marron-chocolate mb-2">Crear Cliente</h2>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            const nombre = e.target.nombre.value;
            const telefono = e.target.telefono.value;
            handleCreateClient({ nombre, telefono });
            e.target.reset();
          }}
          className="space-y-4"
        >
          <input
            type="text"
            name="nombre"
            placeholder="Nombre"
            className="w-full px-4 py-2 rounded-xl border-2 border-beige focus:border-pink-principal"
            required
          />
          <input
            type="text"
            name="telefono"
            placeholder="Teléfono"
            className="w-full px-4 py-2 rounded-xl border-2 border-beige focus:border-pink-principal"
          />
          <button
            type="submit"
            className="w-full py-2 px-4 rounded-xl bg-gradient-to-r from-pink-principal to-marron-chocolate text-white hover:shadow-xl"
          >
            Crear
          </button>
        </form>
      </div>
    </div>
  );
};

export default ClientPage;
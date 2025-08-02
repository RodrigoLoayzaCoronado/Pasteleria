import { useState, useContext } from 'react';
import { 
  fetchClientes, 
  createCliente, 
  updateCliente, 
  suspendCliente,
  activeCliente as activeClienteAPI,
  searchClientes,
  deleteCliente

} from '../api/clientes';
import { AuthContext } from '../context/AuthContext';

export const useClientes = () => {
  const { token } = useContext(AuthContext);
  const [clientes, setClientes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const getClientes = async () => {
    setLoading(true);
    try {
      const data = await fetchClientes(token);
      setClientes(data);
    } catch (err) {
      setError(err.response?.data?.message || 'Error al cargar clientes');
    } finally {
      setLoading(false);
    }
  };

  const addCliente = async (clienteData) => {
    try {
      const newCliente = await createCliente(clienteData, token);
      setClientes(prev => [...prev, newCliente]);
      return { success: true };
    } catch (err) {
      setError(err.response?.data?.message || 'Error al crear cliente');
      return { success: false };
    }
  };

  const editCliente = async (id, clienteData) => {
    try {
      const updatedCliente = await updateCliente(id, clienteData, token);
      setClientes(prev => 
        prev.map(cliente => 
          cliente.id === id ? updatedCliente : cliente
        )
      );
      return { success: true };
    } catch (err) {
      setError(err.response?.data?.message || 'Error al actualizar cliente');
      return { success: false };
    }
  };

  // En useClientes.js
const suspenderCliente = async (id) => {
  try {
    // Aquí, updatedCliente será el objeto cliente completo que viene del backend
    const updatedCliente = await suspendCliente(id, token); 
    setClientes(prev => 
      prev.map(cliente => 
        // Si el ID coincide, reemplaza el cliente antiguo con el nuevo objeto actualizado
        cliente.id === id ? updatedCliente : cliente 
      )
    );
    return { success: true, updatedCliente }; // Podrías devolver el cliente actualizado si lo necesitas
  } catch (err) {
    setError(err.response?.data?.message || 'Error al suspender cliente');
    return { success: false };
  }
};

const activeCliente = async (id) => {
    try {
        const updatedCliente = await activeClienteAPI(id, token); // Aquí el nombre es importante
        // Valida que updatedCliente sea un objeto y tenga un id
        if (updatedCliente && updatedCliente.id) {
            setClientes(prev =>
                prev.map(cliente =>
                    cliente.id === id ? updatedCliente : cliente
                )
            );
            return { success: true, updatedCliente };
        } else {
            // Esto capturaría si la API devuelve un mensaje en lugar del objeto esperado
            setError('Respuesta inesperada al activar cliente');
            return { success: false };
        }
    } catch (err) {
        setError(err.response?.data?.message || 'Error al activar cliente');
        return { success: false };
    }
};

  const buscarClientes = async (query) => {
    try {
      const results = await searchClientes(query, token);
      return results;
    } catch (err) {
      setError(err.response?.data?.message || 'Error al buscar clientes');
      return [];
    }
  };
  const eliminarCliente = async (id) => {
    try {
      await deleteCliente(id, token);
      setClientes(prev => prev.filter(cliente => cliente.id !== id));
      return { success: true };
    } catch (err) {
      setError(err.response?.data?.message || 'Error al eliminar cliente');
      return { success: false };
    }
  };

  return {
    clientes,
    loading,
    error,
    getClientes,
    addCliente,
    editCliente,
    suspenderCliente,
    activeCliente,
    buscarClientes,
    eliminarCliente
  };
};
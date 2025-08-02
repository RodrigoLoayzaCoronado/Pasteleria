import axios from 'axios';
const API_BASE_URL = 'http://localhost:3000/api';

export const fetchClientes = async (token) => {
  const response = await axios.get(`${API_BASE_URL}/clientes/listar`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
};

export const createCliente = async (clienteData, token) => {
  const response = await axios.post(`${API_BASE_URL}/clientes/crear`, clienteData, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
};

export const updateCliente = async (id, clienteData, token) => {
  const response = await axios.put(`${API_BASE_URL}/clientes/actualizar/${id}`, clienteData, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
};

export const suspendCliente = async (id, token) => {
    try {
        const response = await axios.put(`${API_BASE_URL}/clientes/suspender/${id}`, {}, { // El segundo argumento {} es el body, puede ser vacío para PUT
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });
        return response.data; // Axios ya devuelve response.data directamente
    } catch (error) {
        // Axios lanza el error en 'error.response' para errores HTTP
        throw new Error(error.response?.data?.mensaje || 'Error al suspender cliente');
    }
};

// ***** CAMBIOS AQUÍ para activeCliente *****
export const activeCliente = async (id, token) => {
    try {
        const response = await axios.put(`${API_BASE_URL}/clientes/activar/${id}`, {}, { // El segundo argumento {} es el body, puede ser vacío para PUT
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });
        return response.data; // Axios ya devuelve response.data directamente
    } catch (error) {
        // Axios lanza el error en 'error.response' para errores HTTP
        throw new Error(error.response?.data?.mensaje || 'Error al activar cliente');
    }
};

export const searchClientes = async (query, token) => {
  const response = await axios.get(`${API_BASE_URL}/clientes/buscar?q=${query}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
};

export const deleteCliente = async (id, token) => {
  const response = await axios.delete(`${API_BASE_URL}/clientes/eliminar/${id}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
};
//solo falta implementar el buscar cliente por id en el frontend

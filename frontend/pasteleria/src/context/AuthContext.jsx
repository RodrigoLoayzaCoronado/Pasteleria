import React, { createContext, useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

export const AuthContext = createContext();

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [sucursal, setSucursal] = useState(null); // Almacenará el nombre de la sucursal
  const navigate = useNavigate();

  // Función para establecer el token de autorización en Axios
  const setAuthHeader = useCallback((authToken) => {
    if (authToken) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${authToken}`;
    } else {
      delete axios.defaults.headers.common['Authorization'];
    }
  }, []);

  // Función para iniciar sesión
  const login = async (newToken, userData) => {
    setToken(newToken);
    setUser(userData);
    localStorage.setItem('token', newToken);
    localStorage.setItem('user', JSON.stringify(userData));
    setAuthHeader(newToken); // Configurar el header de Axios inmediatamente

    // Intentar obtener nombre de la sucursal SOLO SI id_sucursal existe y es válido
    if (userData && userData.id_sucursal) {
      try {
        const response = await axios.get(`http://localhost:3000/api/sucursales/${userData.id_sucursal}`, {
          headers: { Authorization: `Bearer ${newToken}` }, // Asegurarse de usar el newToken aquí
        });
        setSucursal(response.data.nombre);
        localStorage.setItem('sucursal', response.data.nombre);
      } catch (err) {
        console.error('Error obteniendo sucursal:', err);
        // Fallback: Si la sucursal no se puede obtener, puedes mostrar un mensaje genérico
        setSucursal(`Sucursal ID: ${userData.id_sucursal} (Error al cargar)`);
        localStorage.removeItem('sucursal'); // Limpiar si hubo un error
      }
    } else {
      // Si no hay id_sucursal, establecer sucursal a null y limpiar localStorage
      console.warn('Usuario logueado sin id_sucursal. No se intentará cargar la sucursal.');
      setSucursal(null);
      localStorage.removeItem('sucursal');
    }
  };

  // Función para cerrar sesión
  const logout = useCallback(async () => {
    try {
      // Intentar invalidar el token en el backend si existe un token
      if (token) {
        await axios.post(
          'http://localhost:3000/api/auth/logout',
          {},
          { headers: { Authorization: `Bearer ${token}` } }
        );
      }
    } catch (err) {
      console.error('Error al cerrar sesión en el backend:', err);
      // No bloquear el logout del frontend si el backend falla
    } finally {
      setToken(null);
      setUser(null);
      setSucursal(null);
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('sucursal');
      setAuthHeader(null); // Limpiar el header de Axios
      navigate('/login');
    }
  }, [token, navigate, setAuthHeader]); // Dependencias para useCallback

  // Efecto para cargar el usuario y la sucursal al inicio o cuando el token cambia
  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');

    if (storedToken && storedUser) {
      const parsedUser = JSON.parse(storedUser);
      setToken(storedToken);
      setUser(parsedUser);
      setAuthHeader(storedToken); // Configurar el header de Axios al cargar

      // Re-fetch sucursal info on load if id_sucursal is present in stored user
      const fetchSucursalOnLoad = async () => {
        if (parsedUser && parsedUser.id_sucursal) {
          try {
            const response = await axios.get(`http://localhost:3000/api/sucursales/${parsedUser.id_sucursal}`, {
              headers: { Authorization: `Bearer ${storedToken}` },
            });
            setSucursal(response.data.nombre);
            localStorage.setItem('sucursal', response.data.nombre);
          } catch (err) {
            console.error('Error obteniendo sucursal al cargar desde localStorage:', err);
            setSucursal(`Sucursal ID: ${parsedUser.id_sucursal} (Error al cargar)`);
            localStorage.removeItem('sucursal'); // Limpiar si hubo un error
          }
        } else {
          setSucursal(null); // No sucursal ID, so no sucursal info
          localStorage.removeItem('sucursal');
        }
      };
      fetchSucursalOnLoad();
    } else {
      // Si no hay token o usuario almacenado, asegurar que todo esté limpio
      setToken(null);
      setUser(null);
      setSucursal(null);
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('sucursal');
      setAuthHeader(null);
    }
  }, [setAuthHeader]); // Dependencia: setAuthHeader para que se re-ejecute si cambia (aunque es useCallback)

  return (
    <AuthContext.Provider value={{ user, token, sucursal, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;

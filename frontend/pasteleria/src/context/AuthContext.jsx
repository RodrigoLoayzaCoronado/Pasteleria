import React, { createContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

export const AuthContext = createContext();

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [sucursal, setSucursal] = useState(null);
  const navigate = useNavigate();

  const login = async (token, usuario) => {
    setToken(token);
    setUser(usuario);
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(usuario));

    // Intentar obtener nombre de la sucursal
    try {
      const response = await axios.get(`http://localhost:3000/api/sucursales/${usuario.id_sucursal}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSucursal(response.data.nombre);
      localStorage.setItem('sucursal', response.data.nombre);
    } catch (err) {
      console.error('Error obteniendo sucursal:', err);
      setSucursal(`Sucursal ${usuario.id_sucursal}`);
    }
  };

  const logout = async () => {
    try {
      await axios.post(
        'http://localhost:3000/api/auth/logout',
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
    } catch (err) {
      console.error('Error al cerrar sesión:', err);
    }
    setToken(null);
    setUser(null);
    setSucursal(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('sucursal');
    navigate('/login');
  };

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    const storedSucursal = localStorage.getItem('sucursal');
    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
      setSucursal(storedSucursal);
    }
  }, []);

  return (
    <AuthContext.Provider value={{ user, token, sucursal, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
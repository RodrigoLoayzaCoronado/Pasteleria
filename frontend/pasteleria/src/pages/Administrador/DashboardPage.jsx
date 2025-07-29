// src/pages/DashboardPage.jsx
import React from 'react';
import authService from '../../services/authService'; // Necesitamos el servicio para cerrar sesión
import { useNavigate } from 'react-router-dom';

function DashboardPage() {
  const navigate = useNavigate();
  const currentUser = authService.getCurrentUser(); // Obtenemos el usuario actual

  const handleLogout = () => {
    authService.logout(); // Llamamos a la función de logout
    navigate('/LoginPage'); // Redirigimos al usuario a la página de login
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 to-green-200 flex flex-col items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-xl text-center">
        <h1 className="text-4xl font-bold text-gray-800 mb-4">
          ¡Bienvenido al Dashboard Administrador!
        </h1>
        {currentUser && (
          <p className="text-lg text-gray-600 mb-6">
            Hola, <span className="font-semibold text-blue-600">{currentUser.usuario.nombre}</span> (Rol: <span className="font-semibold text-blue-600">{currentUser.usuario.rol}</span>).
          </p>
        )}
        <p className="text-md text-gray-700 mb-8">
          Aquí podrás ver toda la información importante de tu aplicación.
        </p>
        <button
          onClick={handleLogout}
          className="bg-red-500 text-white font-bold py-2 px-6 rounded-lg hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-opacity-50 transition ease-in-out duration-150"
        >
          Cerrar Sesión
        </button>
      </div>
    </div>
  );
}

export default DashboardPage;
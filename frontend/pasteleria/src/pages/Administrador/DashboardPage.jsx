// src/pages/DashboardPage.jsx
import React, { useContext } from 'react'; // Importar useContext
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext'; // Importar AuthContext

function DashboardPage() {
  const navigate = useNavigate();
  // Obtener user, logout y sucursal del contexto
  const { user, logout, sucursal } = useContext(AuthContext);

  const handleLogout = () => {
    logout(); // Llamamos a la función de logout del contexto
    // La función logout en AuthContext ya maneja la navegación a '/login',
    // por lo que 'navigate('/login');' aquí sería redundante.
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 to-green-200 flex flex-col items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-xl text-center">
        <h1 className="text-4xl font-bold text-gray-800 mb-4">
          ¡Bienvenido al Dashboard PAGE!
        </h1>
        {user && (
          <p className="text-lg text-gray-600 mb-6">
            Hola, <span className="font-semibold text-blue-600">{user.nombre}</span> (Rol: <span className="font-semibold text-blue-600">{user.rol}</span>).
          </p>
        )}
        {sucursal && ( // Mostrar información de la sucursal si está disponible
          <p className="text-md text-gray-700 mb-6">
            Sucursal: <span className="font-semibold text-blue-600">{sucursal}</span>.
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

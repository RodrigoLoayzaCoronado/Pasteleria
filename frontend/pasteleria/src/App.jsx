import React, {useContext} from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthContext } from './context/AuthContext';
import AdminLayout from './layouts/AdminLayout';
import OperatorLayout from './layouts/OperatorLayout';
import LoginPage from './pages/auth/LoginPage';
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage';
import ResetPasswordPage from './pages/auth/ResetPasswordPage';
import ClientPage from './pages/Administrador/ClientPage';
import DashboardPage from './pages/Administrador/DashboardPage';

// Componente para proteger rutas
const ProtectedRoute = ({ children, requiredRole }) => {
  const { user } = useContext(AuthContext);

  if (!user) return <Navigate to="/login" replace />;
  if (requiredRole && user.rol !== requiredRole) {
    return <Navigate to="/" replace />;
  }
  return children;
};

const App = () => {
  return (
    <Routes>
      {/* Páginas públicas (sin layout) */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />

      {/* Rutas de administrador */}
      <Route
        path="/admin/*"
        element={
          <ProtectedRoute requiredRole="administrador">
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route path="clientes" element={<ClientPage />} />
        <Route path="dashboard" element={<DashboardPage />} />
      </Route>

      {/* Rutas de operador */}
      <Route
        path="/operador/*"
        element={
          <ProtectedRoute requiredRole="operador">
            <OperatorLayout />
          </ProtectedRoute>
        }
      />

      {/* Ruta raíz redirige a login */}
      <Route path="/" element={<Navigate to="/login" replace />} />
    </Routes>
  );
};

export default App;

// modulo de clientes casi completo, falta que tambien se puedan ibservar los susperndidos, falta los botones para editar, eliminar clientes
//falta que el search funcione bien, y que se pueda buscar por nombre o telefono
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import AdminPage from './pages/Administrador/AdminPage';
import OperatorPage from './pages/Operador/DashboardOperador';
import ClientPage from './pages/Administrador/ClientPage';

const App = () => {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />
      <Route path="/admin/*" element={<AdminPage />}>
        <Route path="clientes" element={<ClientPage />} />
        <Route path="dashboard" element={<div>Dashboard (Placeholder)</div>} />
      </Route>
      <Route path="/operador/*" element={<OperatorPage />} />
      <Route path="/" element={<LoginPage />} />
    </Routes>
  );
};

export default App;
import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../../components/Sidebar';
import AdminDashboard from '../../components/AdminDashboard/AdminDashboard';
import ClientPage from './ClientPage';
const AdminPage = () => {
  return (
    <div className="min-h-screen flex p-4">
      <Sidebar />
      <div className="flex-1 ml-4">
        <AdminDashboard />
        <ClientPage />
        {/* Aquí se renderizarán las rutas hijas */}
        <Outlet />
      </div>
    </div>
  );
};

export default AdminPage;
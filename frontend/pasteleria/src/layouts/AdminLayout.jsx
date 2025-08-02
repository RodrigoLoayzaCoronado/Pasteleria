import { Outlet } from 'react-router-dom';
import AdminSidebar from '../components/Sidebar';

const AdminLayout = () => {
  return (
    <div className="flex h-screen">
      <AdminSidebar />
      <div className="flex-1 overflow-auto p-6">
        <Outlet /> {/* Aquí se renderizan las páginas de admin */}
      </div>
    </div>
  );
};

export default AdminLayout;
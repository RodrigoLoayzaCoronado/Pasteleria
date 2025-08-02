import { Outlet } from 'react-router-dom';
import OperatorSidebar from '../components/Sidebar';

const OperatorLayout = () => {
  return (
    <div className="flex h-screen">
      <OperatorSidebar /> {/* Sidebar con menos opciones */}
      <div className="flex-1 overflow-auto p-6">
        <Outlet /> {/* Páginas de operador */}
      </div>
    </div>
  );
};

export default OperatorLayout;
import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Users, FileText } from 'lucide-react';

const Sidebar = () => {
  const navItems = [
    { path: '/admin/dashboard', icon: <LayoutDashboard className="w-5 h-5" />, label: 'Dashboard' },
    { path: '/admin/clientes', icon: <Users className="w-5 h-5" />, label: 'Clientes' },
    // Añadir más items según necesidades
  ];

  return (
    <div className="w-64 bg-white bg-opacity-95 backdrop-blur-sm p-4 rounded-2xl shadow-2xl border border-dorado h-full">
      <h2 className="text-xl font-bold text-pink-principal mb-6">Menú</h2>
      <nav className="space-y-2">
        {navItems.map((item, index) => (
          <NavLink
            key={index}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center gap-2 px-4 py-2 rounded-xl transition-all duration-200 ${
                isActive
                  ? 'bg-gradient-to-r from-pink-principal to-marron-chocolate text-white'
                  : 'text-marron-chocolate hover:bg-beige'
              }`
            }
          >
            {item.icon}
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>
    </div>
  );
};

export default Sidebar;
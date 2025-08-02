import { Users, UserCheck, UserX, TrendingUp } from 'lucide-react';

const StatCard = ({ title, value, icon: Icon, color, trend }) => {
  const colorClasses = {
    blue: 'bg-blue-50 border-blue-200 text-blue-600',
    green: 'bg-green-50 border-green-200 text-green-600',
    red: 'bg-red-50 border-red-200 text-red-600',
    purple: 'bg-purple-50 border-purple-200 text-purple-600'
  };

  const valueColorClasses = {
    blue: 'text-blue-900',
    green: 'text-green-900',
    red: 'text-red-900',
    purple: 'text-purple-900'
  };

  return (
    <div className={`border rounded-xl p-6 ${colorClasses[color]} transition-all hover:shadow-md`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium opacity-75">{title}</p>
          <p className={`text-3xl font-bold mt-2 ${valueColorClasses[color]}`}>
            {value}
          </p>
          {trend && (
            <div className="flex items-center mt-2 text-xs opacity-75">
              <TrendingUp className="w-3 h-3 mr-1" />
              <span>{trend}</span>
            </div>
          )}
        </div>
        <div className="flex items-center justify-center w-12 h-12 bg-white bg-opacity-50 rounded-lg">
          <Icon className="w-6 h-6" />
        </div>
      </div>
    </div>
  );
};

const ClientStats = ({ clientes = [] }) => {
  const totalClientes = clientes.length;
  const clientesActivos = clientes.filter(c => c && c.activo !== false).length;
  const clientesSuspendidos = clientes.filter(c => c && c.activo === false).length;
  const porcentajeActivos = totalClientes > 0 ? Math.round((clientesActivos / totalClientes) * 100) : 0;

  return (
    <div className="mb-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Clientes"
          value={totalClientes}
          icon={Users}
          color="blue"
        />
        
        <StatCard
          title="Clientes Activos"
          value={clientesActivos}
          icon={UserCheck}
          color="green"
          trend={`${porcentajeActivos}% del total`}
        />
        
        <StatCard
          title="Clientes Suspendidos"
          value={clientesSuspendidos}
          icon={UserX}
          color="red"
        />
        
        <StatCard
          title="Tasa de Actividad"
          value={`${porcentajeActivos}%`}
          icon={TrendingUp}
          color="purple"
        />
      </div>
    </div>
  );
};

export default ClientStats;
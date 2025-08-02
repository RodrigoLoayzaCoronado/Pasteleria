import { Edit, Pause, Play, Trash2, Phone, User } from 'lucide-react';
import DataTable from '../../components/ui/DataTable';
import Button from '../../components/ui/Button';

const StatusBadge = ({ activo }) => {
  if (activo !== false) {
    return (
      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-200">
        <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
        Activo
      </span>
    );
  }
  
  return (
    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800 border border-red-200">
      <div className="w-2 h-2 bg-red-500 rounded-full mr-2"></div>
      Suspendido
    </span>
  );
};

const ActionButton = ({ 
  onClick, 
  icon: Icon, 
  variant = 'outline', 
  size = 'sm', 
  className = '',
  children,
  disabled = false
}) => {
  return (
    <Button
      variant={variant}
      size={size}
      onClick={onClick}
      disabled={disabled}
      className={`flex items-center space-x-1 transition-all hover:scale-105 ${className}`}
    >
      <Icon className="w-4 h-4" />
      <span className="hidden sm:inline">{children}</span>
    </Button>
  );
};

const ClientRow = ({ cliente, onEdit, onSuspend, onActivate, onDelete }) => {
  if (!cliente) return null;

  return (
    <tr className="hover:bg-gray-50 transition-colors">
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center space-x-3">
          <div className="flex items-center justify-center w-10 h-10 bg-blue-100 rounded-full">
            <User className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <div className="text-sm font-medium text-gray-900">#{cliente.id}</div>
          </div>
        </div>
      </td>
      
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-sm font-medium text-gray-900">{cliente.nombre}</div>
      </td>
      
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center space-x-2 text-sm text-gray-600">
          <Phone className="w-4 h-4" />
          <span>{cliente.telefono}</span>
        </div>
      </td>
      
      <td className="px-6 py-4 whitespace-nowrap">
        <StatusBadge activo={cliente.activo} />
      </td>
      
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center space-x-2">
          <ActionButton
            onClick={() => onEdit(cliente)}
            icon={Edit}
            className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
          >
            Editar
          </ActionButton>
          
          {cliente.activo !== false ? (
            <ActionButton
              onClick={() => onSuspend(cliente)}
              icon={Pause}
              className="text-orange-600 hover:text-orange-700 hover:bg-orange-50"
            >
              Suspender
            </ActionButton>
          ) : (
            <ActionButton
              onClick={() => onActivate(cliente)}
              icon={Play}
              className="text-green-600 hover:text-green-700 hover:bg-green-50"
            >
              Activar
            </ActionButton>
          )}
          
          <ActionButton
            onClick={() => onDelete(cliente)}
            icon={Trash2}
            className="text-red-600 hover:text-red-700 hover:bg-red-50"
          >
            Eliminar
          </ActionButton>
        </div>
      </td>
    </tr>
  );
};

const ClientTable = ({ 
  clientes, 
  loading, 
  searchQuery, 
  onEdit, 
  onSuspend, 
  onActivate, 
  onDelete 
}) => {
  const columns = [
    {
      key: 'id',
      header: 'ID',
      sortable: true
    },
    {
      key: 'nombre',
      header: 'Nombre',
      sortable: true
    },
    {
      key: 'telefono',
      header: 'Teléfono',
      sortable: false
    },
    {
      key: 'activo',
      header: 'Estado',
      sortable: true,
      render: (value, cliente) => <StatusBadge activo={cliente?.activo} />
    },
    {
      key: 'acciones',
      header: 'Acciones',
      sortable: false,
      render: (_, cliente) => (
        <div className="flex items-center space-x-2">
          <ActionButton
            onClick={() => onEdit(cliente)}
            icon={Edit}
            className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
          >
            Editar
          </ActionButton>
          
          {cliente?.activo !== false ? (
            <ActionButton
              onClick={() => onSuspend(cliente)}
              icon={Pause}
              className="text-orange-600 hover:text-orange-700 hover:bg-orange-50"
            >
              Suspender
            </ActionButton>
          ) : (
            <ActionButton
              onClick={() => onActivate(cliente)}
              icon={Play}
              className="text-green-600 hover:text-green-700 hover:bg-green-50"
            >
              Activar
            </ActionButton>
          )}
          
          <ActionButton
            onClick={() => onDelete(cliente)}
            icon={Trash2}
            className="text-red-600 hover:text-red-700 hover:bg-red-50"
          >
            Eliminar
          </ActionButton>
        </div>
      )
    }
  ];

  const emptyMessage = searchQuery.trim()
    ? "No se encontraron clientes que coincidan con la búsqueda"
    : "No hay clientes registrados";

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900">Lista de Clientes</h3>
        <p className="text-sm text-gray-600 mt-1">
          {clientes.length} cliente{clientes.length !== 1 ? 's' : ''} 
          {searchQuery && ` encontrado${clientes.length !== 1 ? 's' : ''}`}
        </p>
      </div>
      
      <DataTable
        data={clientes}
        columns={columns}
        loading={loading}
        emptyMessage={emptyMessage}
        className="border-0"
      />
    </div>
  );
};

export default ClientTable;
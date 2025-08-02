import { Users, Plus } from 'lucide-react';
import Button from '../../components/ui/Button';

const ClientHeader = ({ onCreateClick }) => {
  return (
    <div className="mb-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-lg">
            <Users className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Gestión de Clientes
            </h1>
            <p className="text-gray-600 mt-1">
              Administra y gestiona todos tus clientes desde un solo lugar
            </p>
          </div>
        </div>
        
        <Button 
          onClick={onCreateClick}
          className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors shadow-sm"
        >
          <Plus className="w-5 h-5" />
          <span>Nuevo Cliente</span>
        </Button>
      </div>
    </div>
  );
};

export default ClientHeader;
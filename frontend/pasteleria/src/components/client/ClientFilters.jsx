import { Search, Filter, Eye, EyeOff } from 'lucide-react';
import SearchInput from '../../components/ui/SearchInput';

const ClientFilters = ({ 
  searchQuery, 
  onSearch, 
  verTodos, 
  onToggleVerTodos 
}) => {
  return (
    <div className="mb-8">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
          {/* Búsqueda */}
          <div className="flex-1 max-w-md">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <SearchInput
                placeholder="Buscar por nombre o teléfono..."
                onSearch={onSearch}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
            </div>
          </div>
          
          {/* Filtros */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 bg-gray-50 rounded-lg p-2">
              <Filter className="w-4 h-4 text-gray-500" />
              <span className="text-sm font-medium text-gray-700">Filtros:</span>
            </div>
            
            <label className="flex items-center space-x-3 cursor-pointer group">
              <div className="relative">
                <input
                  type="checkbox"
                  checked={verTodos}
                  onChange={(e) => onToggleVerTodos(e.target.checked)}
                  className="sr-only"
                />
                <div className={`flex items-center justify-center w-12 h-6 rounded-full transition-colors ${
                  verTodos ? 'bg-blue-600' : 'bg-gray-300'
                }`}>
                  <div className={`w-4 h-4 bg-white rounded-full shadow-sm transform transition-transform ${
                    verTodos ? 'translate-x-3' : '-translate-x-3'
                  }`} />
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                {verTodos ? (
                  <Eye className="w-4 h-4 text-blue-600" />
                ) : (
                  <EyeOff className="w-4 h-4 text-gray-500" />
                )}
                <span className={`text-sm font-medium transition-colors ${
                  verTodos ? 'text-blue-600' : 'text-gray-700'
                }`}>
                  {verTodos ? 'Mostrando todos' : 'Solo activos'}
                </span>
              </div>
            </label>
          </div>
        </div>
        
        {/* Indicador de búsqueda activa */}
        {searchQuery && (
          <div className="mt-4 flex items-center space-x-2 text-sm text-blue-600 bg-blue-50 rounded-lg p-2">
            <Search className="w-4 h-4" />
            <span>Buscando por: <strong>"{searchQuery}"</strong></span>
          </div>
        )}
      </div>
    </div>
  );
};

export default ClientFilters;
import { useEffect, useState } from 'react';
import { useClientes } from '../../hooks/useClientes';
import ClientHeader from '../../components/client/ClientHeader';
import ClientStats from '../../components/client/ClientState';
import ClientFilters from '../../components/client/ClientFilters';
import ClientTable from '../../components/client/ClientTables';
import ClientModal from '../../components/client/ClientModal';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import Toast from '../../components/ui/Toast';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import ErrorState from '../../components/ui/ErrorState';

const ClientPage = () => {
  const {
    clientes,
    loading,
    error,
    getClientes,
    addCliente,
    editCliente,
    suspenderCliente,
    activeCliente,
    buscarClientes,
    eliminarCliente
  } = useClientes();

  // Estados del componente
  const [showForm, setShowForm] = useState(false);
  const [editingCliente, setEditingCliente] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredClientes, setFilteredClientes] = useState([]);
  const [verTodos, setVerTodos] = useState(false);
  const [confirmDialog, setConfirmDialog] = useState(null);
  const [toast, setToast] = useState(null);

  // Cargar clientes al montar el componente
  useEffect(() => {
    getClientes();
  }, []);

  // Actualizar clientes filtrados
  useEffect(() => {
    if (!clientes || !Array.isArray(clientes)) {
      setFilteredClientes([]);
      return;
    }
    
    const filtered = verTodos 
      ? clientes 
      : clientes.filter(cliente => cliente && cliente.activo !== false);
    
    setFilteredClientes(filtered);
  }, [clientes, verTodos]);

  // Mostrar toast
  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  // Manejar búsqueda
  const handleSearch = async (query) => {
    setSearchQuery(query);
    if (query.trim()) {
      try {
        const results = await buscarClientes(query);
        const filtered = verTodos 
          ? results 
          : results.filter(c => c && c.activo !== false);
        setFilteredClientes(filtered);
      } catch (err) {
        showToast('Error al buscar clientes', 'error');
      }
    } else {
      const filtered = verTodos 
        ? clientes 
        : clientes.filter(c => c && c.activo !== false);
      setFilteredClientes(filtered);
    }
  };

  // Manejar creación de cliente
  const handleCreate = () => {
    setEditingCliente(null);
    setShowForm(true);
  };

  // Manejar edición de cliente
  const handleEdit = (cliente) => {
    setEditingCliente(cliente);
    setShowForm(true);
  };

  // Manejar envío del formulario
  const handleFormSubmit = async (clienteData) => {
    try {
      let result;
      
      if (editingCliente) {
        result = await editCliente(editingCliente.id, clienteData);
      } else {
        result = await addCliente(clienteData);
      }

      if (result.success) {
        setShowForm(false);
        setEditingCliente(null);
        showToast(
          editingCliente 
            ? 'Cliente actualizado exitosamente' 
            : 'Cliente creado exitosamente'
        );
        
        // Recargar datos si hay búsqueda activa
        if (searchQuery.trim()) {
          handleSearch(searchQuery);
        }
      } else {
        showToast(result.message || 'Error al guardar cliente', 'error');
      }
    } catch (err) {
      showToast('Error inesperado al guardar cliente', 'error');
    }
  };

  // Manejar suspensión de cliente
  const handleSuspend = (cliente) => {
    setConfirmDialog({
      title: 'Suspender Cliente',
      message: `¿Estás seguro de que deseas suspender a ${cliente.nombre}?`,
      confirmText: 'Suspender',
      confirmVariant: 'warning',
      onConfirm: async () => {
        try {
          const result = await suspenderCliente(cliente.id);
          if (result.success) {
            showToast('Cliente suspendido exitosamente');
            if (searchQuery.trim()) {
              handleSearch(searchQuery);
            }
          } else {
            showToast(result.message || 'Error al suspender cliente', 'error');
          }
        } catch (err) {
          showToast('Error inesperado al suspender cliente', 'error');
        }
        setConfirmDialog(null);
      },
      onCancel: () => setConfirmDialog(null)
    });
  };

  // Manejar activación de cliente
  const handleActivate = (cliente) => {
    setConfirmDialog({
      title: 'Activar Cliente',
      message: `¿Estás seguro de que deseas activar a ${cliente.nombre}?`,
      confirmText: 'Activar',
      confirmVariant: 'success',
      onConfirm: async () => {
        try {
          const result = await activeCliente(cliente.id);
          if (result.success) {
            showToast('Cliente activado exitosamente');
            if (searchQuery.trim()) {
              handleSearch(searchQuery);
            }
          } else {
            showToast(result.message || 'Error al activar cliente', 'error');
          }
        } catch (err) {
          showToast('Error inesperado al activar cliente', 'error');
        }
        setConfirmDialog(null);
      },
      onCancel: () => setConfirmDialog(null)
    });
  };

  // Manejar eliminación de cliente
  const handleDelete = (cliente) => {
    setConfirmDialog({
      title: 'Eliminar Cliente',
      message: `¿Estás seguro de que deseas eliminar permanentemente a ${cliente.nombre}? Esta acción no se puede deshacer.`,
      confirmText: 'Eliminar',
      confirmVariant: 'danger',
      onConfirm: async () => {
        try {
          const result = await eliminarCliente(cliente.id);
          if (result.success) {
            showToast('Cliente eliminado exitosamente');
            if (searchQuery.trim()) {
              handleSearch(searchQuery);
            }
          } else {
            showToast(result.message || 'Error al eliminar cliente', 'error');
          }
        } catch (err) {
          showToast('Error inesperado al eliminar cliente', 'error');
        }
        setConfirmDialog(null);
      },
      onCancel: () => setConfirmDialog(null)
    });
  };

  // Estados de carga y error
  if (loading && !clientes.length) {
    return <LoadingSpinner message="Cargando clientes..." />;
  }

  if (error && !clientes.length) {
    return (
      <ErrorState 
        title="Error al cargar clientes"
        message={error}
        onRetry={() => window.location.reload()}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <ClientHeader onCreateClick={handleCreate} />
        
        {/* Stats */}
        <ClientStats clientes={clientes} />
        
        {/* Filters */}
        <ClientFilters
          searchQuery={searchQuery}
          onSearch={handleSearch}
          verTodos={verTodos}
          onToggleVerTodos={setVerTodos}
        />
        
        {/* Table */}
        <ClientTable
          clientes={filteredClientes}
          loading={loading}
          searchQuery={searchQuery}
          onEdit={handleEdit}
          onSuspend={handleSuspend}
          onActivate={handleActivate}
          onDelete={handleDelete}
        />
        
        {/* Modal */}
        {showForm && (
          <ClientModal
            cliente={editingCliente}
            onSubmit={handleFormSubmit}
            onClose={() => {
              setShowForm(false);
              setEditingCliente(null);
            }}
            loading={loading}
          />
        )}
        
        {/* Confirm Dialog */}
        {confirmDialog && (
          <ConfirmDialog {...confirmDialog} />
        )}
        
        {/* Toast */}
        {toast && (
          <Toast
            message={toast.message}
            type={toast.type}
            onClose={() => setToast(null)}
          />
        )}
      </div>
    </div>
  );
};

export default ClientPage;
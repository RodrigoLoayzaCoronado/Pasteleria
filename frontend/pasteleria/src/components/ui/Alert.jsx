import React from 'react';
import { X } from 'lucide-react';

const Alert = ({ type = 'success', message, onClose, className = '' }) => {
  const typeStyles = {
    success: 'bg-green-100 text-green-800',
    error: 'bg-red-100 text-red-800',
    warning: 'bg-yellow-100 text-yellow-800',
    info: 'bg-blue-100 text-blue-800'
  };

  return (
    <div className={`${typeStyles[type]} p-4 rounded-lg flex justify-between items-center ${className}`}>
      <span>{message}</span>
      {onClose && (
        <button onClick={onClose} className="ml-4">
          <X size={16} />
        </button>
      )}
    </div>
  );
};

export default Alert;
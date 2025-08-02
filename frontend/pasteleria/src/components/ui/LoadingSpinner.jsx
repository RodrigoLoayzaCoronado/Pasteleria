import { Loader2 } from 'lucide-react';

const LoadingSpinner = ({ 
  message = 'Cargando...', 
  size = 'lg',
  className = '' 
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
    xl: 'w-12 h-12'
  };

  return (
    <div className={`flex flex-col items-center justify-center min-h-[400px] p-8 ${className}`}>
      <div className="flex flex-col items-center space-y-4">
        {/* Spinner */}
        <div className="relative">
          <Loader2 className={`${sizeClasses[size]} text-blue-600 animate-spin`} />
          
          {/* Pulse effect */}
          <div className={`absolute inset-0 ${sizeClasses[size]} bg-blue-200 rounded-full animate-ping opacity-20`} />
        </div>
        
        {/* Message */}
        <div className="text-center">
          <p className="text-gray-600 font-medium">{message}</p>
          <p className="text-sm text-gray-500 mt-1">Por favor espera un momento...</p>
        </div>
        
        {/* Progress dots */}
        <div className="flex space-x-1">
          <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
          <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
          <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
        </div>
      </div>
    </div>
  );
};

export default LoadingSpinner;
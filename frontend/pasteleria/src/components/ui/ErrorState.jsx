import { AlertCircle, RefreshCw, Home } from 'lucide-react';
import Button from './Button';

const ErrorState = ({ 
  title = 'Algo salió mal',
  message = 'Ha ocurrido un error inesperado',
  onRetry,
  showHomeButton = false,
  onHome,
  className = ''
}) => {
  return (
    <div className={`flex flex-col items-center justify-center min-h-[400px] p-8 ${className}`}>
      <div className="text-center max-w-md">
        {/* Error Icon */}
        <div className="mx-auto flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-6">
          <AlertCircle className="w-8 h-8 text-red-600" />
        </div>
        
        {/* Error Message */}
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          {title}
        </h3>
        <p className="text-gray-600 mb-6">
          {message}
        </p>
        
        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          {onRetry && (
            <Button
              onClick={onRetry}
              className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Intentar de nuevo</span>
            </Button>
          )}
          
          {showHomeButton && onHome && (
            <Button
              onClick={onHome}
              variant="outline"
              className="flex items-center space-x-2 px-6 py-3"
            >
              <Home className="w-4 h-4" />
              <span>Ir al inicio</span>
            </Button>
          )}
        </div>
        
        {/* Additional Help */}
        <div className="mt-8 p-4 bg-gray-50 rounded-lg">
          <p className="text-sm text-gray-600">
            Si el problema persiste, por favor contacta al administrador del sistema.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ErrorState;
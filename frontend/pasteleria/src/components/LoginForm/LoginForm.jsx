import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../../context/AuthContext';
import { Eye, EyeOff, Mail, Lock, AlertCircle, Loader2 } from 'lucide-react';

const LoginForm = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  // Validación en tiempo real
  useEffect(() => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (email && !emailRegex.test(email)) {
      setEmailError('Por favor ingresa un correo válido');
    } else {
      setEmailError('');
    }
    if (password && password.length < 6) {
      setPasswordError('La contraseña debe tener al menos 6 caracteres');
    } else {
      setPasswordError('');
    }
  }, [email, password]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password || emailError || passwordError || password.length < 6) return;

    setIsLoading(true);
    setError('');

    try {
      const response = await axios.post('http://localhost:3000/api/auth/login', {
        correo: email,
        contrasena: password,
      });
      const { token, usuario } = response.data;
      login(token, { ...usuario, id_sucursal: usuario.id_sucursal });
      if (usuario.rol === 'administrador') {
        navigate('/admin/dashboard');
      } else if (usuario.rol === 'operador') {
        navigate('/operador/clientes');
      }
    } catch (err) {
      setError(err.response?.data?.mensaje || 'Error en el servidor. Por favor intenta nuevamente.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden"
      style={{
        background: 'linear-gradient(135deg, #fcda8bff 0%, #d3b997ff 50%, #e4c4e8ff 100%)',
      }}
    >
      {/* Elementos decorativos de fondo */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-10 -left-10 w-40 h-40 bg-pink-400 rounded-full opacity-20 animate-pulse"></div>
        <div className="absolute top-1/3 -right-20 w-60 h-60 bg-dorado rounded-full opacity-15 animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute -bottom-20 left-1/4 w-80 h-80 bg-orange-300 rounded-full opacity-10 animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>

      <div className="relative w-full max-w-md">
        <div className="bg-white bg-opacity-95 backdrop-blur-sm p-8 rounded-2xl shadow-2xl  transform transition-all duration-500 hover:shadow-3xl">
          {/* Header con logo y título */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-pink-principal to-pink-600 rounded-full mb-4 shadow-lg transform transition-transform hover:scale-110">
              <span className="text-2xl">🍰</span>
            </div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-pink-principal to-marron-chocolate bg-clip-text text-transparent mb-2">
              Pastelería Mas Deli
            </h1>
            <p className="text-marron-chocolate font-bold text-sm">Sistema de Cotización de Tortas</p>
            <p className="text-marron-chocolate text-sm">Ingresa a tu cuenta</p>
          </div>

          <form onSubmit={handleSubmit}>
            {/* Campo Email */}
            <div className="space-y-2 mb-6">
              <label htmlFor="email" className="block text-sm font-medium text-marron-chocolate flex items-center gap-2">
                <Mail className="w-4 h-4 text-pink-principal" />
                Correo electrónico
              </label>
              <div className="relative">
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={`w-full px-4 py-3 rounded-xl border-2 transition-all duration-300 focus:outline-none ${
                    emailError
                      ? 'border-red-300 focus:border-red-500 focus:ring-2 focus:ring-red-200'
                      : email
                      ? 'border-green-300 focus:border-pink-principal focus:ring-2 focus:ring-pink-100'
                      : 'border-beige focus:border-pink-principal focus:ring-2 focus:ring-beige'
                  }`}
                  placeholder="correo@ejemplo.com"
                  disabled={isLoading}
                  aria-label="Correo electrónico"
                />
                {email && !emailError && (
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <div className="w-2 h-2 bg-verde-exito rounded-full"></div>
                  </div>
                )}
              </div>
              {emailError && (
                <div className="flex items-center gap-1 text-red-500 text-xs">
                  <AlertCircle className="w-3 h-3" />
                  {emailError}
                </div>
              )}
            </div>

            {/* Campo Contraseña */}
            <div className="space-y-2 mb-6">
              <label htmlFor="password" className="block text-sm font-medium text-marron-chocolate flex items-center gap-2">
                <Lock className="w-4 h-4 text-pink-principal" />
                Contraseña
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`w-full px-4 py-3 rounded-xl border-2 transition-all duration-300 focus:outline-none pr-12 ${
                    passwordError
                      ? 'border-red-300 focus:border-red-500 focus:ring-2 focus:ring-red-200'
                      : password && password.length >= 6
                      ? 'border-green-300 focus:border-pink-principal focus:ring-2 focus:ring-pink-100'
                      : 'border-beige focus:border-pink-principal focus:ring-2 focus:ring-beige'
                  }`}
                  placeholder="••••••••"
                  disabled={isLoading}
                  aria-label="Contraseña"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-marron-chocolate hover:text-pink-principal transition-colors duration-200 p-1"
                  disabled={isLoading}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {passwordError && (
                <div className="flex items-center gap-1 text-red-500 text-xs">
                  <AlertCircle className="w-3 h-3" />
                  {passwordError}
                </div>
              )}
            </div>

            {/* Mensaje de error general */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl flex items-start gap-2 mb-6">
                <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <span className="text-sm">{error}</span>
              </div>
            )}

            {/* Botón de submit */}
            <button
              type="submit"
              disabled={!email || !password || emailError || passwordError || password.length < 6 || isLoading}
              className={`w-full py-3 px-4 rounded-xl font-medium transition-all duration-300 flex items-center justify-center gap-2 ${
                !email || !password || emailError || passwordError || password.length < 6 || isLoading
                  ? 'bg-gray-300 text-marron-chocolate cursor-not-allowed'
                  : 'bg-gradient-to-r from-pink-principal to-marron-chocolate text-white shadow-lg hover:shadow-xl transform hover:-translate-y-0.5'
              }`}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Ingresando...
                </>
              ) : (
                'Ingresar'
              )}
            </button>
          </form>

          {/* Enlaces adicionales */}
          <div className="mt-6 text-center space-y-3">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-beige"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-marron-chocolate">¿Necesitas ayuda?</span>
              </div>
            </div>
            <div className="space-y-2">
              <a
                href="/forgot-password"
                className="block text-sm text-pink-principal hover:text-marron-chocolate transition-colors duration-200 hover:underline"
              >
                ¿Olvidaste tu contraseña?
              </a>
              <p className="text-sm text-marron-chocolate">
                ¿No tienes cuenta?{' '}
                <a
                  href="/contacto-admin"
                  className="text-pink-principal hover:text-marron-chocolate transition-colors duration-200 hover:underline font-medium"
                >
                  Contáctate con el administrador
                </a>
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-6">
          <p className="text-xs text-marron-chocolate">
            © 2025 Pastelería Dulce Tentación. Todos los derechos reservados.
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;
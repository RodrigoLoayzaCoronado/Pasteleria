import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';

const ResetPassword = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }
    try {
      const response = await axios.post('http://localhost:3000/api/auth/reset-password', {
        token,
        nueva_contrasena: password,
      });
      setMessage(response.data.mensaje);
      setError('');
      setTimeout(() => navigate('/login'), 3000); // Redirige después de 3 segundos
    } catch (err) {
      setError(err.response?.data?.mensaje || 'Error en el servidor');
      setMessage('');
    }
  };

  return (
    <div
      className="min-h-screen bg-crema flex items-center justify-center"
      style={{
        backgroundImage: 'linear-gradient(135deg, #FFF8E7 0%, #F5E6D3 100%)',
      }}
    >
      <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full border-2 border-dorado">
        <h1 className="text-3xl font-bold text-pink-principal mb-6 text-center">
          Restablecer Contraseña
        </h1>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-marron-chocolate"
            >
              Nueva Contraseña
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 block w-full rounded-md border-beige p-2 focus:border-pink-principal focus:ring-pink-principal"
                placeholder="Ingrese nueva contraseña"
                aria-label="Nueva contraseña"
                required
              />
            </div>
          </div>
          <div>
            <label
              htmlFor="confirmPassword"
              className="block text-sm font-medium text-marron-chocolate"
            >
              Confirmar Contraseña
            </label>
            <div className="relative">
              <input
                id="confirmPassword"
                type={showPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="mt-1 block w-full rounded-md border-beige p-2 focus:border-pink-principal focus:ring-pink-principal"
                placeholder="Confirme su contraseña"
                aria-label="Confirmar contraseña"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-2 top-2 text-marron-chocolate hover:text-pink-principal"
              >
                {showPassword ? 'Ocultar' : 'Ver'}
              </button>
            </div>
          </div>
          {error && <p className="text-red-500 text-sm">{error}</p>}
          {message && <p className="text-verde-exito text-sm">{message}</p>}
          <button
            type="submit"
            className="w-full bg-pink-principal text-white py-3 px-4 rounded-md border-2 border-dorado hover:bg-marron-chocolate hover:border-pink-principal transition duration-300"
          >
            Restablecer Contraseña
          </button>
        </form>
        <p className="mt-4 text-center text-sm text-marron-chocolate">
          <a
            href="/login"
            className="text-pink-principal hover:underline"
          >
            Volver al inicio de sesión
          </a>
        </p>
      </div>
    </div>
  );
};

export default ResetPassword;
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:3000/api/auth/forgot-password', {
        correo: email,
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
          Recuperar Contraseña
        </h1>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-marron-chocolate"
            >
              Correo
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 block w-full rounded-md border-beige p-2 focus:border-pink-principal focus:ring-pink-principal"
              placeholder="Ingrese su correo"
              aria-label="Correo electrónico"
              required
            />
          </div>
          {error && <p className="text-red-500 text-sm">{error}</p>}
          {message && <p className="text-verde-exito text-sm">{message}</p>}
          <button
            type="submit"
            className="w-full bg-pink-principal text-white py-3 px-4 rounded-md border-2 border-dorado hover:bg-marron-chocolate hover:border-pink-principal transition duration-300"
          >
            Enviar enlace
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

export default ForgotPassword;
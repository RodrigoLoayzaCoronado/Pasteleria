/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}", // Esto le dice a Tailwind que escanee los archivos .js, .ts, .jsx, .tsx en la carpeta src
  ],
  theme: {
    extend: {
      colors: {
        'pink-principal': '#fc528aff',
        'crema': '#ef85f3ff',
        'beige': '#f1d0a5ff',
        'marron-chocolate': '#7c3400ff',
        'dorado': '#c0a300ff',
        'verde-exito': '#28A745',
      },
      animation: {
        'pulse': 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      boxShadow: {
        '2xl': '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
        '3xl': '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
      },
    },
  },
  plugins: [],
}


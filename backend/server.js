const express = require('express');
const app = express();
const sequelize = require('./config/database');
require('dotenv').config();
require('./models'); // Cargar relaciones

const authRoutes = require('./routes/authRoutes');
const sucursalRoutes = require('./routes/sucursalRoutes');
const clienteRoutes = require('./routes/clienteRoutes');
const usuarioRoutes = require('./routes/usuarioRoutes');
const tortaBase=  require('./routes/tortaBaseRoutes');
const miniTortaRoutes = require('./routes/miniTortaRoutes');
const coberturaRoutes = require('./routes/coberturaRoutes');
const decoracionRoutes = require('./routes/decoracionRoutes');
const elementoDecorativoRoutes = require('./routes/elementoDecorativoRoutes');
const detalleTortas = require('./routes/detalleTortaRoutes');
const postres=require('./routes/postreRoutes');
const extraRoutes = require('./routes/extraRoutes');
const cotizacionRoutes = require('./routes/cotizacionRoutes');

//middleware
app.use(express.json());

// Rutas
//ruta para autenticación
app.use('/api/auth', authRoutes);
//ruta para sucursales
app.use('/api/sucursales', sucursalRoutes);
//ruta para clientes
app.use('/api/clientes', clienteRoutes);
//ruta para usuarios
app.use('/api/usuarios', usuarioRoutes);
//ruta para tortas base
app.use('/api/tortas-base', tortaBase);
//ruta para mini tortas
app.use('/api/mini-tortas', miniTortaRoutes);
//ruta para coberturas
app.use('/api/coberturas', coberturaRoutes);
// ruta para decoraciones
app.use('/api/decoraciones', decoracionRoutes);
// ruta para elementos decorativos
app.use('/api/elementos-decorativos', elementoDecorativoRoutes);
// ruta para detalle tortas
app.use('/api/tortas', detalleTortas);
// ruta para postres
app.use('/api/postres', postres);
// ruta para extras
app.use('/api/extras', extraRoutes);
// ruta para cotizaciones
app.use('/api/cotizaciones', cotizacionRoutes);

//  levantar el servidor
const PORT = process.env.PORT || 3000;

// Conectar a la base de datos
sequelize.authenticate()
  .then(() => {
    console.log('Conexión a la base de datos establecida correctamente.');
  })
  .catch(err => {
    console.error('No se pudo conectar a la base de datos:', err);
  });

app.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`);
});



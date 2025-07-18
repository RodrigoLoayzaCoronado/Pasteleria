const { Sequelize } = require('sequelize');
const sequelize = require('../config/database');

// --- Importar todos los modelos ---
// Modelos de entidades principales
const Cliente = require('./cliente');
const Cobertura = require('./cobertura');
const Cotizacion = require('./cotizacion');
const Decoracion = require('./decoracion');
const ElementoDecorativo = require('./elemento_decorativo');
const Extra = require('./extra');
const HistorialEstado = require('./historial_estado'); 
const ItemCotizacion = require('./item_cotizacion');
const MiniTorta = require('./mini_torta');
const OtrosProductos = require('./otros_productos');
const Postre = require('./postre');
const Sucursal = require('./sucursal');
const TortaBase = require('./torta_base');
const Usuario = require('./usuario');
const TokenDenegado = require('./token_denegado'); 
const TokenRecuperacion = require('./token_recuperacion'); 

// Modelos de tablas de unión / detalles / precios por porciones
const PrecioPorcionTortaBase = require('./precio_porcion_torta_base');
const PrecioPorcionesCobertura = require('./precio_porcion_cobertura'); 
const PrecioPorcionDecoracion = require('./precio_porcion_decoracion');
const PrecioPorcionMiniTorta = require('./precio_porcion_mini_torta'); // Asegúrate de tener este modelo si lo usas
const TortaCompleta = require('./detalle_torta'); // Mapea a la tabla 'detalle_torta'
const DecoracionPorTorta = require('./decoracion_por_torta');
const ElementoDecorativoPorTorta = require('./elemento_decorativo_por_torta');
const ExtraPorTorta = require('./extra_por_torta');

// --- Definir Relaciones entre Tablas ---

// 1. Relaciones de Catálogo y Precios
// TortaBase y sus Precios por Porciones (precios_porciones_tortas_base)
TortaBase.hasMany(PrecioPorcionTortaBase, { foreignKey: 'id_tortas_base', as: 'preciosPorciones' });
PrecioPorcionTortaBase.belongsTo(TortaBase, { foreignKey: 'id_tortas_base', as: 'tortaBase' });

// Cobertura y sus Precios por Porciones (precios_porciones_coberturas)
Cobertura.hasMany(PrecioPorcionesCobertura, { foreignKey: 'id_cobertura', as: 'preciosPorciones' });
PrecioPorcionesCobertura.belongsTo(Cobertura, { foreignKey: 'id_cobertura', as: 'cobertura' });

// Decoracion y sus Precios por Porciones (precios_porciones_decoraciones)
Decoracion.hasMany(PrecioPorcionDecoracion, { foreignKey: 'id_decoracion', as: 'preciosPorciones' });
PrecioPorcionDecoracion.belongsTo(Decoracion, { foreignKey: 'id_decoracion', as: 'decoracion' });

// MiniTorta y sus Precios por Porciones (Si tienes esta tabla de precios específica)
MiniTorta.hasMany(PrecioPorcionMiniTorta, { foreignKey: 'id_mini_tortas', as: 'preciosPorciones' });
PrecioPorcionMiniTorta.belongsTo(MiniTorta, { foreignKey: 'id_mini_tortas', as: 'miniTorta' });


// 2. Relaciones de Entidades Principales con Cotizaciones
// Usuario y Cotizacion (Usuario creador)
Usuario.hasMany(Cotizacion, { foreignKey: 'id_usuario_creador', as: 'cotizacionesCreadas' });
Cotizacion.belongsTo(Usuario, { foreignKey: 'id_usuario_creador', as: 'usuarioCreador' }); // Alias consistente

// Sucursal y Cotizacion
Sucursal.hasMany(Cotizacion, { foreignKey: 'id_sucursal', as: 'cotizacionesSucursal' });
Cotizacion.belongsTo(Sucursal, { foreignKey: 'id_sucursal', as: 'sucursal' });

// Cliente y Cotizacion
Cliente.hasMany(Cotizacion, { foreignKey: 'id_cliente', as: 'cotizacionesCliente' });
Cotizacion.belongsTo(Cliente, { foreignKey: 'id_cliente', as: 'cliente' });

// 3. Relaciones de Cotizacion con Items de Cotizacion
Cotizacion.hasMany(ItemCotizacion, { foreignKey: 'id_cotizacion', as: 'items' });
ItemCotizacion.belongsTo(Cotizacion, { foreignKey: 'id_cotizacion', as: 'cotizacion' });

// 4. Relaciones Polimórficas para ItemCotizacion (id_producto y tipo_producto)
// Un ItemCotizacion puede ser un DetalleTorta (para tortas personalizadas)
ItemCotizacion.belongsTo(TortaCompleta, { 
  foreignKey: 'id_producto', 
  constraints: false, // Desactiva la restricción de FK a nivel de DB para esta relación polimórfica
  // REMOVIDO: scope: { tipo_producto: 'torta' }, // Esta línea causaba errores de columna
  as: 'detalleTorta' // Alias para incluir el detalle de la torta
});

// Un ItemCotizacion puede ser una MiniTorta
ItemCotizacion.belongsTo(MiniTorta, { 
  foreignKey: 'id_producto', 
  constraints: false, 
  // REMOVIDO: scope: { tipo_producto: 'mini_torta' }, // Esta línea causaba errores de columna
  as: 'miniTorta' 
});

// Un ItemCotizacion puede ser un Postre
ItemCotizacion.belongsTo(Postre, { 
  foreignKey: 'id_producto', 
  constraints: false, 
  // REMOVIDO: scope: { tipo_producto: 'postre' }, // Esta línea causaba errores de columna
  as: 'postre' 
});

// Un ItemCotizacion puede ser OtroProducto
ItemCotizacion.belongsTo(OtrosProductos, { 
  foreignKey: 'id_producto', 
  constraints: false, 
  // REMOVIDO: scope: { tipo_producto: 'otro_producto' }, // Esta línea causaba errores de columna
  as: 'otroProducto' 
});


// 5. Relaciones de DetalleTorta (TortaCompleta)
// DetalleTorta pertenece a un ItemCotizacion (relación 1:1)
TortaCompleta.belongsTo(ItemCotizacion, { foreignKey: 'id_item_cotizacion', as: 'itemCotizacion' });
ItemCotizacion.hasOne(TortaCompleta, { foreignKey: 'id_item_cotizacion', as: 'tortaCompleta' }); // Inversa para fácil inclusión desde ItemCotizacion

// DetalleTorta y sus componentes principales
TortaCompleta.belongsTo(TortaBase, { foreignKey: 'id_torta_base', as: 'tortaBase' });
TortaCompleta.belongsTo(Cobertura, { foreignKey: 'id_cobertura', as: 'cobertura' });
TortaCompleta.belongsTo(Decoracion, { foreignKey: 'id_decoracion', as: 'decoracionPrincipal' }); // Decoración principal de la torta

// Inversas para componentes principales (opcional, pero útil para consultas desde el componente)
TortaBase.hasMany(TortaCompleta, { foreignKey: 'id_torta_base', as: 'detallesTorta' });
Cobertura.hasMany(TortaCompleta, { foreignKey: 'id_cobertura', as: 'detallesTorta' });
Decoracion.hasMany(TortaCompleta, { foreignKey: 'id_decoracion', as: 'detallesTortaPrincipal' });


// 6. Relaciones de Tablas de Unión para DetalleTorta
// DetalleTorta con ElementoDecorativoPorTorta (elementos_decorativos_torta)
TortaCompleta.hasMany(ElementoDecorativoPorTorta, { foreignKey: 'id_detalle_torta', as: 'elementosDecorativos' });
ElementoDecorativoPorTorta.belongsTo(TortaCompleta, { foreignKey: 'id_detalle_torta', as: 'detalleTorta' });
ElementoDecorativoPorTorta.belongsTo(ElementoDecorativo, { foreignKey: 'id_elemento_decorativo', as: 'elementoDecorativo' });

// DetalleTorta con ExtraPorTorta (extras_torta)
TortaCompleta.hasMany(ExtraPorTorta, { foreignKey: 'id_detalle_torta', as: 'extras' });
ExtraPorTorta.belongsTo(TortaCompleta, { foreignKey: 'id_detalle_torta', as: 'detalleTorta' });
ExtraPorTorta.belongsTo(Extra, { foreignKey: 'id_extra', as: 'extra' });

// DetalleTorta con DecoracionPorTorta (decoracion_por_torta)
TortaCompleta.hasMany(DecoracionPorTorta, { foreignKey: 'id_detalle_torta', as: 'decoracionesAdicionales' });
DecoracionPorTorta.belongsTo(TortaCompleta, { foreignKey: 'id_detalle_torta', as: 'detalleTorta' });
DecoracionPorTorta.belongsTo(Decoracion, { foreignKey: 'id_decoracion', as: 'decoracion' }); // La decoración adicional específica

// 7. Relaciones de Historial y Tokens
// Cotizacion y HistorialEstado (historial_estados)
Cotizacion.hasMany(HistorialEstado, { foreignKey: 'id_cotizacion', as: 'historialEstados' });
HistorialEstado.belongsTo(Cotizacion, { foreignKey: 'id_cotizacion', as: 'cotizacion' });
HistorialEstado.belongsTo(Usuario, { foreignKey: 'id_usuario', as: 'usuarioCambio' }); // Usuario que realizó el cambio de estado

// Usuario y TokenRecuperacion (tokens_recuperacion)
Usuario.hasMany(TokenRecuperacion, { foreignKey: 'id_usuario', as: 'tokensRecuperacion' });
TokenRecuperacion.belongsTo(Usuario, { foreignKey: 'id_usuario', as: 'usuario' });

// TokenDenegado (no tiene FKs salientes)


// --- Exportar todos los modelos y la instancia de Sequelize ---
module.exports = {
  sequelize,
  // Modelos de entidades principales
  Cliente,
  Cobertura,
  Cotizacion,
  Decoracion,
  ElementoDecorativo,
  Extra,
  HistorialEstado,
  ItemCotizacion,
  MiniTorta,
  OtrosProductos,
  Postre,
  Sucursal,
  TortaBase,
  Usuario,
  TokenDenegado,
  TokenRecuperacion,

  // Modelos de tablas de unión / detalles / precios por porciones
  PrecioPorcionTortaBase,
  PrecioPorcionesCobertura, 
  PrecioPorcionDecoracion,
  PrecioPorcionMiniTorta, // Exporta si tienes este modelo
  TortaCompleta, 
  DecoracionPorTorta,
  ElementoDecorativoPorTorta,
  ExtraPorTorta
};

# Proyecto: Sistema de Cotización para Pastelería

Este proyecto implementa un sistema para gestionar cotizaciones de tortas y otros productos de pastelería. La base de datos está diseñada para almacenar información sobre clientes, productos (tortas base, coberturas, decoraciones, mini tortas, postres, otros productos), cotizaciones, y el historial de estados de las mismas.

## Problema del Negocio y Requerimientos

### Problema

El problema principal que este sistema busca resolver es la **gestión ineficiente y manual del proceso de cotización** de productos de pastelería, especialmente aquellos que requieren personalización como las tortas. Típicamente, esto puede llevar a:
* **Errores en cálculos de precios**: Cálculos manuales complejos para tortas con múltiples componentes (base, cobertura, decoraciones, extras) pueden resultar en cotizaciones incorrectas.
* **Falta de trazabilidad**: Dificultad para seguir el estado de las cotizaciones, quién las creó, qué modificaciones se realizaron o cuándo.
* **Información dispersa**: Datos de clientes, productos y precios no centralizados, lo que complica la consulta y actualización.
* **Inconsistencia en cotizaciones**: Variaciones en la forma de cotizar productos personalizados entre diferentes vendedores o sucursales.
* **Dificultad en el reporte y análisis**: Sin datos estructurados, es complicado generar informes sobre ventas, productos más populares o rendimiento de cotizaciones.

### Requerimientos (Inferidos)

Para resolver el problema, se identifican los siguientes requerimientos clave que el sistema debe soportar:

* **Gestión Centralizada de Clientes**: Necesidad de mantener un registro completo y accesible de la información de los clientes.
* **Catálogo de Productos Detallado**: Capacidad para definir y gestionar un inventario de todos los componentes y productos de pastelería, incluyendo tortas base, coberturas, decoraciones, elementos decorativos, extras, mini tortas, postres y otros.
* **Precios Flexibles y por Porciones**: Habilidad para establecer precios de tortas y sus componentes que varían según el tamaño o número de porciones.
* **Generación de Cotizaciones Complejas**: El sistema debe permitir la creación de cotizaciones que incluyan productos simples y tortas altamente personalizables con múltiples capas de componentes y sus respectivos precios.
* **Cálculo Automático de Precios**: La suma total de la cotización, así como los precios de los ítems complejos (tortas), deben calcularse automáticamente en función de los componentes y las porciones seleccionadas.
* **Seguimiento del Estado de Cotizaciones**: Se requiere un mecanismo para rastrear el progreso de cada cotización (pendiente, aprobada, rechazada, etc.) y un historial de sus cambios.
* **Gestión de Usuarios y Roles**: Necesidad de controlar quién puede acceder al sistema y qué acciones puede realizar (ej., administradores vs. operadores), y asociar las acciones a un usuario y sucursal.
* **Soporte Multi-sucursal**: Posibilidad de gestionar operaciones y usuarios por diferentes ubicaciones o sucursales de la pastelería.
* **Seguridad y Recuperación**: Mecanismos para la autenticación de usuarios y la recuperación de acceso.

## Estructura de la Base de Datos (Esquema)

La base de datos `pasteleria_cotizaciones` está compuesta por las siguientes tablas principales:

### Tablas Maestras y de Catálogo

* **`clientes`**: Almacena la información de los clientes que solicitan cotizaciones.
    * `id` (PK)
    * `nombre`
    * `telefono`
    * `creado_en`
    * `activo`
* **`sucursales`**: Contiene la información de las diferentes sucursales de la pastelería.
    * `id` (PK)
    * `nombre`
    * `direccion`
    * `creado_en`
* **`usuarios`**: Gestiona los usuarios del sistema con sus roles (administrador, operador) y la sucursal a la que pertenecen.
    * `id` (PK)
    * `nombre`
    * `correo` (UNIQUE)
    * `contrasena`
    * `rol` (CHECK: 'administrador', 'operador')
    * `id_sucursal` (FK a `sucursales`)
    * `creado_en`
    * `activo`
* **`tortas_base`**: Catálogo de sabores o tipos de tortas base disponibles.
    * `id` (PK)
    * `nombre`
    * `descripcion`
    * `imagen_url`
    * `creado_en`
    * `activo`
* **`coberturas`**: Catálogo de coberturas disponibles para las tortas.
    * `id` (PK)
    * `nombre`
    * `descripcion`
    * `creado_en`
    * `activo`
* **`decoraciones`**: Catálogo de tipos de decoraciones para tortas.
    * `id` (PK)
    * `nombre`
    * `descripcion`
    * `creado_en`
    * `activo`
* **`elementos_decorativos`**: Elementos individuales que componen las decoraciones (ej. flores, figuras).
    * `id` (PK)
    * `nombre`
    * `descripcion`
    * `precio_unitario`
    * `creado_en`
    * `activo`
* **`extras`**: Productos adicionales o servicios extra (ej. velas, empaques especiales).
    * `id` (PK)
    * `nombre`
    * `descripcion`
    * `precio_unitario`
    * `creado_en`
    * `activo`
* **`mini_tortas`**: Catálogo de mini tortas disponibles.
    * `id` (PK)
    * `nombre`
    * `descripcion`
    * `creado_en`
    * `activo`
    * `porciones`
    * `precio`
* **`postres`**: Catálogo de postres individuales o por porción.
    * `id` (PK)
    * `nombre`
    * `descripcion`
    * `creado_en`
    * `activo`
    * `precio`
    * `porciones`
* **`otros_productos`**: Para productos que no encajan en las categorías anteriores.
    * `id` (PK)
    * `nombre`
    * `descripcion`
    * `precio_unitario`
    * `unidad_medida`
    * `categoria`
    * `creado_en`
    * `activo`

### Tablas de Precios por Porciones

* **`precios_porciones_tortas_base`**: Define el precio de una `torta_base` según el número de porciones.
    * `id` (PK)
    * `id_tortas_base` (FK a `tortas_base`)
    * `porciones`
    * `precio`
    * `creado_en`
    * (UNIQUE: `id_tortas_base`, `porciones`)
* **`precios_porciones_coberturas`**: Define el precio de una `cobertura` según el número de porciones.
    * `id` (PK)
    * `id_cobertura` (FK a `coberturas`)
    * `porciones`
    * `precio`
    * `creado_en`
    * (UNIQUE: `id_cobertura`, `porciones`)
* **`precios_porciones_decoraciones`**: Define el precio de una `decoracion` según el número de porciones.
    * `id` (PK)
    * `id_decoracion` (FK a `decoraciones`)
    * `porciones`
    * `precio`
    * `creado_en`
    * (UNIQUE: `id_decoracion`, `porciones`)

### Tablas de Cotizaciones y Detalles

* **`cotizaciones`**: Información principal de cada cotización generada.
    * `id` (PK)
    * `numero_cotizacion` (UNIQUE)
    * `id_cliente` (FK a `clientes`)
    * `fecha_evento`
    * `observaciones`
    * `total`
    * `estado` (DEFAULT 'PENDIENTE')
    * `creado_en`
    * `id_sucursal` (FK a `sucursales`)
    * `id_usuario_creador` (FK a `usuarios`)
* **`historial_estados`**: Registra los cambios de estado de una cotización.
    * `id` (PK)
    * `id_cotizacion` (FK a `cotizaciones`)
    * `estado`
    * `fecha`
    * `id_usuario` (FK a `usuarios`)
* **`items_cotizacion`**: Detalla los productos incluidos en cada cotización.
    * `id` (PK)
    * `id_cotizacion` (FK a `cotizaciones`)
    * `tipo_producto` (ej. 'TORTA', 'MINI_TORTA', 'POSTRE', 'OTRO')
    * `id_producto` (puede apuntar a diferentes tablas según `tipo_producto`)
    * `nombre_producto`
    * `descripcion_completa`
    * `cantidad`
    * `precio_unitario`
    * `precio_total`
    * `creado_en`
* **`detalle_torta`**: Detalle específico para los ítems de tipo 'TORTA' en `items_cotizacion`.
    * `id` (PK)
    * `id_item_cotizacion` (FK a `items_cotizacion`)
    * `id_torta_base` (FK a `tortas_base`)
    * `id_cobertura` (FK a `coberturas`)
    * `id_decoracion` (FK a `decoraciones`)
    * `porciones`
    * `precio_base`
    * `precio_cobertura`
    * `precio_decoracion`
    * `creado_en`
    * `imagen_url`
* **`decoracion_por_torta`**: Relaciona múltiples decoraciones con un `detalle_torta`.
    * `id` (PK)
    * `id_detalle_torta` (FK a `detalle_torta`)
    * `id_decoracion` (FK a `decoraciones`)
    * `cantidad`
    * `precio_unitario`
    * `precio_total`
    * `creado_en`
* **`elementos_decorativos_torta`**: Relaciona `elementos_decorativos` con un `detalle_torta`.
    * `id` (PK)
    * `id_detalle_torta` (FK a `detalle_torta`)
    * `id_elemento_decorativo` (FK a `elementos_decorativos`)
    * `cantidad`
    * `precio_unitario`
    * `precio_total`
    * `creado_en`
* **`extras_torta`**: Relaciona `extras` con un `detalle_torta`.
    * `id` (PK)
    * `id_detalle_torta` (FK a `detalle_torta`)
    * `id_extra` (FK a `extras`)
    * `cantidad`
    * `precio_unitario`
    * `precio_total`
    * `creado_en`

### Tablas de Seguridad

* **`tokens_denegados`**: Almacena tokens de sesión que han sido invalidados (ej. en logout).
    * `id` (PK)
    * `token`
    * `fecha_expiracion`
    * `creado_en`
* **`tokens_recuperacion`**: Utilizado para gestionar tokens de recuperación de contraseña.
    * `id` (PK)
    * `id_usuario` (FK a `usuarios`)
    * `token`
    * `fecha_expiracion`
    * `usado`
    * `creado_en`

## Cómo se Resuelve el Problema (Enfoque de Diseño de Base de Datos)

El problema de negocio se está resolviendo mediante un **diseño de base de datos relacional y normalizado**, que permite estructurar y gestionar la información de manera eficiente y consistente. A continuación, se detalla cómo el esquema de la base de datos aborda cada requerimiento:

1.  **Gestión Centralizada de Clientes**: La tabla `clientes` centraliza toda la información de los clientes, permitiendo un acceso rápido y uniforme a sus datos.
2.  **Catálogo de Productos Detallado**:
    * Se utilizan tablas dedicadas (`tortas_base`, `coberturas`, `decoraciones`, `mini_tortas`, `postres`, `otros_productos`, `elementos_decorativos`, `extras`) para cada tipo de producto o componente. Esto asegura que la información de cada elemento sea completa y consistente, facilitando su mantenimiento.
    * El campo `activo` en muchas de estas tablas permite la gestión de la disponibilidad de productos sin eliminarlos del historial.
3.  **Precios Flexibles y por Porciones**: Las tablas `precios_porciones_tortas_base`, `precios_porciones_coberturas` y `precios_porciones_decoraciones` resuelven el requerimiento de precios variables. Almacenan el precio de cada componente de torta en función del número de porciones, lo que simplifica la lógica de cálculo en la aplicación y asegura que los precios se deriven de datos maestros.
4.  **Generación de Cotizaciones Complejas y Cálculo Automático de Precios**:
    * La tabla `cotizaciones` guarda la información general de la cotización, incluyendo el `total`.
    * La tabla `items_cotizacion` permite añadir cualquier tipo de producto (`tipo_producto`) a una cotización.
    * Para las tortas personalizadas, la tabla `detalle_torta` es clave. Almacena referencias a la `torta_base`, `cobertura` y `decoracion` principal, y lo más importante, las `porciones`.
    * Las tablas `decoracion_por_torta`, `elementos_decorativos_torta` y `extras_torta` permiten añadir múltiples decoraciones, elementos decorativos y extras a una torta específica, resolviendo la necesidad de personalización avanzada.
    * Los campos `precio_unitario` y `precio_total` en `items_cotizacion`, así como `precio_base`, `precio_cobertura`, `precio_decoracion` en `detalle_torta`, y los precios en las tablas de relación (`decoracion_por_torta`, etc.), están diseñados para que la aplicación pueda **calcular de forma sumativa y automatizada el costo total** de una cotización, evitando errores manuales.
5.  **Seguimiento del Estado de Cotizaciones**: La tabla `historial_estados` registra cada transición de estado de una cotización, incluyendo la fecha y el usuario responsable. Esto proporciona una trazabilidad completa y una pista de auditoría.
6.  **Gestión de Usuarios y Roles**: La tabla `usuarios` define roles (`administrador`, `operador`) y asocia usuarios a sucursales, permitiendo implementar un control de acceso basado en roles (RBAC) a nivel de aplicación.
7.  **Soporte Multi-sucursal**: La relación de `usuarios` y `cotizaciones` con la tabla `sucursales` permite que el sistema opere y filtre información por sucursal, satisfaciendo este requerimiento de escalabilidad.
8.  **Seguridad y Recuperación**: Las tablas `tokens_denegados` y `tokens_recuperacion` proveen la estructura de datos necesaria para implementar funcionalidades de seguridad como la invalidación de tokens de sesión y el proceso de recuperación de contraseñas de forma segura.

En resumen, el problema se resuelve mediante un **modelado de datos granular y relacionado**, que permite descomponer los productos complejos en sus componentes y aplicar lógicas de precios dinámicas, a la vez que se mantiene la integridad de los datos y se proporciona una base sólida para la trazabilidad y la seguridad operativa. La implementación final de la "lógica de negocio" se realizaría en la capa de aplicación, utilizando estas estructuras de base de datos para almacenar y recuperar la información necesaria para los cálculos y procesos.

## Cómo usar el archivo `cotizacion.sql`

El archivo `cotizacion.sql` es un script de volcado (dump) de PostgreSQL que puedes usar para recrear la estructura de la base de datos.

1.  **Instalar PostgreSQL**: Asegúrate de tener PostgreSQL instalado en tu sistema.
2.  **Crear la base de datos (opcional, el script lo hace)**: El script intenta crear la base de datos `pasteleria_cotizaciones`. Si ya existe, o si prefieres crearla manualmente, puedes ejecutar:
    ```sql
    CREATE DATABASE pasteleria_cotizaciones;
    ```
3.  **Restaurar el esquema**: Utiliza el comando `psql` para ejecutar el script SQL:
    ```bash
    psql -U your_username -d pasteleria_cotizaciones -f cotizacion.sql
    ```
    Reemplaza `your_username` con tu nombre de usuario de PostgreSQL. Esto creará todas las tablas, secuencias, restricciones e índices definidos en el archivo.

    **Nota**: El archivo contiene comandos `DROP TABLE` y `DROP SEQUENCE` comentados. Descomentarlos antes de ejecutar el script podría ser útil si necesitas limpiar una base de datos existente antes de recrear el esquema.

## Próximos Pasos (Sugerencias)

* **Aplicación Backend/Frontend**: Desarrollar una aplicación (web, móvil, escritorio) que interactúe con esta base de datos para permitir la gestión de cotizaciones.
* **API**: Implementar una API RESTful para facilitar la comunicación entre la base de datos y la aplicación.
* **Despliegue**: Planificar el despliegue de la base de datos y la aplicación en un entorno de producción.
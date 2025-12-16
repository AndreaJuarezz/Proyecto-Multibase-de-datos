# Ecommerce multibase de datos

## Descripción

Este proyecto es una aplicación de e-commerce que utiliza una arquitectura multi-base de datos para optimizar el rendimiento y la escalabilidad:
MySQL: Gestión de categorías, productos, inventario, órdenes y usuarios
MongoDB: Almacenamiento flexible de datos complejos y registro de transacciones
Redis: Implementación de carrito de compras con caché de alta velocidad

## Tecnologías
	- Node.js + Express.js
	- MySQL (mysql2/promise)
	- MongoDB (mongoose)
	- Redis (redis)
	- Dotenv para variables de entorno
	- Body Parser para procesamiento de datos
	- CORS para solicitudes entre dominios

## Requisitos Previos

## Instalación
1. Clonar el repositorio

```bash
git clone https://github.com/AndreaJuarezz/Proyecto-Multibase-de-datos.git
cd ecommerce-multibase
```

2. Instalar dependencias

```bash
npm install
```

3. Configurar variables de entorno

Crea el archivo `.env` en la raíz del proyecto:

```bash
# Configuración del Servidor
PORT=3000
NODE_ENV=development

# Configuración de MySQL
MYSQL_HOST=localhost
MYSQL_USER=root
MYSQL_PASSWORD=root123
MYSQL_DB=ecommerce
MYSQL_PORT=3306

# Configuración de MongoDB
MONGO_HOST=localhost
MONGO_PORT=27017

# Configuración de Redis
REDIS_HOST=localhost
REDIS_PORT=6379
```

4. Iniciar bases de datos con Docker

```bash
docker-compose up -d
```

Verificar contenedores activos:

```bash
docker ps
```

5. Crear tablas en MySQL

```sql
CREATE TABLE IF NOT EXISTS categorias (
    id INT PRIMARY KEY AUTO_INCREMENT,
    nombre VARCHAR(100) NOT NULL UNIQUE,
    descripcion TEXT,
    eliminado TINYINT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS productos (
    id INT PRIMARY KEY AUTO_INCREMENT,
    nombre VARCHAR(255) NOT NULL,
    descripcion TEXT,
    precio DECIMAL(10, 2) NOT NULL,
    categoria_id INT,
    stock INT DEFAULT 0,
    borrado TINYINT DEFAULT 0,
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (categoria_id) REFERENCES categorias(id)
);

CREATE TABLE IF NOT EXISTS usuarios (
    id INT PRIMARY KEY AUTO_INCREMENT,
    nombre VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    contrasena VARCHAR(255) NOT NULL,
    rol VARCHAR(50) DEFAULT 'usuario',
    activo TINYINT DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS pedidos (
    id INT PRIMARY KEY AUTO_INCREMENT,
    usuario_id INT,
    estado VARCHAR(50) DEFAULT 'pendiente',
    total DECIMAL(10, 2),
    fecha_pedido TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
);

CREATE TABLE IF NOT EXISTS inventario (
    id INT PRIMARY KEY AUTO_INCREMENT,
    producto_id INT UNIQUE,
    cantidad INT DEFAULT 0,
    ubicacion VARCHAR(255),
    activo TINYINT DEFAULT 1,
    actualizado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (producto_id) REFERENCES productos(id)
);

CREATE TABLE IF NOT EXISTS carrito (
    id INT AUTO_INCREMENT PRIMARY KEY,
    usuario_id VARCHAR(50) NOT NULL,
    borrado TINYINT DEFAULT 0,
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS carrito_items (
        id INT AUTO_INCREMENT PRIMARY KEY,
        carrito_id INT NOT NULL,
        producto_id INT NOT NULL,
        cantidad INT NOT NULL,
        borrado TINYINT DEFAULT 0,
        creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (carrito_id) REFERENCES carrito(id),
        FOREIGN KEY (producto_id) REFERENCES productos(id)
);
```


6. Iniciar el servidor

```bash
npm run dev
```

El servidor estará disponible en `http://localhost:3000`.

## Estructura del Proyecto

```
ecommerce-multibase/
│
├── src/
│   ├── app.js                          # Configuración principal de Express
│   ├── controllers/                    # Lógica de negocio
│   │   ├── categorias.controller.js
│   │   ├── productos.controller.js
│   │   ├── pedidos.controller.js
│   │   ├── inventario.controller.js
│   │   └── carrito.controller.js
│   ├── routes/                         # Definición de rutas
│   │   ├── categorias.routes.js
│   │   ├── productos.routes.js
│   │   ├── pedidos.routes.js
│   │   ├── inventario.routes.js
│   │   └── carrito.routes.js
│   ├── db/                             # Conexiones a bases de datos
│   │   ├── mysql.js                    # Configuración de MySQL
│   │   ├── mongo.js                    # Configuración de MongoDB
│   │   └── redis.js                    # Configuración de Redis
│   ├── middleware/                     # Middlewares de la app
│   │   └── error.middleware.js
│   └── usuarios/                       # Módulo de usuarios
│       ├── usuario.controller.js
│       ├── usuario.model.js
│       └── usuario.routes.js
│
├── server.js                           # Punto de entrada de la aplicación
├── docker-compose.yml                  # Configuración de Docker Compose
├── package.json                        # Dependencias del proyecto
├── package-lock.json                   # Bloqueo de dependencias
├── schema.sql                          # DDL de apoyo
├── .env                                # Variables de entorno (local)
└── README.md                           # Este archivo
```


## API Endpoints
- Base URL: `http://localhost:3000/api`

### Categorías
- `GET /categorias`
- `GET /categorias/:id`
- `POST /categorias`
- `PUT /categorias/:id`
- `DELETE /categorias/:id`

Ejemplo:

```http
POST /api/categorias HTTP/1.1
Host: localhost:3000
Content-Type: application/json

{
    "nombre": "Electrónica",
    "descripcion": "Productos electrónicos en general"
}
```

### Productos

- `GET /productos` - Obtener todos los productos activos
- `GET /productos/:id` - Obtener producto por ID
- `POST /productos` - Crear nuevo producto
- `PATCH /productos/:id` - Actualizar producto
- `DELETE /productos/:id` - Eliminar producto (soft delete)

```http
POST /api/productos HTTP/1.1
Host: localhost:3000
Content-Type: application/json

{
    "nombre": "Laptop Dell",
    "descripcion": "Laptop de 15 pulgadas",
    "precio": 999.99,
    "categoria_id": 1,
    "stock": 50
}
```

### Carrito

- `GET /carrito/:usuarioId` - Obtener carrito de un usuario
- `POST /carrito/:usuarioId/items` - Agregar o incrementar producto en el carrito
- `DELETE /carrito/:usuarioId/items/:productoId` - Eliminar un producto del carrito
- `DELETE /carrito/:usuarioId` - Vaciar carrito completo

```http
POST /api/carrito/1/items HTTP/1.1
Host: localhost:3000
Content-Type: application/json

{
    "producto_id": 1,
    "cantidad": 2
}
```

### Pedidos

- `GET /pedidos` - Obtener todos los pedidos activos
- `GET /pedidos/:id` - Obtener pedido por ID
- `POST /pedidos` - Crear nuevo pedido
- `PATCH /pedidos/:id` - Actualizar estado del pedido
- `DELETE /pedidos/:id` - Eliminar pedido (soft delete)

```http
POST /api/pedidos HTTP/1.1
Host: localhost:3000
Content-Type: application/json

{
    "usuario_id": 1,
    "estado": "pendiente"
}
```

### Inventario

- `GET /inventario` - Obtener existencias activas
- `GET /inventario/:productoId` - Obtener stock de un producto
- `POST /inventario/ajustar` - Crear o ajustar existencias
- `PATCH /inventario/:productoId` - Actualizar ubicación/stock
- `DELETE /inventario/:productoId` - Eliminar inventario (soft delete)

```http
POST /api/inventario/ajustar HTTP/1.1
Host: localhost:3000
Content-Type: application/json

{
    "producto_id": 1,
    "cantidad": 50,
    "ubicacion": "Almacén A"
}
```

### Usuarios

- `GET /usuarios` - Listar usuarios
- `GET /usuarios/:id` - Obtener usuario por ID
- `POST /usuarios` - Crear usuario
- `PATCH /usuarios/:id` - Actualizar usuario
- `DELETE /usuarios/:id` - Eliminar usuario (soft delete)

```http
POST /api/usuarios HTTP/1.1
Host: localhost:3000
Content-Type: application/json

{
    "nombre": "Juan Pérez",
    "email": "juan@example.com",
    "contrasena": "password123"
}
```

## Bases de Datos
- MySQL: Categorías, Productos, Usuarios, Pedidos, Inventario
- MongoDB: Historial de transacciones, Logs, Datos de análisis
- Redis: Carrito de compras, Sesiones, Caché

## Uso de Redis como Caché

Para mejorar el rendimiento de las consultas, Redis se utiliza como caché en los endpoints de lectura:

- `src/routes/categorias.routes.js`:
    - `GET /api/categorias` cachea la lista en la clave `categorias:list` (TTL 120s).
    - `GET /api/categorias/:id` cachea por clave `categorias:id:<id>` (TTL 300s).
    - Al crear/actualizar/eliminar categorías se invalidan las claves relacionadas.

- `src/controllers/productos.controller.js`:
    - `GET /api/productos` cachea el listado bajo la clave `productos_all` (TTL 3600s).
    - Al crear/actualizar/eliminar productos se invalida `productos_all`.

## Contribuidores
- Andrea Juárez
- Emiliano Santos
- Frida Milanes
- Estudiantes de Ingeniería Informática - 7° Semestre
- Proyecto Final: Tópicos de Base de Datos

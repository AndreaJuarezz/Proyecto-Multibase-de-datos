## Descripción

Este proyecto es una aplicación de e-commerce que utiliza una arquitectura multi-base de datos para optimizar el rendimiento y la escalabilidad:

- **MySQL**: Gestión de categorías, productos, inventario, órdenes y usuarios
- **MongoDB**: Almacenamiento flexible de datos complejos y registro de transacciones
- **Redis**: Implementación de carrito de compras con caché de alta velocidad

## Tecnologías

### Backend
- Node.js + Express.js
- MySQL (mysql2/promise)
- MongoDB (mongoose)
- Redis (redis)
- Dotenv para variables de entorno
- Body Parser para procesamiento de datos
- CORS para solicitudes entre dominios

---

## 📦 Requisitos Previos

Asegúrate de tener instalado:

- [Node.js](https://nodejs.org/) (versión 14 o superior)
- [Docker](https://www.docker.com/) y Docker Compose
- [Git](https://git-scm.com/)
- Un cliente REST como [Postman](https://www.postman.com/) 

---

## 🚀 Instalación

### 1. Clonar el repositorio

```bash
git clone https://github.com/AndreaJuarezz/Proyecto-Multibase-de-datos.git
cd ecommerce-multibase
```

### 2. Instalar dependencias

```bash
npm install
```

### 3. Configurar variables de entorno

Crea o edita el archivo `.env` en la raíz del proyecto:

```env
# MySQL
MYSQL_HOST=localhost
MYSQL_USER=root
MYSQL_PASSWORD=root123
MYSQL_DB=ecommerce
MYSQL_PORT=3306

# Puerto del servidor
PORT=3000
```

## Requisitos Previos

- Node.js v18 o superior
- MySQL 8.0 o superior
- Docker y Docker Compose
- Git
- Postman (para pruebas de API)

## Instalación

### 1. Clonar el repositorio

```bash
git clone https://github.com/AndreaJuarezz/Proyecto-Multibase-de-datos.git
cd ecommerce-multibase
```

### 2. Instalar dependencias

```bash
npm install
```

### 3. Configurar variables de entorno

Copiar o crear el archivo `.env` en la raíz del proyecto:

```env
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

### 4. Iniciar bases de datos con Docker

```bash
docker-compose up -d
```

Verificar que los contenedores estén corriendo:

```bash
docker ps
```

Deberías ver:
- `mysql_multibase` en puerto 3306
- `mongo_multibase` en puerto 27017
- `redis_multibase` en puerto 6379

### 5. Crear tablas en MySQL

Conectarse a MySQL y ejecutar el siguiente script:

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

### 6. Iniciar el servidor

En modo desarrollo:

```bash
npm run dev
```

En modo producción:

```bash
node server.js
```

El servidor estará disponible en: `http://localhost:3000`

## Estructura del Proyecto

```
ecommerce-multibase/
│
├── src/
│   ├── app.js                          # Configuración principal de Express
│   │
│   ├── controllers/                    # Lógica de negocio
│   │   ├── categorias.controller.js
│   │   ├── productos.controller.js
│   │   ├── pedidos.controller.js
│   │   ├── inventario.controller.js
│   │   └── carrito.controller.js
│   │
│   ├── routes/                         # Definición de rutas
│   │   ├── categorias.routes.js
│   │   ├── productos.routes.js
│   │   ├── pedidos.routes.js
│   │   ├── inventario.routes.js
│   │   └── carrito.routes.js
│   │
│   ├── db/                             # Conexiones a bases de datos
│   │   ├── mysql.js                    # Configuración de MySQL
│   │   ├── mongo.js                    # Configuración de MongoDB
│   │   └── redis.js                    # Configuración de Redis
│   │
│   └── usuarios/                       # Módulo de usuarios
│       ├── usuarios.controller.js
│       ├── usuarios.model.js
│       └── usuario.routes.js
│
├── server.js                           # Punto de entrada de la aplicación
├── docker-compose.yml                  # Configuración de Docker Compose
├── package.json                        # Dependencias del proyecto
├── .env                                # Variables de entorno
└── README.md                           # Este archivo
```

## API Endpoints

### Base URL
```
http://localhost:3000/api
```

### Categorías

- `GET /categorias` - Obtener todas las categorías activas
- `GET /categorias/:id` - Obtener categoría por ID
- `POST /categorias` - Crear nueva categoría
- `PUT /categorias/:id` - Actualizar categoría
- `DELETE /categorias/:id` - Eliminar categoría (soft delete)

**Ejemplo - Crear categoría:**
```bash
POST http://localhost:3000/api/categorias
Content-Type: application/json

{
    "nombre": "Electrónica",
    "descripcion": "Productos electrónicos en general"
}
```

**Ejemplo - Respuesta:**
```json
{
    "id": 1,
    "nombre": "Electrónica",
    "descripcion": "Productos electrónicos en general",
    "eliminado": 0,
    "created_at": "2024-12-08T10:30:00Z"
}
```

### Productos

- `GET /productos` - Obtener todos los productos activos
- `GET /productos/:id` - Obtener producto por ID
- `POST /productos` - Crear nuevo producto
- `PATCH /productos/:id` - Actualizar producto
- `DELETE /productos/:id` - Eliminar producto (soft delete)

**Ejemplo - Crear producto:**
```bash
POST http://localhost:3000/api/productos
Content-Type: application/json

{
    "nombre": "Laptop Dell",
    "descripcion": "Laptop de 15 pulgadas",
    "precio": 999.99,
    "categoria_id": 1,
    "stock": 50
}
```

**Ejemplo - Respuesta:**
```json
{
    "id": 1,
    "nombre": "Laptop Dell",
    "descripcion": "Laptop de 15 pulgadas",
    "precio": 999.99,
    "categoria_id": 1,
    "categoria_nombre": "Electrónica",
    "stock": 50,
    "borrado": 0,
    "creado_en": "2024-12-08T10:30:00Z"
}
```

### Carrito (Redis + MySQL)

- `GET /carrito/:usuarioId` - Obtener carrito del usuario
- `POST /carrito/:usuarioId/items` - Agregar producto al carrito (suma cantidades)
- `DELETE /carrito/:usuarioId/items/:productoId` - Eliminar producto del carrito
- `DELETE /carrito/:usuarioId` - Vaciar carrito

**Ejemplo - Agregar al carrito:**
```bash
POST http://localhost:3000/api/carrito/1/items
Content-Type: application/json

{
    "producto_id": 1,
    "cantidad": 2
}
```

### Pedidos

- `GET /pedidos` - Obtener todos los pedidos
- `GET /pedidos/:id` - Obtener pedido por ID
- `POST /pedidos` - Crear nuevo pedido
- `PATCH /pedidos/:id` - Actualizar estado del pedido

**Ejemplo - Crear pedido:**
```bash
POST http://localhost:3000/api/pedidos
Content-Type: application/json

{
    "usuario_id": 1,
    "estado": "pendiente"
}
```

### Inventario

- `GET /inventario` - Obtener todo el inventario
- `GET /inventario/:productoId` - Obtener stock de un producto
- `PATCH /inventario/:productoId` - Actualizar stock

**Ejemplo - Actualizar stock:**
```bash
PATCH http://localhost:3000/api/inventario/1
Content-Type: application/json

{
    "cantidad": 30
}
```

### Usuarios

- `GET /usuarios` - Obtener todos los usuarios
- `GET /usuarios/:id` - Obtener usuario por ID
- `POST /usuarios` - Crear nuevo usuario
- `PUT /usuarios/:id` - Actualizar usuario
- `DELETE /usuarios/:id` - Eliminar usuario

**Ejemplo - Crear usuario:**
```bash
POST http://localhost:3000/api/usuarios
Content-Type: application/json

{
    "nombre": "Juan Pérez",
    "email": "juan@example.com",
    "contrasena": "password123"
}
```

## Bases de Datos

### MySQL
Base de datos relacional para almacenar datos estructurados:
- Categorías de productos
- Productos con relación a categorías
- Información de usuarios
- Pedidos y sus detalles
- Control de inventario

### MongoDB
Base de datos NoSQL para datos flexibles:
- Historial de transacciones
- Detalles complejos de órdenes
- Logs de actividades
- Datos de análisis

### Redis
Caché en memoria para rendimiento:
- Carrito de compras del usuario
- Sesiones de usuario
- Datos temporales
- Cache de consultas frecuentes

## Solución de Problemas

### Error de conexión a MySQL

Verificar que MySQL esté corriendo:

```bash
docker ps
docker logs mysql_multibase
```

Verificar credenciales en `.env`:
```bash
mysql -h localhost -u root -p -D ecommerce
```

### Error de conexión a MongoDB

Verificar estado del contenedor:

```bash
docker ps
docker logs mongo_multibase
```

### Error de conexión a Redis

Verificar que Redis esté en ejecución:

```bash
docker ps
docker logs redis_multibase
```

### Puerto 3000 ya está en uso

Cambiar el puerto en `.env`:

```env
PORT=3001
```

O matar el proceso que usa el puerto:

```bash
# En Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# En Linux/Mac
lsof -i :3000
kill -9 <PID>
```

### Error: "Cannot POST /api/productos"

Verificar que:
1. El servidor esté corriendo
2. Las rutas estén registradas en `src/app.js`
3. El método HTTP sea correcto (POST vs GET)
4. La URL sea exacta

## Contribuidores

- **Andrea Juárez**
- **Emiliano Santos**
- **Frida Milanes**

Estudiantes de Ingeniería Informática - 7° Semestre

Proyecto Final: Tópicos de Base de Datos


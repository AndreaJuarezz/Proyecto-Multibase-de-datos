// src/middleware/error.middleware.js

/**
 * 1. Middleware para manejar Rutas No Encontradas (404)
 * Esta función se ejecuta si ninguna ruta en app.js coincide con la petición.
 */
exports.notFound = (req, res, next) => {
    // Crea un nuevo error
    const error = new Error(`Ruta No Encontrada - ${req.originalUrl}`);
    res.status(404);
    // Pasa el error al siguiente middleware (el manejador de errores)
    next(error);
};

/**
 * 2. Middleware para Manejo de Errores Generales (500)
 * Esta función maneja cualquier error pasado por 'next(error)' o errores lanzados en el servidor.
 * La firma (err, req, res, next) es especial para que Express la reconozca como middleware de error.
 */
exports.errorHandler = (err, req, res, next) => {
    // Determina el código de estado, si ya se envió un 404 o es un error 500
    const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
    res.status(statusCode);

    // Responde con un objeto JSON que contiene la información del error
    res.json({
        message: err.message,
        // En desarrollo, mostramos el stack (trazabilidad) del error. En producción, no se debe mostrar.
        stack: process.env.NODE_ENV === 'production' ? null : err.stack,
    });
};
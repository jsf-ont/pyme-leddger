class AppError extends Error {
  constructor(message, statusCode = 500) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

class ValidationError extends AppError {
  constructor(message) {
    super(message, 400);
  }
}

class UnauthorizedError extends AppError {
  constructor(message = 'No autorizado') {
    super(message, 401);
  }
}

class ForbiddenError extends AppError {
  constructor(message = 'Acceso prohibido') {
    super(message, 403);
  }
}

class NotFoundError extends AppError {
  constructor(message = 'Recurso no encontrado') {
    super(message, 404);
  }
}

const errorLogger = (err, req, res, next) => {
  const timestamp = new Date().toISOString();
  const logEntry = {
    timestamp,
    method: req.method,
    url: req.originalUrl,
    status: err.statusCode || 500,
    message: err.message,
    stack: err.stack,
  };

  if (process.env.LOG_LEVEL === 'debug') {
    console.error('[ERROR]', JSON.stringify(logEntry, null, 2));
  } else {
    console.error(`[${timestamp}] ${req.method} ${req.originalUrl} - ${err.statusCode || 500}: ${err.message}`);
  }
};

const errorHandler = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  if (process.env.NODE_ENV === 'development') {
    res.status(err.statusCode).json({
      status: err.status,
      statusCode: err.statusCode,
      message: err.message,
      stack: err.stack,
      errors: err.errors || null,
    });
  } else {
    if (err.isOperational) {
      res.status(err.statusCode).json({
        status: err.status,
        statusCode: err.statusCode,
        message: err.message,
      });
    } else {
      console.error('OPERATIONAL ERROR:', err);
      res.status(500).json({
        status: 'error',
        statusCode: 500,
        message: 'Error interno del servidor',
      });
    }
  }
};

const notFoundHandler = (req, res, next) => {
  const err = new NotFoundError(`Ruta ${req.originalUrl} no encontrada`);
  next(err);
};

const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = {
  AppError,
  ValidationError,
  UnauthorizedError,
  ForbiddenError,
  NotFoundError,
  errorLogger,
  errorHandler,
  notFoundHandler,
  asyncHandler,
};

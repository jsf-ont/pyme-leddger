export class ApiError extends Error {
  constructor(message, status = 500, data = null) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

export const getErrorMessage = (error) => {
  if (error instanceof ApiError) {
    return error.message;
  }

  if (error?.response?.data?.error) {
    return error.response.data.error;
  }

  if (error?.message) {
    return error.message;
  }

  return 'Ha ocurrido un error inesperado';
};

export const getErrorStatus = (error) => {
  if (error instanceof ApiError) {
    return error.status;
  }

  if (error?.response?.status) {
    return error.response.status;
  }

  return 500;
};

export const isAuthError = (error) => {
  const status = getErrorStatus(error);
  return status === 401 || status === 403;
};

export const isValidationError = (error) => {
  const status = getErrorStatus(error);
  return status === 400;
};

export const isNotFoundError = (error) => {
  const status = getErrorStatus(error);
  return status === 404;
};

export const handleApiError = (error, actions = {}) => {
  const message = getErrorMessage(error);
  const status = getErrorStatus(error);

  if (isAuthError(error)) {
    if (actions.onAuthError) {
      actions.onAuthError(message);
    } else {
      localStorage.removeItem('beanpcge_token');
      window.location.href = '/login';
    }
    return;
  }

  if (actions.onError) {
    actions.onError(message, status);
  }

  return { message, status };
};

export const errorMessages = {
  network: 'Error de conexión. Verifica tu conexión a internet.',
  server: 'Error del servidor. Intenta más tarde.',
  unauthorized: 'Sesión expirada. Por favor, inicia sesión nuevamente.',
  forbidden: 'No tienes permiso para realizar esta acción.',
  notFound: 'Recurso no encontrado.',
  validation: 'Por favor, verifica los datos ingresados.',
  unknown: 'Ha ocurrido un error inesperado.',
};

export const getUserFriendlyError = (error) => {
  const status = getErrorStatus(error);

  switch (status) {
    case 0:
      return errorMessages.network;
    case 400:
      return error.response?.data?.error || errorMessages.validation;
    case 401:
      return errorMessages.unauthorized;
    case 403:
      return errorMessages.forbidden;
    case 404:
      return errorMessages.notFound;
    case 500:
    case 502:
    case 503:
      return errorMessages.server;
    default:
      return getErrorMessage(error);
  }
};

export class AppError {
  public statusCode: number;
  public friendlyMessage: string;
  public validationErrors?: string[];

  constructor(originalError: any) {
    // 1. Caso: Error de Red o de Conexión (El backend está apagado o no hay internet)
    if (!originalError.response) {
      this.statusCode = 503;
      this.friendlyMessage = 'No se pudo conectar con el servidor. Por favor, verifica tu conexión a internet o que el backend esté encendido.';
      return;
    }

    // 2. Caso: Respuesta de la API con código HTTP
    const status = originalError.response.status;
    const data = originalError.response.data;

    this.statusCode = status;

    // NestJS devuelve los errores de validación de campos en response.data.message (como array de strings)
    if (data && data.message) {
      this.validationErrors = Array.isArray(data.message) ? data.message : [data.message];
    }

    // Mapear los estados HTTP comunes a mensajes en español y amigables
    switch (status) {
      case 400:
        this.friendlyMessage = 'Los datos enviados son incorrectos. Por favor, revisa los campos e intenta de nuevo.';
        break;
      case 401:
        this.friendlyMessage = 'Tu sesión ha expirado o no tienes autorización. Por favor, inicia sesión de nuevo.';
        break;
      case 403:
        this.friendlyMessage = 'No tienes los permisos necesarios para realizar esta acción.';
        break;
      case 404:
        this.friendlyMessage = 'El recurso solicitado no existe o no fue encontrado.';
        break;
      case 409:
        this.friendlyMessage = 'Este registro ya existe en el sistema.';
        break;
      case 500:
        this.friendlyMessage = 'Ocurrió un error interno en el servidor. Por favor, reporta el problema.';
        break;
      default:
        this.friendlyMessage = (data && data.error) || 'Ocurrió un error inesperado. Inténtalo de nuevo.';
    }
  }
}

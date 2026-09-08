export class AppError extends Error {
  readonly code: string;
  readonly httpStatus: number;

  constructor(code: string, message: string, httpStatus: number) {
    super(message);
    this.name = this.constructor.name;
    this.code = code;
    this.httpStatus = httpStatus;
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = "No autenticado") {
    super("UNAUTHORIZED", message, 401);
  }
}

export class ForbiddenError extends AppError {
  constructor(message = "No autorizado") {
    super("FORBIDDEN", message, 403);
  }
}

export class ValidationError extends AppError {
  constructor(message = "Datos inválidos") {
    super("VALIDATION", message, 400);
  }
}

export class NotFoundError extends AppError {
  constructor(message = "No encontrado") {
    super("NOT_FOUND", message, 404);
  }
}

export class ConflictError extends AppError {
  constructor(message = "Conflicto") {
    super("CONFLICT", message, 409);
  }
}

export function publicErrorMessage(error: unknown): string {
  if (error instanceof AppError) {
    return error.message;
  }
  return "Ha ocurrido un error. Intente de nuevo.";
}

/**
 * Classe base para erros customizados da aplicação
 */
export class AppError extends Error {
  public readonly statusCode: number;
  public readonly code: string;
  public readonly isOperational: boolean;

  constructor(
    message: string,
    statusCode: number = 500,
    code: string = 'INTERNAL_ERROR',
    isOperational: boolean = true
  ) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.isOperational = isOperational;

    // Mantém o stack trace correto
    Error.captureStackTrace(this, this.constructor);
    
    // Define o nome da classe
    this.name = this.constructor.name;
  }

  /**
   * Verifica se o erro é uma instância de AppError
   */
  static isAppError(error: unknown): error is AppError {
    return error instanceof AppError;
  }

  /**
   * Converte um erro desconhecido para AppError
   */
  static fromUnknown(error: unknown, defaultMessage: string = 'Erro interno do servidor'): AppError {
    if (AppError.isAppError(error)) {
      return error;
    }

    if (error instanceof Error) {
      return new AppError(error.message, 500, 'INTERNAL_ERROR');
    }

    return new AppError(defaultMessage, 500, 'INTERNAL_ERROR');
  }
}

/**
 * Erro de autenticação
 */
export class AuthenticationError extends AppError {
  constructor(message: string = 'Email ou senha incorretos') {
    super(message, 401, 'INVALID_CREDENTIALS');
  }
}

/**
 * Erro de autorização
 */
export class AuthorizationError extends AppError {
  constructor(message: string = 'Token inválido ou expirado') {
    super(message, 401, 'INVALID_TOKEN');
  }
}

/**
 * Erro de validação
 */
export class ValidationError extends AppError {
  constructor(message: string = 'Dados inválidos') {
    super(message, 400, 'VALIDATION_ERROR');
  }
}

/**
 * Erro de recurso não encontrado
 */
export class NotFoundError extends AppError {
  constructor(message: string = 'Recurso não encontrado') {
    super(message, 404, 'NOT_FOUND');
  }
}

/**
 * Erro de conflito (recurso já existe)
 */
export class ConflictError extends AppError {
  constructor(message: string = 'Recurso já existe', code: string = 'CONFLICT') {
    super(message, 409, code);
  }
}


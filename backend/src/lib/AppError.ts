export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: ApiError;
}

export interface ApiError {
  name: string;
  code: number;
  message: string;
}

export class AppError extends Error {
  statusCode: number;

  constructor(message: string, statusCode = 500) {
    super(message);
    this.name = 'AppError';
    this.statusCode = statusCode;
  }

  static notFound(resource: string): AppError {
    return new AppError(`${resource} not found`, 404);
  }
}

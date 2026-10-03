export type Result<T, E = AppError> = { success: true; data: T } | { success: false; error: E };

export interface IErrorDetail {
  field: string;
  message: string;
}

export type AppError =
  | { code: 'VALIDATION_ERROR'; message: string; details?: IErrorDetail[] }
  | { code: 'EMAIL_CONFLICT'; message: string }
  | { code: 'INTERNAL_ERROR'; message: string };

export const Result = {
  success<T>(data: T): Result<T, never> {
    return { success: true, data };
  },
  failure<E>(error: E): Result<never, E> {
    return { success: false, error };
  },
};

export const internalError = (): AppError => ({
  code: 'INTERNAL_ERROR',
  message: 'Internal server error',
});
export const emailConflict = (): AppError => ({
  code: 'EMAIL_CONFLICT',
  message: 'User with this email already exists',
});

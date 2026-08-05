// src/lib/error-handler.ts
import { AxiosError } from 'axios';

export interface ApiError {
  message: string;
  status: number;
  errors?: Record<string, string[]>;
}

export function handleApiError(error: unknown): ApiError {
  if (error instanceof AxiosError) {
    const status = error.response?.status || 500;
    const data = error.response?.data as any;

    // Jika backend mengembalikan error message
    if (data?.message) {
      return {
        message: data.message,
        status,
        errors: data.errors,
      };
    }

    // Jika ada validation errors (Laravel)
    if (data?.errors) {
      // ✅ Perbaiki: Gunakan Object.values dengan aman
      const errorMessages = data.errors as Record<string, string[]>;
      const firstError = Object.values(errorMessages)[0]?.[0] || 'Validation error';
      return {
        message: firstError,
        status: 422,
        errors: data.errors,
      };
    }

    // Error network / connection
    if (error.code === 'ERR_NETWORK') {
      return {
        message: 'Koneksi ke server gagal. Periksa koneksi internet Anda.',
        status: 0,
      };
    }

    return {
      message: error.message || 'Terjadi kesalahan pada server.',
      status,
    };
  }

  // Error yang tidak diketahui
  if (error instanceof Error) {
    return {
      message: error.message || 'Terjadi kesalahan yang tidak diketahui.',
      status: 500,
    };
  }

  return {
    message: 'Terjadi kesalahan yang tidak diketahui.',
    status: 500,
  };
}

export function getErrorMessage(error: unknown): string {
  return handleApiError(error).message;
}

export function getValidationErrors(error: unknown): Record<string, string[]> | undefined {
  return handleApiError(error).errors;
}
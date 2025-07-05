// Error handling utilities for API calls and general error management

export interface ApiError {
  message: string;
  status?: number;
  code?: string;
  details?: any;
}

export class AppError extends Error {
  status?: number;
  code?: string;
  details?: any;

  constructor(message: string, status?: number, code?: string, details?: any) {
    super(message);
    this.name = 'AppError';
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

// Generic error handler for async operations
export const handleAsyncError = async <T>(
  operation: () => Promise<T>,
  errorMessage: string = 'An error occurred'
): Promise<T> => {
  try {
    return await operation();
  } catch (error) {
    console.error('Async operation failed:', error);
    
    if (error instanceof AppError) {
      throw error;
    }
    
    if (error instanceof Error) {
      throw new AppError(error.message);
    }
    
    throw new AppError(errorMessage);
  }
};

// API error handler
export const handleApiError = (error: any): ApiError => {
  if (error.response) {
    // Server responded with error status
    return {
      message: error.response.data?.message || 'Server error occurred',
      status: error.response.status,
      code: error.response.data?.code,
      details: error.response.data?.details,
    };
  } else if (error.request) {
    // Request was made but no response received
    return {
      message: 'Network error - please check your connection',
      code: 'NETWORK_ERROR',
    };
  } else {
    // Something else happened
    return {
      message: error.message || 'An unexpected error occurred',
      code: 'UNKNOWN_ERROR',
    };
  }
};

// Validation error handler
export const handleValidationError = (errors: any[]): string => {
  if (Array.isArray(errors) && errors.length > 0) {
    return errors.map(err => err.message || err).join(', ');
  }
  return 'Validation failed';
};

// LocalStorage error handler
export const handleStorageError = (error: any): string => {
  if (error.name === 'QuotaExceededError') {
    return 'Storage quota exceeded. Please clear some data and try again.';
  }
  if (error.name === 'SecurityError') {
    return 'Storage access denied. Please check your browser settings.';
  }
  return 'Failed to access local storage';
};

// File operation error handler
export const handleFileError = (error: any): string => {
  if (error.name === 'NotFoundError') {
    return 'File not found';
  }
  if (error.name === 'SecurityError') {
    return 'File access denied';
  }
  if (error.name === 'TypeMismatchError') {
    return 'Invalid file type';
  }
  return 'File operation failed';
};

// Generic error message formatter
export const formatErrorMessage = (error: any): string => {
  if (typeof error === 'string') {
    return error;
  }
  
  if (error instanceof AppError) {
    return error.message;
  }
  
  if (error instanceof Error) {
    return error.message;
  }
  
  if (error?.message) {
    return error.message;
  }
  
  return 'An unexpected error occurred';
};

// Error retry utility
export const retryOperation = async <T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  delay: number = 1000
): Promise<T> => {
  let lastError: any;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;
      
      if (attempt === maxRetries) {
        throw error;
      }
      
      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, delay * attempt));
    }
  }
  
  throw lastError;
};

// Error logging utility
export const logError = (error: any, context?: string): void => {
  const errorInfo = {
    message: formatErrorMessage(error),
    timestamp: new Date().toISOString(),
    context,
    stack: error?.stack,
    details: error,
  };
  
  // In development, log to console
  if (process.env.NODE_ENV === 'development') {
    console.error('Error logged:', errorInfo);
  }
  
  // In production, you might want to send to an error tracking service
  // Example: sendToErrorTrackingService(errorInfo);
};
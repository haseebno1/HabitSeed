import { toast } from "sonner";
import { StorageError } from "./storage/index";

/**
 * ErrorType defines the categories of errors that can occur in the application
 */
export enum ErrorType {
  Storage = "storage",
  Network = "network",
  UserInput = "userInput",
  Application = "application",
  Unknown = "unknown"
}

/**
 * AppError is the standardized error class used throughout the application
 */
export class AppError extends Error {
  constructor(
    message: string,
    public readonly type: ErrorType = ErrorType.Unknown,
    public readonly originalError?: Error,
    public readonly data?: any
  ) {
    super(message);
    this.name = "AppError";
    
    // Ensure the stack trace includes the cause
    if (originalError && originalError.stack) {
      this.stack = `${this.stack}\nCaused by: ${originalError.stack}`;
    }
  }
  
  /**
   * Create an AppError from a StorageError
   */
  static fromStorageError(error: StorageError): AppError {
    return new AppError(
      `Storage operation '${error.operation}' failed: ${error.message}`,
      ErrorType.Storage,
      error
    );
  }
  
  /**
   * Create an AppError from a network error
   */
  static fromNetworkError(error: Error, url?: string): AppError {
    return new AppError(
      `Network request ${url ? `to ${url}` : ""} failed: ${error.message}`,
      ErrorType.Network,
      error,
      { url }
    );
  }
  
  /**
   * Create an AppError from a user input error
   */
  static fromUserInputError(message: string, fieldName?: string): AppError {
    return new AppError(
      message,
      ErrorType.UserInput,
      undefined,
      { fieldName }
    );
  }
}

/**
 * ErrorHandler provides utility functions for handling errors in a standardized way
 */
export const ErrorHandler = {
  /**
   * Log an error to the console with consistent formatting
   */
  logError(error: Error, context?: string): void {
    const appError = error instanceof AppError ? error : new AppError(error.message, ErrorType.Unknown, error);
    
    console.error(
      `[ERROR]${context ? ` [${context}]` : ""} ${appError.message}`,
      {
        type: appError instanceof AppError ? appError.type : ErrorType.Unknown,
        originalError: appError.originalError,
        data: appError instanceof AppError ? appError.data : undefined,
        stack: appError.stack
      }
    );
  },
  
  /**
   * Handle an error by logging it and showing a toast notification
   */
  handleError(error: Error, context?: string): void {
    this.logError(error, context);
    
    // Determine appropriate user-facing message based on error type
    let message = "An unexpected error occurred";
    
    if (error instanceof AppError) {
      switch (error.type) {
        case ErrorType.Storage:
          message = "Failed to save or load your data";
          break;
        case ErrorType.Network:
          message = "Network request failed";
          break;
        case ErrorType.UserInput:
          message = error.message; // Use the original message for user input errors
          break;
        case ErrorType.Application:
          message = "The application encountered a problem";
          break;
      }
    }
    
    // Show toast notification
    toast.error(message, {
      description: error instanceof AppError && error.type === ErrorType.UserInput 
        ? undefined 
        : "Please try again or restart the app if the problem persists."
    });
  },
  
  /**
   * Safely execute a function with error handling
   */
  async executeWithErrorHandling<T>(
    operation: () => Promise<T>,
    context?: string,
    fallbackValue?: T
  ): Promise<T> {
    try {
      return await operation();
    } catch (error) {
      const appError = error instanceof Error
        ? error instanceof AppError
          ? error
          : error instanceof StorageError
            ? AppError.fromStorageError(error)
            : new AppError(error.message, ErrorType.Unknown, error)
        : new AppError(String(error));
      
      this.handleError(appError, context);
      
      if (fallbackValue !== undefined) {
        return fallbackValue;
      }
      
      throw appError;
    }
  }
}; 
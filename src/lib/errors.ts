/* eslint-disable @typescript-eslint/no-explicit-any */
export class AppError extends Error {
  public statusCode: number;
  public isOperational: boolean;

  constructor(message: string, statusCode = 500, isOperational = true) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    Object.setPrototypeOf(this, new.target.prototype);
    Error.captureStackTrace(this);
  }
}

export class ValidationError extends AppError {
  constructor(message: string) {
    super(message, 400);
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = "Unauthorized access") {
    super(message, 401);
  }
}

export class NotFoundError extends AppError {
  constructor(message = "Resource not found") {
    super(message, 404);
  }
}

export type ActionResponse<T = any> = 
  | { success: true; data: T }
  | { success: false; error: string; statusCode?: number };

export async function withErrorHandling<T>(
  action: () => Promise<T>
): Promise<ActionResponse<T>> {
  try {
    const data = await action();
    return { success: true, data };
  } catch (error: any) {
    console.error("[Action Error]:", error);
    
    if (error instanceof AppError) {
      return { success: false, error: error.message, statusCode: error.statusCode };
    }
    
    if (error?.name === "ZodError") {
      const messages = error.errors.map((e: any) => e.message).join(", ");
      return { success: false, error: messages, statusCode: 400 };
    }

    return { success: false, error: "An unexpected error occurred", statusCode: 500 };
  }
}

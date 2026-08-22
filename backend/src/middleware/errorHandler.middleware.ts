import { Request, Response, NextFunction } from "express";
import { ZodError } from "zod";
import { Prisma } from "@prisma/client";

export class AppError extends Error {
  statusCode: number;
  errors?: any[];

  constructor(message: string, statusCode = 400, errors?: any[]) {
    super(message);
    this.statusCode = statusCode;
    this.errors = errors;
    Object.setPrototypeOf(this, AppError.prototype);
  }
}

export function errorHandler(
  err: any,
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  next: NextFunction
) {
  if (process.env.NODE_ENV === "development") {
    console.error(`[ERROR] ${req.method} ${req.originalUrl}:`, err);
  } else {
    console.error(`[ERROR] ${req.method} ${req.originalUrl}:`, err.message);
  }

  // Zod validation errors (field-level errors)
  if (err instanceof ZodError) {
    const formattedErrors = err.errors.map((e) => ({
      field: e.path.join("."),
      message: e.message,
    }));
    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors: formattedErrors,
    });
  }

  // Prisma unique constraint violation (P2002)
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === "P2002") {
      const target = Array.isArray(err.meta?.target)
        ? (err.meta?.target as string[]).join(", ")
        : (err.meta?.target as string) || "field";
      return res.status(409).json({
        success: false,
        message: `Duplicate entry for: ${target}`,
      });
    }

    if (err.code === "P2025") {
      return res.status(404).json({
        success: false,
        message: "Resource not found",
      });
    }
  }

  // AppError (Custom application error)
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
      ...(err.errors ? { errors: err.errors } : {}),
    });
  }

  // SyntaxError from body-parser
  if (err instanceof SyntaxError && "body" in err) {
    return res.status(400).json({
      success: false,
      message: "Malformed JSON payload",
    });
  }

  // Fallback 500 error
  const status = err.statusCode || 500;
  return res.status(status).json({
    success: false,
    message: err.message || "Internal server error",
  });
}

export function notFound(req: Request, res: Response) {
  return res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`,
  });
}

import type { Request, Response, NextFunction } from "express";
import httpStatus from "http-status";
import { AppError, type ApiError } from "../lib/AppError";

export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  if (err instanceof AppError) {
    const apiErr: ApiError = {
      name: err.name,
      code: err.statusCode,
      message: err.message,
    };
    res.status(err.statusCode).json({ success: false, error: apiErr });
    return;
  }

  console.error("[errorHandler] Unhandled error:", err);
  const apiErr: ApiError = {
    name: "INTERNAL_ERROR",
    code: httpStatus.INTERNAL_SERVER_ERROR,
    message: "Internal server error",
  };
  res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ success: false, error: apiErr });
}

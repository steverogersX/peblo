import type { Request, Response, NextFunction } from "express";
import httpStatus from "http-status";
import { DatabaseError } from "pg";
import { AppError, type ApiError, type ApiResponse } from "../lib/AppError";

// SQLSTATE codes → user-facing message + HTTP status
const PG_ERROR_MAP: Record<string, { status: number; message: string }> = {
  "23505": { status: httpStatus.CONFLICT,             message: "A record with that value already exists." },
  "23503": { status: httpStatus.BAD_REQUEST,          message: "Referenced record does not exist." },
  "23502": { status: httpStatus.BAD_REQUEST,          message: "A required field is missing." },
  "23514": { status: httpStatus.BAD_REQUEST,          message: "The value violates a data constraint." },
  "08000": { status: httpStatus.SERVICE_UNAVAILABLE,  message: "Database connection error." },
  "08003": { status: httpStatus.SERVICE_UNAVAILABLE,  message: "Database connection does not exist." },
  "08006": { status: httpStatus.SERVICE_UNAVAILABLE,  message: "Database connection failure." },
  "57P01": { status: httpStatus.SERVICE_UNAVAILABLE,  message: "Database connection was terminated." },
  "42P01": { status: httpStatus.INTERNAL_SERVER_ERROR, message: "Database table not found." },
};

function respond(res: Response, status: number, name: string, message: string): void {
  const err: ApiError = { name, code: status, message };
  const body: ApiResponse<never> = { success: false, error: err };
  res.status(status).json(body);
}

export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  if (err instanceof AppError) {
    respond(res, err.statusCode, err.name, err.message);
    return;
  }

  if (err instanceof DatabaseError && err.code) {
    const mapped = PG_ERROR_MAP[err.code];
    if (mapped) {
      respond(res, mapped.status, `DB_${err.code}`, mapped.message);
      return;
    }
  }

  console.error("[errorHandler] Unhandled error:", err);
  respond(res, httpStatus.INTERNAL_SERVER_ERROR, "INTERNAL_ERROR", "Internal server error");
}

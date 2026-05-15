import type { Request, Response, NextFunction } from "express";
import httpStatus from "http-status";
import { verifyToken, type JwtPayload } from "../services/auth.service";
import type { ApiError, ApiResponse } from "../lib/AppError";

declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}

export function requireAuth(req: Request, res: Response, next: NextFunction): void {
  const token = req.cookies?.token as string | undefined;

  if (!token) {
    const err: ApiError = { name: "UNAUTHORIZED", code: httpStatus.UNAUTHORIZED, message: "Not authenticated" };
    const body: ApiResponse<ApiError> = { success: false, error: err };
    res.status(httpStatus.UNAUTHORIZED).json(body);
    return;
  }

  try {
    req.user = verifyToken(token);
    next();
  } catch {
    const err: ApiError = { name: "UNAUTHORIZED", code: httpStatus.UNAUTHORIZED, message: "Invalid or expired token" };
    const body: ApiResponse<ApiError> = { success: false, error: err };
    res.status(httpStatus.UNAUTHORIZED).json(body);
  }
}

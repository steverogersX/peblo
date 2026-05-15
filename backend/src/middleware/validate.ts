import type { Request, Response, NextFunction } from "express";
import { BAD_REQUEST } from "http-status";
import type { ZodSchema } from "zod";
import { fromError } from 'zod-validation-error';
import { ApiError, ApiResponse } from "../lib/AppError";


export function validateBody<T>(schema: ZodSchema<T>) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req.body);

    if (!result.success) {
      const errMsg = fromError(result.error).message;
      const err: ApiError = {
        message: errMsg,
        name: "BAD_REQUEST",
        code: BAD_REQUEST
      }
      const response: ApiResponse<ApiError> = {
        success: false,
        error: err
      };
      res.status(BAD_REQUEST).json(response);
      return;
    }
    req.body = result.data;
    next();
  };
}



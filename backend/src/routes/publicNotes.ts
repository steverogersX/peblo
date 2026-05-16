import { Router, Request, Response, NextFunction } from "express";
import { z } from "zod";
import httpStatus from "http-status";
import { validateBody } from "../middleware/validate";
import * as notesService from "../services/notes.service";
import type { ApiResponse } from "../lib/AppError";

const router = Router();

const PublicUpdateSchema = z.object({
  title: z.string().max(200).optional(),
  content: z.string().optional(),
});

router.get("/:token", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await notesService.getPublicNoteByToken(req.params.token);
    const body: ApiResponse<typeof data> = { success: true, data };
    res.status(httpStatus.OK).json(body);
  } catch (err) {
    next(err);
  }
});

router.patch(
  "/:token",
  validateBody(PublicUpdateSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = await notesService.updatePublicNote(req.params.token, req.body);
      const body: ApiResponse<typeof data> = { success: true, data };
      res.status(httpStatus.OK).json(body);
    } catch (err) {
      next(err);
    }
  }
);

export default router;

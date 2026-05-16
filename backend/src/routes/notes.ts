import { NextFunction, Router, Response, Request } from "express";
import httpStatus from "http-status";
import * as notesService from "../services/notes.service";
import { validateBody } from "../middleware/validate";
import { requireAuth } from "../middleware/auth";
import { CreateNoteSchema, UpdateNoteSchema } from "../lib/schemas";
import type { ApiResponse } from "../lib/AppError";

const router = Router();

router.use(requireAuth);

router.get("/", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const cursor = typeof req.query.cursor === "string" ? req.query.cursor : undefined;
    const limit = Math.min(Math.max(Number(req.query.limit) || 25, 1), 100);
    const data = await notesService.getAllNotes(req.user!.userId, cursor, limit);
    const body: ApiResponse<typeof data> = { success: true, data };
    res.status(httpStatus.OK).json(body);
  } catch (err) {
    next(err);
  }
});

router.post("/", validateBody(CreateNoteSchema), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await notesService.createNote(req.user!.userId, req.body);
    const body: ApiResponse<typeof data> = { success: true, data };
    res.status(httpStatus.CREATED).json(body);
  } catch (err) {
    next(err);
  }
});

router.patch("/:id", validateBody(UpdateNoteSchema), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await notesService.updateNote(req.user!.userId, req.params.id, req.body);
    const body: ApiResponse<typeof data> = { success: true, data };
    res.status(httpStatus.OK).json(body);
  } catch (err) {
    next(err);
  }
});

router.delete("/:id", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = await notesService.deleteNote(req.user!.userId, req.params.id);
    const body: ApiResponse<{ id: string }> = { success: true, data: { id } };
    res.status(httpStatus.OK).json(body);
  } catch (err) {
    next(err);
  }
});

router.post("/:id/summarize", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await notesService.summarizeNote(req.user!.userId, req.params.id);
    const body: ApiResponse<typeof data> = { success: true, data };
    res.status(httpStatus.OK).json(body);
  } catch (err) {
    next(err);
  }
});

export default router;

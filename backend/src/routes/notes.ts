import { NextFunction, Router, Response, Request } from "express";
import httpStatus from "http-status";
import * as notesService from "../services/notes.service";
import { validateBody } from "../middleware/validate";
import { CreateNoteSchema, UpdateNoteSchema } from "../lib/schemas";

const router = Router();

router.get("/", async (_: Request, res: Response, next: NextFunction) => {
  try {
    const data = await notesService.getAllNotes();
    res.status(httpStatus.OK).json({ data });
  } catch (err) {
    next(err);
  }
});

router.post("/", validateBody(CreateNoteSchema), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await notesService.createNote(req.body);
    res.status(httpStatus.CREATED).json({ data });
  } catch (err) {
    next(err);
  }
});

router.patch("/:id", validateBody(UpdateNoteSchema), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await notesService.updateNote(req.params.id, req.body);
    res.status(httpStatus.OK).json({ data });
  } catch (err) {
    next(err);
  }
});

router.delete("/:id", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = await notesService.deleteNote(req.params.id);
    res.status(httpStatus.OK).json({ data: { id } });
  } catch (err) {
    next(err);
  }
});

export default router;

import express, { type Request, type Response } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import httpStatus from "http-status";
import notesRouter from "./routes/notes";
import authRouter from "./routes/auth";
import publicNotesRouter from "./routes/publicNotes";
import { ApiError } from "./lib/AppError";
import { errorHandler } from "./middleware/errorHandler";

const app = express();

app.use(
  cors({
    origin: process.env.CORS_ORIGIN ?? "http://localhost:3000",
    methods: ["GET", "POST", "PATCH", "DELETE"],
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());

app.use("/api/auth", authRouter);
app.use("/api/notes", notesRouter);
app.use("/api/public/notes", publicNotesRouter);

app.get("/health", (_req: Request, res: Response) => {
  res.status(httpStatus.OK).json({ ok: true });
});

app.use((_: Request, res: Response) => {
  const err: ApiError = {
    name: "ROUTE_NOT_FOUND",
    code: httpStatus.NOT_FOUND,
    message: "Route Not found",
  };
  res.status(httpStatus.NOT_FOUND).json({ success: false, error: err });
});

app.use(errorHandler);

export default app;

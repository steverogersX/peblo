import { Router, type Request, type Response, type NextFunction } from "express";
import httpStatus from "http-status";
import { z } from "zod";
import { validateBody } from "../middleware/validate";
import { requireAuth } from "../middleware/auth";
import * as authService from "../services/auth.service";
import { env } from "../config/env";

const router = Router();

const COOKIE_OPTS = {
  httpOnly: true,
  sameSite: "lax" as const,
  secure: env.NODE_ENV === "production",
  maxAge: 7 * 24 * 60 * 60 * 1000,
};

const SignupSchema = z.object({
  name: z.string().min(1).max(100).trim(),
  email: z.string().email().toLowerCase(),
  password: z
    .string()
    .min(8)
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/\d/, "Password must contain at least one number"),
});

const LoginSchema = z.object({
  email: z.string().email().toLowerCase(),
  password: z.string().min(1),
});

router.post("/signup", validateBody(SignupSchema), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { user, token } = await authService.signup(req.body.name, req.body.email, req.body.password);
    res.cookie("token", token, COOKIE_OPTS);
    res.status(httpStatus.CREATED).json({ success: true, data: { user } });
  } catch (err) {
    next(err);
  }
});

router.post("/login", validateBody(LoginSchema), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { user, token } = await authService.login(req.body.email, req.body.password);
    res.cookie("token", token, COOKIE_OPTS);
    res.status(httpStatus.OK).json({ success: true, data: { user } });
  } catch (err) {
    next(err);
  }
});

router.post("/logout", (_req: Request, res: Response) => {
  res.clearCookie("token", { httpOnly: true, sameSite: "lax", secure: env.NODE_ENV === "production" });
  res.status(httpStatus.OK).json({ success: true });
});

router.get("/me", requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = await authService.getMe(req.user!.userId);
    res.status(httpStatus.OK).json({ success: true, data: { user } });
  } catch (err) {
    next(err);
  }
});

router.delete("/account", requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    await authService.deleteUser(req.user!.userId);
    res.clearCookie("token", { httpOnly: true, sameSite: "lax", secure: env.NODE_ENV === "production" });
    res.status(httpStatus.OK).json({ success: true });
  } catch (err) {
    next(err);
  }
});

export default router;

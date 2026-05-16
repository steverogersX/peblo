import { Router, type Request, type Response, type NextFunction } from "express";
import httpStatus from "http-status";
import { requireAuth } from "../middleware/auth";
import * as insightsService from "../services/insights.service";

const router = Router();

router.use(requireAuth);

router.get("/", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const insights = await insightsService.getInsights(req.user!.userId);
    res.status(httpStatus.OK).json({ success: true, data: { insights } });
  } catch (err) {
    next(err);
  }
});

export default router;

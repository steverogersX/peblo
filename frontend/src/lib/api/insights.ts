import type { ProductivityInsights } from "@/lib/schemas/insights";
import { request } from "./client";

export const insightsApi = {
  get: () => request<{ insights: ProductivityInsights }>("/api/insights"),
};

import { publicProcedure, router } from "./trpc.js";

export const systemRouter = router({
  health: publicProcedure.query(() => ({
    status: "ok",
    timestamp: new Date().toISOString(),
    version: "1.0.0",
  })),
});

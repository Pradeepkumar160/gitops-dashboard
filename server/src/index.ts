import "dotenv/config";
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import * as trpcExpress from "@trpc/server/adapters/express";
import { appRouter } from "./routers.js";
import { ENV } from "./_core/env.js";
import type { TRPCContext } from "./_core/trpc.js";

const app = express();

// ─── Middleware ─────────────────────────────────────────────────────────────
app.use(
  cors({
    origin: ENV.CORS_ORIGIN,
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());

// ─── Demo auth context ───────────────────────────────────────────────────────
// In a real app this would validate a JWT/session cookie.
// For local development, every request is treated as the demo admin user.
function createContext({ req, res }: { req: express.Request; res: express.Response }): TRPCContext {
  return {
    req,
    res,
    user: {
      id: 1,
      openId: ENV.ownerOpenId,
      name: "Admin User",
      email: "admin@gitops.local",
      role: "admin",
    },
  };
}

// ─── tRPC ────────────────────────────────────────────────────────────────────
app.use(
  "/trpc",
  trpcExpress.createExpressMiddleware({
    router: appRouter,
    createContext,
  })
);

// ─── Health check ─────────────────────────────────────────────────────────────
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// ─── Start ────────────────────────────────────────────────────────────────────
app.listen(ENV.PORT, () => {
  console.log(`\n✅  GitOps API server running at http://localhost:${ENV.PORT}`);
  console.log(`   tRPC endpoint: http://localhost:${ENV.PORT}/trpc`);
  console.log(`   Database: ${ENV.DATABASE_URL ? "connected" : "not configured (demo mode)"}\n`);
});

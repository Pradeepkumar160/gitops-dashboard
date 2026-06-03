import { initTRPC, TRPCError } from "@trpc/server";
import { type Request, type Response } from "express";
import { z } from "zod";

export interface TRPCContext {
  req: Request;
  res: Response;
  user: {
    id: number;
    openId: string;
    name: string | null;
    email: string | null;
    role: "user" | "admin";
  } | null;
}

const t = initTRPC.context<TRPCContext>().create();

export const router = t.router;
export const middleware = t.middleware;

// Public procedure — no auth required
export const publicProcedure = t.procedure;

// Protected procedure — requires a logged-in user
export const protectedProcedure = t.procedure.use(({ ctx, next }) => {
  if (!ctx.user) {
    throw new TRPCError({ code: "UNAUTHORIZED", message: "You must be logged in" });
  }
  return next({
    ctx: {
      ...ctx,
      user: ctx.user,
    },
  });
});

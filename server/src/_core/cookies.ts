import { type Request } from "express";
import { ENV } from "./env.js";

export function getSessionCookieOptions(req: Request) {
  const isProduction = ENV.NODE_ENV === "production";
  return {
    httpOnly: true,
    secure: isProduction,
    sameSite: (isProduction ? "strict" : "lax") as "strict" | "lax",
    path: "/",
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  };
}

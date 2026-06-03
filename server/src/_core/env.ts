import "dotenv/config";

export const ENV = {
  PORT: parseInt(process.env.PORT || "3001"),
  DATABASE_URL: process.env.DATABASE_URL || "",
  SESSION_SECRET: process.env.SESSION_SECRET || "dev-secret-change-in-production",
  NODE_ENV: process.env.NODE_ENV || "development",
  ownerOpenId: process.env.OWNER_OPEN_ID || "demo-admin",
  CORS_ORIGIN: process.env.CORS_ORIGIN || "http://localhost:5173",
} as const;

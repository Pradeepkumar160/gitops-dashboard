import { createTRPCReact } from "@trpc/react-query";
// Import the router type only — no runtime code is imported from the server
import type { AppRouter } from "../../../server/src/routers";

export const trpc = createTRPCReact<AppRouter>();

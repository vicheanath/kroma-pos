import { handlers } from "@/lib/auth";

export const { GET, POST } = handlers;

// Force Node.js runtime to avoid Edge Runtime limitations
export const runtime = "nodejs";

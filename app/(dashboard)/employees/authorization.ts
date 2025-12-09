/**
 * Server-side authorization check for employees page
 * This ensures only admin and manager roles can access this page
 */

import { requireRole } from "@/lib/auth-helpers";

export async function checkEmployeeAccess() {
  await requireRole(["admin", "manager"]);
}

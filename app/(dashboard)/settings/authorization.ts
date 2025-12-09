/**
 * Server-side authorization check for settings page
 * This ensures only admin and manager roles can access this page
 */

import { requireRole } from "@/lib/auth-helpers";

export async function checkSettingsAccess() {
  await requireRole(["admin", "manager"]);
}

/**
 * Demo Provider - returns built-in fixture data for demo mode
 * Used when no API key is configured
 */
import type { CanonicalContextPackage } from "@/schemas/context-package.schema";
import { TRAE_FIXTURE } from "@/fixtures/trae-fixture";

export function compileDemo(): CanonicalContextPackage {
  return { ...TRAE_FIXTURE };
}

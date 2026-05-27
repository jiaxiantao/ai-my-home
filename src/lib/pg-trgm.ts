import { getDb } from "@/lib/db";

let extensionReady: boolean | null = null;

export async function ensurePgTrgmExtension() {
  if (extensionReady !== null) {
    return extensionReady;
  }

  const db = getDb();

  if (!db) {
    extensionReady = false;
    return false;
  }

  try {
    await db.$executeRawUnsafe(`CREATE EXTENSION IF NOT EXISTS pg_trgm`);
    extensionReady = true;
    return true;
  } catch {
    extensionReady = false;
    return false;
  }
}

export function resetPgTrgmCache() {
  extensionReady = null;
}

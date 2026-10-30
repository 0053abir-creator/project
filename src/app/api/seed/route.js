import { runSeed } from "../../../../scripts/seed.mjs";
import { jsonSuccess, jsonError } from "@/lib/helpers";

export const dynamic = "force-dynamic";

export async function POST() {
  try {
    await runSeed();
    return jsonSuccess({ message: "Database reseeded successfully with campus sample data!" });
  } catch (err) {
    console.error("Seed API error:", err);
    return jsonError("Failed to seed database: " + err.message, 500);
  }
}

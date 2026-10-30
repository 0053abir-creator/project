import { getSession } from "@/lib/auth";
import { jsonSuccess, jsonError } from "@/lib/helpers";

export const dynamic = "force-dynamic";

export async function GET(request) {
  try {
    const sessionData = await getSession(request);
    if (!sessionData || !sessionData.user) {
      return jsonSuccess({ user: null, authenticated: false });
    }

    return jsonSuccess({
      user: sessionData.user,
      authenticated: true,
    });
  } catch (err) {
    console.error("Auth /me error:", err);
    return jsonError("Server error", 500);
  }
}

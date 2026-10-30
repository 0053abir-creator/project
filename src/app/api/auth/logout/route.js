import { getCollection } from "@/lib/mongodb";
import { getSession, SESSION_COOKIE_NAME } from "@/lib/auth";
import { jsonSuccess } from "@/lib/helpers";

export async function POST(request) {
  try {
    const sessionData = await getSession(request);
    if (sessionData && sessionData.session) {
      const sessionsCol = await getCollection("sessions");
      await sessionsCol.deleteOne({ token: sessionData.session.token });
    }

    const response = jsonSuccess({ message: "Logged out successfully" });
    response.cookies.set({
      name: SESSION_COOKIE_NAME,
      value: "",
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 0,
      path: "/",
    });

    return response;
  } catch (err) {
    console.error("Logout API error:", err);
    return jsonSuccess({ message: "Logged out" });
  }
}

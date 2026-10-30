import { getCollection } from "@/lib/mongodb";
import { verifyPassword, createSession, SESSION_COOKIE_NAME } from "@/lib/auth";
import { jsonSuccess, jsonError } from "@/lib/helpers";

export async function POST(request) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return jsonError("Email and password are required.", 400);
    }

    const usersCol = await getCollection("users");
    const user = await usersCol.findOne({ email: email.toLowerCase().trim() });

    if (!user) {
      return jsonError("Invalid email or password.", 401);
    }

    const isMatch = await verifyPassword(password, user.password);
    if (!isMatch) {
      return jsonError("Invalid email or password.", 401);
    }

    // Create session
    const { token, expiresAt } = await createSession(user._id);

    const safeUser = {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      studentId: user.studentId,
      department: user.department,
      role: user.role,
      createdAt: user.createdAt,
    };

    const response = jsonSuccess({
      message: "Login successful",
      user: safeUser,
      token,
    });

    response.cookies.set({
      name: SESSION_COOKIE_NAME,
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      expires: expiresAt,
      path: "/",
    });

    return response;
  } catch (err) {
    console.error("Login API error:", err);
    return jsonError("Server error during login.", 500);
  }
}

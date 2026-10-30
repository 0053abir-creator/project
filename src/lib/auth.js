import { cookies } from "next/headers";
import bcrypt from "bcryptjs";
import { getCollection, ObjectId } from "./mongodb";
import { toObjectId } from "./helpers";

const SESSION_COOKIE_NAME = "campus_session_token";

// Password helper functions
export async function hashPassword(plainText) {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(plainText, salt);
}

export async function verifyPassword(plainText, hashed) {
  if (!plainText || !hashed) return false;
  return bcrypt.compare(plainText, hashed);
}

// Create persistent session
export async function createSession(userId) {
  const sessionsCol = await getCollection("sessions");
  const token =
    Math.random().toString(36).substring(2) +
    Date.now().toString(36) +
    Math.random().toString(36).substring(2);

  const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days persistent session

  await sessionsCol.insertOne({
    token,
    userId: userId.toString(),
    expiresAt,
    createdAt: new Date(),
  });

  return { token, expiresAt };
}

// Get current session from Request or Next.js Cookies
export async function getSession(request = null) {
  try {
    let token = null;

    if (request) {
      // Check Bearer authorization header first
      const authHeader = request.headers?.get?.("authorization");
      if (authHeader && authHeader.startsWith("Bearer ")) {
        token = authHeader.substring(7).trim();
      }

      // Check cookie header in request
      if (!token) {
        const cookieHeader = request.headers?.get?.("cookie");
        if (cookieHeader) {
          const match = cookieHeader.match(new RegExp(`${SESSION_COOKIE_NAME}=([^;]+)`));
          if (match) token = match[1];
        }
      }
    }

    // Next.js server cookie store
    if (!token) {
      try {
        const cookieStore = cookies();
        const cookie = cookieStore.get(SESSION_COOKIE_NAME);
        if (cookie) token = cookie.value;
      } catch {
        // Not in server component context with cookies()
      }
    }

    if (!token) return null;

    const sessionsCol = await getCollection("sessions");
    const session = await sessionsCol.findOne({ token });
    if (!session) return null;

    // Check expiration
    if (new Date(session.expiresAt) < new Date()) {
      await sessionsCol.deleteOne({ token });
      return null;
    }

    const usersCol = await getCollection("users");
    // Find user by _id as ObjectId or string
    let user = await usersCol.findOne({ _id: toObjectId(session.userId) });
    if (!user) {
      user = await usersCol.findOne({ _id: session.userId.toString() });
    }

    if (!user) return null;

    // Remove password from user object
    const { password, ...safeUser } = user;
    safeUser.id = user._id.toString();

    return {
      session: {
        id: session._id ? session._id.toString() : token,
        token: session.token,
        expiresAt: session.expiresAt,
      },
      user: safeUser,
    };
  } catch (err) {
    console.error("Auth getSession error:", err);
    return null;
  }
}

// Require authenticated user (returns user or throws/returns 401 response)
export async function requireAuth(request) {
  const sessionData = await getSession(request);
  if (!sessionData || !sessionData.user) {
    return {
      error: "Authentication required. Please log in.",
      status: 401,
      user: null,
    };
  }
  return { user: sessionData.user, session: sessionData.session, status: 200 };
}

// Require specific role (e.g., 'admin')
export async function requireRole(request, role = "admin") {
  const authRes = await requireAuth(request);
  if (authRes.error) return authRes;

  if (authRes.user.role !== role) {
    return {
      error: `Access denied. Requires ${role} privileges.`,
      status: 403,
      user: null,
    };
  }

  return authRes;
}

export { SESSION_COOKIE_NAME };

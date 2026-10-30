import { NextResponse } from "next/server";
import { getCollection, ObjectId } from "@/lib/mongodb";
import { hashPassword, createSession, SESSION_COOKIE_NAME } from "@/lib/auth";
import { jsonSuccess, jsonError, validateRegisterInput } from "@/lib/helpers";

export async function POST(request) {
  try {
    const body = await request.json();
    const validation = validateRegisterInput(body);

    if (!validation.isValid) {
      return jsonError("Validation failed", 400, validation.errors);
    }

    const { name, email, studentId, department, password } = body;
    const usersCol = await getCollection("users");

    // Check if email already registered
    const existingEmail = await usersCol.findOne({ email: email.toLowerCase().trim() });
    if (existingEmail) {
      return jsonError("An account with this university email already exists.", 409);
    }

    // Check if studentId already registered
    const existingStudentId = await usersCol.findOne({ studentId: studentId.trim() });
    if (existingStudentId) {
      return jsonError("An account with this Student ID already exists.", 409);
    }

    const hashedPassword = await hashPassword(password);
    const userId = new ObjectId();

    const newUser = {
      _id: userId,
      name: name.trim(),
      email: email.toLowerCase().trim(),
      studentId: studentId.trim(),
      department: department.trim(),
      password: hashedPassword,
      role: "student", // PRD: Students cannot make themselves admin
      createdAt: new Date(),
    };

    await usersCol.insertOne(newUser);

    // Create session
    const { token, expiresAt } = await createSession(userId);

    const safeUser = {
      id: userId.toString(),
      name: newUser.name,
      email: newUser.email,
      studentId: newUser.studentId,
      department: newUser.department,
      role: newUser.role,
      createdAt: newUser.createdAt,
    };

    const response = jsonSuccess(
      {
        message: "Registration successful",
        user: safeUser,
        token,
      },
      201
    );

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
    console.error("Register API error:", err);
    return jsonError("Server error during registration.", 500);
  }
}

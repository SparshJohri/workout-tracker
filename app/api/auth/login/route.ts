import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { dbConnect } from "../../../../src/lib/mongodb";
import User from "../../../../src/models/User";
import { createAuthToken } from "../../../../src/lib/auth";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { username, password } = body;

    if (
      typeof username !== "string" ||
      username.trim() === "" ||
      typeof password !== "string" ||
      password.trim() === ""
    ) {
      return NextResponse.json(
        { error: "username and password required" },
        { status: 400 }
      );
    }

    await dbConnect();

    const normalizedUsername = username.trim();

    const user = await User.findOne({
      username: normalizedUsername,
    });

    if (!user) {
      return NextResponse.json(
        { error: "username not found" },
        { status: 404 }
      );
    }

    const passwordIsCorrect = await bcrypt.compare(
      password,
      user.passwordHash
    );

    if (!passwordIsCorrect) {
      return NextResponse.json(
        { error: "incorrect password" },
        { status: 401 }
      );
    }

    const token = await createAuthToken({
      username: user.username,
    });

    const response = NextResponse.json(
      {
        message: "login successful",
        username: user.username,
      },
      { status: 200 }
    );

    response.cookies.set("workout_token", token, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });

    return response;
  } catch (error) {
    console.error("POST /api/auth/login error:", error);

    return NextResponse.json(
      { error: "internal server error" },
      { status: 500 }
    );
  }
}
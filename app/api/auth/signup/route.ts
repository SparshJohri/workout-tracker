import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { dbConnect } from "../../../../src/lib/mongodb";
import User from "../../../../src/models/User";

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

    const existingUser = await User.findOne({
      username: normalizedUsername,
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "username already exists" },
        { status: 409 }
      );
    }

    const passwordHash = await bcrypt.hash(password, 10);

    await User.create({
      username: normalizedUsername,
      passwordHash,
    });

    return NextResponse.json(
      { message: "signup successful" },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST /api/auth/signup error:", error);

    return NextResponse.json(
      { error: "internal server error" },
      { status: 500 }
    );
  }
}
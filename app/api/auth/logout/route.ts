import { NextResponse } from "next/server";

export async function POST() {
  const response = NextResponse.json(
    { message: "logout successful" },
    { status: 200 }
  );

  response.cookies.set("workout_token", "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  });

  return response;
}

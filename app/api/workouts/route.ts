import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { dbConnect } from "../../../src/lib/mongodb";
import Workout from "../../../src/models/Workout";
import { validateWorkoutData } from "../../../src/lib/validateWorkout";
import { verifyAuthToken } from "../../../src/lib/auth";

async function getUsernameFromRequestCookie() {
  const cookieStore = await cookies();
  const token = cookieStore.get("workout_token")?.value;

  if (!token) {
    return null;
  }

  try {
    const payload = await verifyAuthToken(token);
    return payload.username;
  } catch {
    return null;
  }
}

export async function POST(request: Request) {
  try {
    const username = await getUsernameFromRequestCookie();

    if (!username) {
      return NextResponse.json(
        { error: "not logged in" },
        { status: 401 }
      );
    }

    const body = await request.json();

    if (!validateWorkoutData(body)) {
      return NextResponse.json(
        { error: "data format invalid" },
        { status: 400 }
      );
    }

    await dbConnect();

    const createdWorkout = await Workout.create({
      userId: username,
      date: body.date,
      time: body.time,
      location: body.location,
      category: body.category,
      generalNotes: body.generalNotes,
      exercises: body.exercises,
    });

    return NextResponse.json(
      {
        message: "workout created",
        workout: createdWorkout,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST /api/workouts error:", error);

    return NextResponse.json(
      { error: "internal server error" },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const username = await getUsernameFromRequestCookie();

    if (!username) {
      return NextResponse.json(
        { error: "not logged in" },
        { status: 401 }
      );
    }

    await dbConnect();

    const workouts = await Workout.find({ userId: username })
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({ workouts }, { status: 200 });
  } catch (error) {
    console.error("GET /api/workouts error:", error);

    return NextResponse.json(
      { error: "internal server error" },
      { status: 500 }
    );
  }
}
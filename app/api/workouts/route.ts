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

export async function GET(request: Request) {
  try {
    const username = await getUsernameFromRequestCookie();

    if (!username) {
      return NextResponse.json(
        { error: "not logged in" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const start = searchParams.get("start");
    const end = searchParams.get("end");
    const category = searchParams.get("category");

    await dbConnect();

    const query: {
      userId: string;
      date?: {
        $gte?: string;
        $lte?: string;
      };
      category?: string;
    } = {
      userId: username,
    };

    if (start && end) {
      query.date = {
        $gte: start,
        $lte: end,
      };
    }

    if (category && category.trim() !== "") {
      query.category = category.trim();
    }

    const workouts = await Workout.find(query)
      .sort({ date: -1, time: -1 })
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
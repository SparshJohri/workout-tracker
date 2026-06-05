import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { dbConnect } from "../../../../src/lib/mongodb";
import Workout from "../../../../src/models/Workout";
import { verifyAuthToken } from "../../../../src/lib/auth";

const allowedStats = new Set([
  "Max",
  "Min",
  "Average",
  "Standard Deviation",
  "Reps",
  "Average Reps Per Set",
  "Standard Deviation of Reps Across Sets",
]);

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

    const exerciseName = searchParams.get("exercise");
    const statName = searchParams.get("stat");
    const start = searchParams.get("start");
    const end = searchParams.get("end");

    if (
      !exerciseName ||
      exerciseName.trim() === "" ||
      !statName ||
      !allowedStats.has(statName) ||
      !start ||
      !end
    ) {
      return NextResponse.json(
        { error: "invalid graph request" },
        { status: 400 }
      );
    }

    await dbConnect();

    const workouts = await Workout.find({
      userId: username,
      date: {
        $gte: start,
        $lte: end,
      },
      "exercises.name": exerciseName,
    })
      .sort({ date: 1, time: 1 })
      .lean();

    const points: {
      date: string;
      time: string;
      value: number;
      workoutId: string;
      exerciseName: string;
    }[] = [];

    for (const workout of workouts as any[]) {
      const workoutExercises = Array.isArray(workout.exercises)
        ? workout.exercises
        : [];

      for (const exercise of workoutExercises) {
        if (!exercise || exercise.name !== exerciseName) {
          continue;
        }

        const overallStats = exercise["Overall Stats"];

        if (
          !overallStats ||
          typeof overallStats !== "object" ||
          !(statName in overallStats)
        ) {
          continue;
        }

        const value = overallStats[statName];

        if (typeof value !== "number" || Number.isNaN(value)) {
          continue;
        }

        points.push({
          date: workout.date,
          time: workout.time,
          value,
          workoutId: String(workout._id),
          exerciseName: exercise.name,
        });
      }
    }

    return NextResponse.json({ points }, { status: 200 });
  } catch (error) {
    console.error("GET /api/graph/data error:", error);

    return NextResponse.json(
      { error: "internal server error" },
      { status: 500 }
    );
  }
}
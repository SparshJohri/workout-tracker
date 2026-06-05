"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

type WorkoutSet = {
  id: number;
  details: string;
  notes: string;
};

type WorkoutExercise = {
  id: number;
  order: number;
  selectedExerciseId: string;
  name: string;
  closedKineticChain: boolean;
  isCustom: boolean;
  sets: WorkoutSet[];
};

type Workout = {
  _id: string;
  userId: string;
  date: string;
  time: string;
  location: string;
  category: string;
  generalNotes: string;
  exercises: WorkoutExercise[];
  createdAt: string;
  updatedAt: string;
};

export default function HistoryPage() {
  const router = useRouter();

  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [category, setCategory] = useState("N/A");
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [showLogoutPopup, setShowLogoutPopup] = useState(false);

  async function handleSubmit() {
    setMessage("");

    if (startDate.trim() === "" || endDate.trim() === "") {
      setMessage("Please select both a start date and an end date.");
      return;
    }

    if (startDate > endDate) {
      setMessage("Start date cannot be after end date.");
      return;
    }

    setLoading(true);

    try {
      const params = new URLSearchParams({
        start: startDate,
        end: endDate,
      });

      if (category.trim() !== "" && category.trim().toLowerCase() !== "n/a") {
        params.set("category", category.trim());
      }

      const response = await fetch(`/api/workouts?${params.toString()}`);

      const result = await response.json();

      if (!response.ok) {
        setMessage(result.error || "failed to load workout history");
        setWorkouts([]);
        return;
      }

      setWorkouts(result.workouts || []);

      if (!result.workouts || result.workouts.length === 0) {
        setMessage("No workouts found for this search.");
      }
    } catch (error) {
      console.error("History fetch error:", error);
      setMessage("failed to load workout history");
      setWorkouts([]);
    } finally {
      setLoading(false);
    }
  }

  function handleLogoutClick() {
    setShowLogoutPopup(true);
  }

  function handleCancelLogout() {
    setShowLogoutPopup(false);
  }

  async function handleConfirmLogout() {
    try {
      const response = await fetch("/api/auth/logout", {
        method: "POST",
      });

      if (!response.ok) {
        alert("failed to log out");
        return;
      }

      setShowLogoutPopup(false);
      router.push("/");
    } catch (error) {
      console.error("Logout error:", error);
      alert("failed to log out");
    }
  }

  return (
    <main className="min-h-screen bg-slate-950 text-white px-6 py-8">
      <div className="mx-auto max-w-6xl">
        <header className="mb-10 flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div>
            <h1 className="text-4xl font-bold">Workout History</h1>
            <p className="text-slate-400 mt-2">
              Search your saved workouts by workout date and category.
            </p>
          </div>

          <nav className="flex flex-wrap gap-3 text-sm font-semibold">
            <Link
              href="/workout"
              className="rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 px-4 py-2"
            >
              Current Workout
            </Link>

            <Link
              href="/history"
              className="rounded-lg bg-blue-600 hover:bg-blue-500 px-4 py-2"
            >
              History
            </Link>

            <button
              type="button"
              onClick={handleLogoutClick}
              className="rounded-lg bg-red-600 hover:bg-red-500 px-4 py-2"
            >
              Log Out
            </button>
          </nav>
        </header>

        <section className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="rounded-2xl bg-slate-900 border border-slate-800 p-6">
            <h2 className="text-2xl font-semibold mb-6">Date Range</h2>

            <div className="grid grid-cols-1 md:grid-cols-[auto_1fr] gap-5 items-end">
              <label className="text-sm font-bold tracking-wide text-slate-300 md:pb-3">
                START
              </label>

              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full rounded-lg bg-slate-800 border border-slate-700 px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
              />

              <label className="text-sm font-bold tracking-wide text-slate-300 md:pb-3">
                END
              </label>

              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full rounded-lg bg-slate-800 border border-slate-700 px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
              />

              <div className="hidden md:block" />

              <button
                type="button"
                onClick={handleSubmit}
                disabled={loading}
                className="rounded-lg bg-green-600 hover:bg-green-500 disabled:bg-green-900 disabled:text-slate-400 px-5 py-3 font-semibold"
              >
                {loading ? "Loading..." : "Submit"}
              </button>
            </div>

            {message && (
              <div className="mt-5 rounded-lg border border-slate-700 bg-slate-800 px-4 py-3 text-sm text-slate-200">
                {message}
              </div>
            )}
          </div>

          <div className="rounded-2xl bg-slate-900 border border-slate-800 p-6">
            <h2 className="text-2xl font-semibold mb-6">Category</h2>

            <label className="block text-sm font-medium mb-2">
              Category Filter
            </label>

            <input
              type="text"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              placeholder="N/A, push, pull, legs, etc."
              className="w-full rounded-lg bg-slate-800 border border-slate-700 px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
            />

            <p className="text-slate-400 text-sm mt-3">
              Use N/A to search all categories.
            </p>
          </div>
        </section>

        <section className="space-y-6">
          {workouts.map((workout) => (
            <article
              key={workout._id}
              className="rounded-2xl bg-slate-900 border border-slate-800 p-6 shadow-xl"
            >
              <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold">
                    {workout.date}{" "}
                    <span className="text-slate-400 text-base font-medium">
                      at {workout.time}
                    </span>
                  </h2>

                  <p className="text-slate-300 mt-1">
                    Location: {workout.location}
                  </p>

                  <p className="text-slate-400 mt-1">
                    Category: {workout.category}
                  </p>
                </div>
              </div>

              <div className="mb-6 rounded-xl bg-slate-950 border border-slate-800 p-4">
                <h3 className="text-sm font-semibold text-slate-400 mb-2">
                  General Notes
                </h3>

                <p className="text-slate-200 whitespace-pre-wrap">
                  {workout.generalNotes.trim() === ""
                    ? "No general notes."
                    : workout.generalNotes}
                </p>
              </div>

              <div className="space-y-4">
                {[...workout.exercises]
                  .sort((a, b) => a.order - b.order)
                  .map((exercise) => (
                    <div
                      key={exercise.id}
                      className="rounded-xl bg-slate-800 border border-slate-700 p-5"
                    >
                      <h3 className="text-xl font-semibold mb-4">
                        {exercise.name}{" "}
                        <span className="text-slate-400 text-base">
                          ({exercise.order})
                        </span>
                      </h3>

                      <div className="overflow-hidden rounded-lg border border-slate-700">
                        <table className="w-full text-left">
                          <thead className="bg-slate-900 text-slate-300">
                            <tr>
                              <th className="w-1/4 px-4 py-3 text-sm font-semibold">
                                Set Details
                              </th>
                              <th className="w-3/4 px-4 py-3 text-sm font-semibold">
                                Notes
                              </th>
                            </tr>
                          </thead>

                          <tbody>
                            {exercise.sets.map((set) => (
                              <tr
                                key={set.id}
                                className="border-t border-slate-700"
                              >
                                <td className="w-1/4 px-4 py-3 font-mono text-sm text-slate-100 align-top">
                                  {set.details}
                                </td>

                                <td className="w-3/4 px-4 py-3 text-sm text-slate-300 align-top whitespace-pre-wrap">
                                  {set.notes.trim() === "" ? "—" : set.notes}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  ))}
              </div>
            </article>
          ))}
        </section>
      </div>

      {showLogoutPopup && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center px-4">
          <div className="w-full max-w-md rounded-2xl bg-slate-900 border border-slate-700 p-6 shadow-xl">
            <h2 className="text-2xl font-bold mb-3">Log Out?</h2>

            <p className="text-slate-400 mb-6">
              Are you sure you want to log out?
            </p>

            <div className="flex gap-3 justify-end">
              <button
                type="button"
                onClick={handleCancelLogout}
                className="rounded-lg bg-slate-700 hover:bg-slate-600 px-5 py-3 font-semibold"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleConfirmLogout}
                className="rounded-lg bg-red-600 hover:bg-red-500 px-5 py-3 font-semibold"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
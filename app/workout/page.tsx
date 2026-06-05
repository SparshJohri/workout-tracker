"use client";

import { useState } from "react";
import Link from "next/link";

type DefaultExercise = {
  id: string;
  name: string;
  closedKineticChain: boolean;
};

type WorkoutSet = {
  id: number;
  details: string;
  notes: string;
};

type Exercise = {
  id: number;
  selectedExerciseId: string;
  name: string;
  closedKineticChain: boolean;
  isCustom: boolean;
  sets: WorkoutSet[];
};

const defaultExercises: DefaultExercise[] = [
  {
    id: "lat-pulldown",
    name: "Lat Pulldown",
    closedKineticChain: false,
  },
  {
    id: "pull-up",
    name: "Pull-Up",
    closedKineticChain: true,
  },
];

const CUSTOM_EXERCISE_ID = "custom";

const openChainSetRegex =
  /^([0-9]{1,4}x[0-9]{1,3}, )*[0-9]{1,4}x[0-9]{1,3}$/;

const closedChainSetRegex =
  /^([+-][0-9]{1,4}x[0-9]{1,3}, )*[+-][0-9]{1,4}x[0-9]{1,3}$/;

function generateId() {
  return Date.now() + Math.floor(Math.random() * 1000000);
}

export default function WorkoutPage() {
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [location, setLocation] = useState("");
  const [category, setCategory] = useState("");
  const [generalNotes, setGeneralNotes] = useState("");

  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [showConfirmPopup, setShowConfirmPopup] = useState(false);

  function addExercise() {
    const newExercise: Exercise = {
      id: generateId(),
      selectedExerciseId: "",
      name: "",
      closedKineticChain: false,
      isCustom: false,
      sets: [],
    };

    setExercises((prev) => [...prev, newExercise]);
  }

  function removeExercise(exerciseId: number) {
    setExercises((prev) =>
      prev.filter((exercise) => exercise.id !== exerciseId)
    );
  }

  function updateSelectedExercise(exerciseId: number, selectedId: string) {
    setExercises((prev) =>
      prev.map((exercise) => {
        if (exercise.id !== exerciseId) {
          return exercise;
        }

        if (selectedId === CUSTOM_EXERCISE_ID) {
          return {
            ...exercise,
            selectedExerciseId: selectedId,
            name: "",
            closedKineticChain: false,
            isCustom: true,
          };
        }

        const selectedDefaultExercise = defaultExercises.find(
          (defaultExercise) => defaultExercise.id === selectedId
        );

        if (!selectedDefaultExercise) {
          return {
            ...exercise,
            selectedExerciseId: "",
            name: "",
            closedKineticChain: false,
            isCustom: false,
          };
        }

        return {
          ...exercise,
          selectedExerciseId: selectedId,
          name: selectedDefaultExercise.name,
          closedKineticChain: selectedDefaultExercise.closedKineticChain,
          isCustom: false,
        };
      })
    );
  }

  function updateCustomExerciseName(exerciseId: number, newName: string) {
    setExercises((prev) =>
      prev.map((exercise) =>
        exercise.id === exerciseId
          ? { ...exercise, name: newName }
          : exercise
      )
    );
  }

  function updateClosedKineticChain(exerciseId: number, checked: boolean) {
    setExercises((prev) =>
      prev.map((exercise) =>
        exercise.id === exerciseId && exercise.isCustom
          ? { ...exercise, closedKineticChain: checked }
          : exercise
      )
    );
  }

  function addSet(exerciseId: number) {
    const newSet: WorkoutSet = {
      id: generateId(),
      details: "",
      notes: "",
    };

    setExercises((prev) =>
      prev.map((exercise) =>
        exercise.id === exerciseId
          ? { ...exercise, sets: [...exercise.sets, newSet] }
          : exercise
      )
    );
  }

  function removeSet(exerciseId: number, setId: number) {
    setExercises((prev) =>
      prev.map((exercise) =>
        exercise.id === exerciseId
          ? {
              ...exercise,
              sets: exercise.sets.filter((set) => set.id !== setId),
            }
          : exercise
      )
    );
  }

  function updateSetDetails(
    exerciseId: number,
    setId: number,
    newValue: string
  ) {
    setExercises((prev) =>
      prev.map((exercise) =>
        exercise.id === exerciseId
          ? {
              ...exercise,
              sets: exercise.sets.map((set) =>
                set.id === setId ? { ...set, details: newValue } : set
              ),
            }
          : exercise
      )
    );
  }

  function updateSetNotes(
    exerciseId: number,
    setId: number,
    newValue: string
  ) {
    setExercises((prev) =>
      prev.map((exercise) =>
        exercise.id === exerciseId
          ? {
              ...exercise,
              sets: exercise.sets.map((set) =>
                set.id === setId ? { ...set, notes: newValue } : set
              ),
            }
          : exercise
      )
    );
  }

  function isSetDetailsValid(exercise: Exercise, details: string) {
    const regex = exercise.closedKineticChain
      ? closedChainSetRegex
      : openChainSetRegex;

    return regex.test(details);
  }

  function isWorkoutDataValid() {
    const hasMissingGeneralInfo =
      date.trim() === "" ||
      time.trim() === "" ||
      location.trim() === "" ||
      category.trim() === "";

    const hasInvalidExercise = exercises.some(
      (exercise) =>
        exercise.selectedExerciseId.trim() === "" ||
        exercise.name.trim() === "" ||
        exercise.sets.length === 0
    );

    const hasBadSetFormatting = exercises.some((exercise) =>
      exercise.sets.some((set) => !isSetDetailsValid(exercise, set.details))
    );

    return !(
      hasMissingGeneralInfo ||
      hasInvalidExercise ||
      hasBadSetFormatting
    );
  }

  function handleSubmitClick() {
    if (!isWorkoutDataValid()) {
      alert("data format invalid");
      return;
    }

    setShowConfirmPopup(true);
  }

  function handleCancelSubmit() {
    setShowConfirmPopup(false);
  }

  async function handleConfirmSubmit() {
    setShowConfirmPopup(false);

    const exercisesWithOrder = exercises.map((exercise, index) => ({
      ...exercise,
      order: index + 1,
    }));

    const workoutData = {
      date,
      time,
      location,
      category,
      generalNotes,
      exercises: exercisesWithOrder,
    };

    try {
      const response = await fetch("/api/workouts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(workoutData),
      });

      const result = await response.json();

      if (!response.ok) {
        alert(result.error || "failed to submit workout");
        return;
      }

      console.log("Workout submitted:", result);
      alert("workout submitted");
    } catch (error) {
      console.error("Submit workout error:", error);
      alert("failed to submit workout");
    }
  }

  function handleRefresh() {
    setDate("");
    setTime("");
    setLocation("");
    setCategory("");
    setGeneralNotes("");
    setExercises([]);
    setShowConfirmPopup(false);
  }

  return (
    <main className="min-h-screen bg-slate-950 text-white px-6 py-8">
      <div className="mx-auto max-w-5xl">
        <header className="mb-10 flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div>
            <h1 className="text-4xl font-bold">New Workout</h1>
            <p className="text-slate-400 mt-2">
              Record the details of your workout.
            </p>
          </div>

          <nav className="flex gap-3 text-sm font-semibold">
            <Link
              href="/workout"
              className="rounded-lg bg-blue-600 hover:bg-blue-500 px-4 py-2"
            >
              Current Workout
            </Link>

            <Link
              href="/history"
              className="rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 px-4 py-2"
            >
              History
            </Link>
          </nav>
        </header>

        <section className="rounded-2xl bg-slate-900 border border-slate-800 p-6 mb-8">
          <h2 className="text-2xl font-semibold mb-6">
            General Workout Information
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-5 mb-5">
            <div>
              <label className="block text-sm font-medium mb-2">Date</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full rounded-lg bg-slate-800 border border-slate-700 px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Time</label>
              <input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="w-full rounded-lg bg-slate-800 border border-slate-700 px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Location
              </label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Gym, home, UCLA Wooden, etc."
                className="w-full rounded-lg bg-slate-800 border border-slate-700 px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Category
              </label>
              <input
                type="text"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder="Push, pull, legs, etc."
                className="w-full rounded-lg bg-slate-800 border border-slate-700 px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              General Notes
            </label>
            <textarea
              value={generalNotes}
              onChange={(e) => setGeneralNotes(e.target.value)}
              placeholder="How did the workout feel overall?"
              className="w-full min-h-40 rounded-lg bg-slate-800 border border-slate-700 px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500 resize-y"
            />
          </div>
        </section>

        <section className="rounded-2xl bg-slate-900 border border-slate-800 p-6">
          <h2 className="text-2xl font-semibold mb-6">Exercises</h2>

          <div className="space-y-5 mb-6">
            {exercises.map((exercise) => (
              <div
                key={exercise.id}
                className="rounded-xl bg-slate-800 border border-slate-700 p-5"
              >
                <div className="flex flex-col lg:flex-row gap-4 items-start">
                  <div className="flex-1 w-full">
                    <div className="flex items-center justify-between gap-4 mb-2">
                      <label className="block text-sm font-medium">
                        Exercise Name
                      </label>

                      <label
                        className={`flex items-center gap-2 text-sm whitespace-nowrap ${
                          exercise.isCustom
                            ? "text-slate-300"
                            : "text-slate-500"
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={exercise.closedKineticChain}
                          disabled={!exercise.isCustom}
                          onChange={(e) =>
                            updateClosedKineticChain(
                              exercise.id,
                              e.target.checked
                            )
                          }
                          className="h-4 w-4 rounded border-slate-600 bg-slate-900 disabled:cursor-not-allowed"
                        />
                        closed kinetic chain
                      </label>
                    </div>

                    <select
                      value={exercise.selectedExerciseId}
                      onChange={(e) =>
                        updateSelectedExercise(exercise.id, e.target.value)
                      }
                      className="w-full h-14 rounded-lg bg-slate-900 border border-slate-700 px-4 text-lg outline-none focus:ring-2 focus:ring-blue-500 mb-3"
                    >
                      <option value="">Select exercise</option>

                      {defaultExercises.map((defaultExercise) => (
                        <option
                          key={defaultExercise.id}
                          value={defaultExercise.id}
                        >
                          {defaultExercise.name}
                        </option>
                      ))}

                      <option value={CUSTOM_EXERCISE_ID}>
                        Custom Exercise
                      </option>
                    </select>

                    {exercise.isCustom && (
                      <input
                        type="text"
                        value={exercise.name}
                        onChange={(e) =>
                          updateCustomExerciseName(
                            exercise.id,
                            e.target.value
                          )
                        }
                        placeholder="Type custom exercise name"
                        className="w-full h-14 rounded-lg bg-slate-900 border border-slate-700 px-4 text-lg outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    )}
                  </div>

                  <div className="pt-0 lg:pt-7 flex gap-3">
                    <button
                      type="button"
                      onClick={() => addSet(exercise.id)}
                      className="rounded-lg bg-blue-600 hover:bg-blue-500 px-5 py-3 font-semibold whitespace-nowrap"
                    >
                      Add Set
                    </button>

                    <button
                      type="button"
                      onClick={() => removeExercise(exercise.id)}
                      className="rounded-lg bg-red-600 hover:bg-red-500 px-5 py-3 font-semibold whitespace-nowrap"
                    >
                      Remove Exercise
                    </button>
                  </div>
                </div>

                {exercise.sets.length > 0 && (
                  <div className="mt-5 space-y-3">
                    {exercise.sets.map((set, setIndex) => {
                      const isValid =
                        set.details.length === 0 ||
                        isSetDetailsValid(exercise, set.details);

                      return (
                        <div
                          key={set.id}
                          className="grid grid-cols-1 lg:grid-cols-[1fr_1fr_auto_auto] gap-3 items-start"
                        >
                          <div>
                            <label className="block text-sm font-medium mb-2">
                              Set {setIndex + 1} Details
                            </label>

                            <input
                              type="text"
                              value={set.details}
                              onChange={(e) =>
                                updateSetDetails(
                                  exercise.id,
                                  set.id,
                                  e.target.value
                                )
                              }
                              placeholder={
                                exercise.closedKineticChain
                                  ? "Example: +95x8 or +95x8, -20x10"
                                  : "Example: 95x8 or 95x8, 95x7, 90x8"
                              }
                              className={`w-full rounded-lg bg-slate-900 border px-4 py-3 outline-none focus:ring-2 ${
                                isValid
                                  ? "border-slate-700 focus:ring-blue-500"
                                  : "border-red-500 focus:ring-red-500"
                              }`}
                            />

                            {!isValid && (
                              <p className="text-red-400 text-sm mt-2">
                                {exercise.closedKineticChain
                                  ? "Format must match: +95x8 or +95x8, -20x10"
                                  : "Format must match: 95x8 or 95x8, 95x7, 90x8"}
                              </p>
                            )}
                          </div>

                          <div>
                            <label className="block text-sm font-medium mb-2">
                              Set Notes
                            </label>

                            <input
                              type="text"
                              value={set.notes}
                              onChange={(e) =>
                                updateSetNotes(
                                  exercise.id,
                                  set.id,
                                  e.target.value
                                )
                              }
                              placeholder="Notes for this set"
                              className="w-full rounded-lg bg-slate-900 border border-slate-700 px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
                            />
                          </div>

                          <div className="pt-0 lg:pt-7 text-slate-400 text-sm whitespace-nowrap">
                            Set {setIndex + 1}
                          </div>

                          <div className="pt-0 lg:pt-6">
                            <button
                              type="button"
                              onClick={() => removeSet(exercise.id, set.id)}
                              className="rounded-lg bg-red-600 hover:bg-red-500 px-4 py-3 font-semibold whitespace-nowrap"
                            >
                              Remove Set
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <button
              type="button"
              onClick={addExercise}
              className="rounded-lg bg-slate-700 hover:bg-slate-600 px-5 py-3 font-semibold"
            >
              Add Exercise
            </button>

            <button
              type="button"
              onClick={handleSubmitClick}
              className="rounded-lg bg-green-600 hover:bg-green-500 px-5 py-3 font-semibold"
            >
              Submit
            </button>

            <button
              type="button"
              onClick={handleRefresh}
              className="rounded-lg bg-red-600 hover:bg-red-500 px-5 py-3 font-semibold"
            >
              Refresh
            </button>
          </div>
        </section>
      </div>

      {showConfirmPopup && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center px-4">
          <div className="w-full max-w-md rounded-2xl bg-slate-900 border border-slate-700 p-6 shadow-xl">
            <h2 className="text-2xl font-bold mb-3">Submit Workout?</h2>

            <p className="text-slate-400 mb-6">
              Are you sure you want to submit this workout?
            </p>

            <div className="flex gap-3 justify-end">
              <button
                type="button"
                onClick={handleCancelSubmit}
                className="rounded-lg bg-slate-700 hover:bg-slate-600 px-5 py-3 font-semibold"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleConfirmSubmit}
                className="rounded-lg bg-green-600 hover:bg-green-500 px-5 py-3 font-semibold"
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
const openChainSetRegex =
  /^([0-9]{1,4}x[0-9]{1,3}, )*[0-9]{1,4}x[0-9]{1,3}$/;

const closedChainSetRegex =
  /^([+-][0-9]{1,4}x[0-9]{1,3}, )*[+-][0-9]{1,4}x[0-9]{1,3}$/;

type IncomingWorkoutSet = {
  id: number;
  details: string;
  notes: string;
};

type IncomingExercise = {
  id: number;
  order: number;
  selectedExerciseId: string;
  name: string;
  closedKineticChain: boolean;
  isCustom: boolean;
  sets: IncomingWorkoutSet[];
};

export type IncomingWorkout = {
  date: string;
  time: string;
  location: string;
  category: string;
  generalNotes: string;
  exercises: IncomingExercise[];
};

export function validateWorkoutData(data: unknown): data is IncomingWorkout {
  if (typeof data !== "object" || data === null) {
    return false;
  }

  const workout = data as IncomingWorkout;

  if (
    typeof workout.date !== "string" ||
    workout.date.trim() === "" ||
    typeof workout.time !== "string" ||
    workout.time.trim() === "" ||
    typeof workout.location !== "string" ||
    workout.location.trim() === "" ||
    typeof workout.category !== "string" ||
    workout.category.trim() === ""
  ) {
    return false;
  }

  if (
    typeof workout.generalNotes !== "string" ||
    !Array.isArray(workout.exercises)
  ) {
    return false;
  }

  if (workout.exercises.length === 0) {
    return false;
  }

  const exerciseOrders = workout.exercises.map((exercise) => exercise.order);

  const hasBadExerciseOrder =
    exerciseOrders.some(
      (order) => !Number.isInteger(order) || order < 1
    ) || new Set(exerciseOrders).size !== exerciseOrders.length;

  if (hasBadExerciseOrder) {
    return false;
  }

  for (const exercise of workout.exercises) {
    if (
      typeof exercise !== "object" ||
      exercise === null ||
      typeof exercise.id !== "number" ||
      typeof exercise.order !== "number" ||
      !Number.isInteger(exercise.order) ||
      exercise.order < 1 ||
      typeof exercise.selectedExerciseId !== "string" ||
      exercise.selectedExerciseId.trim() === "" ||
      typeof exercise.name !== "string" ||
      exercise.name.trim() === "" ||
      typeof exercise.closedKineticChain !== "boolean" ||
      typeof exercise.isCustom !== "boolean" ||
      !Array.isArray(exercise.sets)
    ) {
      return false;
    }

    if (exercise.sets.length === 0) {
      return false;
    }

    const setRegex = exercise.closedKineticChain
      ? closedChainSetRegex
      : openChainSetRegex;

    for (const set of exercise.sets) {
      if (
        typeof set !== "object" ||
        set === null ||
        typeof set.id !== "number" ||
        typeof set.details !== "string" ||
        typeof set.notes !== "string" ||
        !setRegex.test(set.details)
      ) {
        return false;
      }
    }
  }

  return true;
}
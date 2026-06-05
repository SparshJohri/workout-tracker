import { Schema, models, model } from "mongoose";

const SetSchema = new Schema(
  {
    id: {type: Number, required: true,},
    details: {type: String, required: true,},
    notes: {type: String, default: "",},
  },
  { _id: false }
);

const ExerciseSchema = new Schema(
  {
    id: {type: Number, required: true,},
    order:{type: Number, required: true},
    selectedExerciseId: {type: String, required: true,},
    name: {type: String, required: true,},
    closedKineticChain: {type: Boolean, required: true, default: false,},
    isCustom: {type: Boolean, required: true, default: false,},
    sets: {type: [SetSchema], default: [],},
  },
  { _id: false }
);

const WorkoutSchema = new Schema(
  {
    userId: {type: String, required: true, index: true, default: "dummy-user",},
    date: {type: String, required: true,},
    time: {type: String, required: true,},
    location: {type: String, required: true,},
    category: { type: String, default: "" },
    generalNotes: {type: String, default: "",},
    exercises: {type: [ExerciseSchema], default: [],},
  },
  { timestamps: true }
);


const Workout = models.Workout || model("Workout", WorkoutSchema);

export default Workout;
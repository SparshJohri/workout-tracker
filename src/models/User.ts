import { Schema, models, model } from "mongoose";

const UserSchema = new Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      index: true,
      trim: true,
    },

    passwordHash: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

const User = models.User || model("User", UserSchema);

export default User;
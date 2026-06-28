import mongoose, { Schema } from "mongoose";
import bcrypt from "bcrypt";

const UserSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true
    },

    mobileNo: {
      type: Number,
      required: true,
      unique: true,
      index: true,
    },

    password: {
      type: String,
      required: true,
      minlength: 6,
      select: false,
    },
    resetPasswordOTP: {
      type: String,
    },

    resetPasswordOTPExpire: {
      type: Date,
    }
  },
  { timestamps: true }
);
UserSchema.pre("save", async function () {
    if (!this.isModified("password")) return; 

    this.password = await bcrypt.hash(this.password, 10);
});

UserSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

export const User = mongoose.model("User", UserSchema);
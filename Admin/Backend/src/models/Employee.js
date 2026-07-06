import mongoose from "mongoose";

const employeeSchema = new mongoose.Schema(
  {
    employeeId: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },
    fullName: {
      type: String,
      required: true,
      trim: true
    },
    phone: {
      type: String,
      trim: true
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true
    },
    designation: {
      type: String,
      trim: true
    },
    joiningDate: {
      type: Date
    },
    monthlySalary: {
      type: Number,
      default: 0
    },
    profileImage: {
      type: String,
      default: ""
    },
    status: {
      type: String,
      enum: ["active", "inactive", "on_leave"],
      default: "active"
    }
  },
  {
    timestamps: true
  }
);

export const Employee = mongoose.model("Employee", employeeSchema);

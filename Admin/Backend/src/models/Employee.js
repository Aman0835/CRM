import bcrypt from "bcrypt";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import validator from "validator";

dotenv.config();

const JWT_SECRET = (process.env.JWT_SECRET || "secretkey").trim();

const generateEmployeeId = () => `EMP-${Math.floor(1000 + Math.random() * 9000)}`;

const employeeSchema = new mongoose.Schema(
  {
    employeeId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    name: {
      type: String,
      trim: true,
      default: "",
    },

    firstName: {
      type: String,
      trim: true,
      default: "",
    },
    lastName: {
      type: String,
      trim: true,
      default: "",
    },

    gender: {
      type: String,
      lowercase: true,
      trim: true,
      enum: ["male", "female", "other"],
      default: "other",
    },

    email: {
      type: String,
      lowercase: true,
      trim: true,
      default: "",
    },

    phone: {
      type: String,
      required: true,
      trim: true,
    },

    vendor: {
      type: String,
      trim: true,
      default: "",
    },

    sourcing: {
      type: String,
      trim: true,
      default: "",
    },

    sourcingManager: {
      type: String,
      trim: true,
      default: "",
    },

    perDayPayout: {
      type: Number,
      default: 0,
      min: 0,
    },

    role: {
      type: String,
      required: true,
      trim: true,
      enum: ["admin", "manager", "employee"],
      default: "employee",
    },

    password: {
      type: String,
      required: true,
    },

    visiblePassword: {
      type: String,
      default: "Pass1234!",
    },

    joiningDate: {
      type: Date,
      default: Date.now,
    },

    monthlySalary: {
      type: Number,
      default: 0,
      min: 0,
    },

    profileImage: {
      type: String,
      default: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=400",
    },

    address: {
      type: String,
      default: "",
    },

    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
    },

    assignedOffice: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "OfficeLocation",
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

employeeSchema.index({
  employeeId: 1,
  phone: 1,
});

employeeSchema.pre("validate", function (next) {
  if (!this.employeeId || !this.employeeId.trim()) {
    this.employeeId = generateEmployeeId();
  }

  // Sync name <-> firstName / lastName
  if (this.name && this.name.trim()) {
    const parts = this.name.trim().split(/\s+/);
    this.firstName = parts[0] || this.name.trim();
    this.lastName = parts.slice(1).join(" ") || "";
  } else if (this.firstName || this.lastName) {
    this.name = `${this.firstName || ""} ${this.lastName || ""}`.trim();
  }

  // Sync sourcing <-> sourcingManager
  if (this.sourcing && !this.sourcingManager) {
    this.sourcingManager = this.sourcing.trim();
  } else if (this.sourcingManager && !this.sourcing) {
    this.sourcing = this.sourcingManager.trim();
  }

  // Ensure unique placeholder email if omitted
  if (!this.email || !this.email.trim()) {
    const cleanId = (this.employeeId || "emp").toLowerCase().replace(/[^a-z0-9]/g, "");
    this.email = `${cleanId}@clipper.internal`;
  }

  // Keep monthly salary and perDayPayout in sync
  if (this.perDayPayout > 0 && (!this.monthlySalary || this.monthlySalary === 0)) {
    this.monthlySalary = this.perDayPayout * 30;
  } else if (this.monthlySalary > 0 && (!this.perDayPayout || this.perDayPayout === 0)) {
    this.perDayPayout = Math.round(this.monthlySalary / 30);
  }

  next();
});

employeeSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

employeeSchema.pre("findOneAndUpdate", async function (next) {
  const update = this.getUpdate();
  if (!update || !update.password) return next();
  update.password = await bcrypt.hash(update.password, 12);
  next();
});

employeeSchema.methods.getJWT = async function () {
  const employee = this;

  const token = await jwt.sign({ _id: employee._id }, JWT_SECRET, {
    expiresIn: "7d",
  });
  return token;
};

employeeSchema.methods.validatePassword = async function (passwordByUser) {
  const employee = this;
  const hashedPassword = employee.password;
  return await bcrypt.compare(passwordByUser, hashedPassword);
};

const Employee = mongoose.model("Employee", employeeSchema);

export default Employee;


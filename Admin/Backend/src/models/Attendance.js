import mongoose from "mongoose";

const attendanceSchema = new mongoose.Schema(
  {
    employeeId: {
      type: String,
      required: true,
      trim: true
    },

    date: {
      type: String,
      required: true
    },

    checkIn: {
      type: Date,
      default: null,
    },

    checkOut: {
      type: Date,
      default: null,
    },

    workingHours: {
      type: Number,
      default: 0,
    },

    overtime: {
      type: Number,
      default: 0
    },

    status: {
      type: String,
      enum: ["Present", "Absent", "Half Day", "Late"],
      default: "Present"
    },

    earlyCheckoutStatus: {
      type: String,
      enum: ["none", "requested", "approved", "rejected"],
      default: "none",
    },

    earlyCheckoutReason: {
      type: String,
      default: "",
    },

    officeLocation: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "OfficeLocation",
      default: null,
    },

    officeName: {
      type: String,
      default: "",
      trim: true,
    },

    checkInLocation: {
      latitude: { type: Number, default: null },
      longitude: { type: Number, default: null },
      accuracy: { type: Number, default: null },
      distance: { type: Number, default: null },
      verified: { type: Boolean, default: false },
      timestamp: { type: Date, default: null },
    },

    checkOutLocation: {
      latitude: { type: Number, default: null },
      longitude: { type: Number, default: null },
      accuracy: { type: Number, default: null },
      distance: { type: Number, default: null },
      verified: { type: Boolean, default: false },
      timestamp: { type: Date, default: null },
    },

    locationVerified: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true
  }
);

attendanceSchema.index({ employeeId: 1, date: 1 }, { unique: true });

const Attendance = mongoose.model("Attendance", attendanceSchema);

export default Attendance;

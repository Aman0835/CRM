import mongoose from "mongoose";

const callLogSchema = new mongoose.Schema(
  {
    leadId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Lead",
      required: false,
      index: true,
    },
    leadName: {
      type: String,
      trim: true,
      default: "",
    },
    phoneNumber: {
      type: String,
      required: true,
      trim: true,
    },
    employeeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee",
      required: true,
      index: true,
    },
    employeeName: {
      type: String,
      trim: true,
      default: "",
    },
    status: {
      type: String,
      enum: ["dialed", "connected", "not_connected", "busy", "wrong_number"],
      default: "dialed",
      index: true,
    },
    durationSeconds: {
      type: Number,
      default: 0,
    },
    outcome: {
      type: String,
      trim: true,
      default: "",
    },
    notes: {
      type: String,
      trim: true,
      default: "",
    },
    dialedAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

callLogSchema.index({ employeeId: 1, dialedAt: -1 });
callLogSchema.index({ dialedAt: -1 });

const CallLog = mongoose.model("CallLog", callLogSchema);

export default CallLog;


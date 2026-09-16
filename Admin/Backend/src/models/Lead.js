import mongoose from "mongoose";

const leadSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Lead name is required"],
      trim: true,
    },
    phone: {
      type: String,
      required: [true, "Phone number is required"],
      trim: true,
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      default: "",
    },
    location: {
      type: String,
      trim: true,
      default: "",
    },
    project: {
      type: String,
      trim: true,
      default: "",
    },
    configuration: {
      type: String,
      trim: true,
      default: "",
    },
    budget: {
      type: String,
      trim: true,
      default: "",
    },
    source: {
      type: String,
      trim: true,
      default: "Direct Call",
    },
    status: {
      type: String,
      enum: [
        "New",
        "Contacted",
        "Interested",
        "Follow-up",
        "Visit Scheduled",
        "Visit Completed",
        "Negotiation",
        "Booking",
        "Won",
        "Lost",
      ],
      default: "New",
    },
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee",
      required: true,
    },
    assignedToEmployeeId: {
      type: String,
      trim: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee",
      required: true,
    },
    latestInteraction: {
      interactionType: {
        type: String,
        enum: ["CALL", "WHATSAPP", "MEETING", "NOTE", "SITE_VISIT"],
      },
      clientResponse: { type: String, trim: true, default: "" },
      outcome: { type: String, trim: true, default: "" },
      nextAction: { type: String, trim: true, default: "" },
      date: { type: Date, default: Date.now },
    },
    nextFollowUp: {
      date: { type: Date },
      time: { type: String, trim: true, default: "" },
      action: { type: String, trim: true, default: "" },
    },
  },
  {
    timestamps: true,
  }
);

leadSchema.index({ assignedTo: 1, phone: 1 });
leadSchema.index({ assignedTo: 1, status: 1 });
leadSchema.index({ assignedTo: 1, createdAt: -1 });

const Lead = mongoose.model("Lead", leadSchema);

export default Lead;

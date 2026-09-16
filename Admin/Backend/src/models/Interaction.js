import mongoose from "mongoose";

const interactionSchema = new mongoose.Schema(
  {
    leadId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Lead",
      required: true,
      index: true,
    },
    employeeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee",
      required: true,
    },
    employeeName: {
      type: String,
      trim: true,
      default: "",
    },
    type: {
      type: String,
      enum: ["CALL", "WHATSAPP", "MEETING", "NOTE", "SITE_VISIT"],
      required: [true, "Interaction type is required"],
    },
    clientResponse: {
      type: String,
      required: [true, "Client response is required"],
      trim: true,
    },
    outcome: {
      type: String,
      required: [true, "Interaction outcome is required"],
      trim: true,
    },
    nextAction: {
      type: String,
      required: [true, "Next action is required"],
      trim: true,
    },
    nextActionDate: {
      type: Date,
    },
    nextActionTime: {
      type: String,
      trim: true,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

interactionSchema.index({ leadId: 1, createdAt: -1 });

const Interaction = mongoose.model("Interaction", interactionSchema);

export default Interaction;

import mongoose from "mongoose";

const visitSchema = new mongoose.Schema(
  {
    projectName: {
      type: String,
      required: [true, "Project name is required"],
      trim: true,
    },
    callerName: {
      type: String,
      required: [true, "Caller name is required"],
      trim: true,
    },
    smName: {
      type: String,
      required: [true, "SM name is required"],
      trim: true,
    },
    clientName: {
      type: String,
      required: [true, "Client name is required"],
      trim: true,
    },
    clientType: {
      type: String,
      enum: ["SINGLE", "FAMILY"],
      required: [true, "Client type is required"],
      default: "FAMILY",
    },
    svNumber: {
      type: String,
      required: [true, "SV Number is required for tagging"],
      trim: true,
    },
    clientNumberLast4: {
      type: String,
      trim: true,
      default: "",
    },
    visitDate: {
      type: String,
      required: [true, "Visit date is required"],
    },
    cpFirmName: {
      type: String,
      required: [true, "CP Firm name is required"],
      trim: true,
      default: "Dosti Realty",
    },
    topology: {
      type: [String],
      required: [true, "At least one topology is required"],
      default: ["2BHK"],
    },
    leadId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Lead",
      default: null,
    },
    employeeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee",
      required: true,
      index: true,
    },
    googleFormSubmitted: {
      type: Boolean,
      default: false,
    },
    googleFormResponseStatus: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: ["Submitted", "Verified", "Rejected"],
      default: "Submitted",
    },
    notes: {
      type: String,
      trim: true,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

visitSchema.index({ svNumber: 1 });
visitSchema.index({ employeeId: 1, createdAt: -1 });

const Visit = mongoose.model("Visit", visitSchema);

export default Visit;


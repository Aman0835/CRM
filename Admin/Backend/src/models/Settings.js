import mongoose from "mongoose";

const settingsSchema = new mongoose.Schema(
  {
    shopName: {
      type: String,
      default: "Diva The Salon",
      trim: true,
    },
    contactEmail: {
      type: String,
      default: "admin@divathesalon.com",
      trim: true,
    },
    checkInTime: {
      type: String,
      default: "09:00", // 24-hour format "HH:mm"
      trim: true,
    },
    checkOutTime: {
      type: String,
      default: "20:00", // 24-hour format "HH:mm"
      trim: true,
    },
    overtimeRate: {
      type: Number,
      default: 25, // ₹/hr
    },
    lateGraceMinutes: {
      type: Number,
      default: 15, // minutes buffer before marking as Late
    },
    vendors: {
      type: [String],
      default: ["Direct / Internal", "Apex Staffing", "Elite Salon Associates", "Freelance Network"],
    },
    sourcingManagers: {
      type: [String],
      default: ["Self / Walk-in", "Aman Sharma", "Rohan Verma", "Neha Patel"],
    },
  },
  {
    timestamps: true,
  }
);

const Settings = mongoose.model("Settings", settingsSchema);

export default Settings;

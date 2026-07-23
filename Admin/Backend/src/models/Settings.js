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
      default: 25, // $/hr
    },
    leaveDeduction: {
      type: Number,
      default: 100, // $/day
    },
  },
  {
    timestamps: true,
  }
);

const Settings = mongoose.model("Settings", settingsSchema);

export default Settings;

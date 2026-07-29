import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
  {
    recipientRole: {
      type: String,
      enum: ["admin", "employee", "all"],
      required: true,
    },
    employeeId: {
      type: String,
      default: null,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    message: {
      type: String,
      required: true,
      trim: true,
    },
    type: {
      type: String,
      enum: ["leave", "attendance", "holiday", "system"],
      default: "system",
    },
    read: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Auto-expire notifications after 3 days (259,200 seconds)
notificationSchema.index({ createdAt: 1 }, { expireAfterSeconds: 259200 });

const Notification = mongoose.model("Notification", notificationSchema);

export default Notification;

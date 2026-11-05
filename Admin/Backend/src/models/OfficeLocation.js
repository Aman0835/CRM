import mongoose from "mongoose";

const officeLocationSchema = new mongoose.Schema(
  {
    businessId: {
      type: String,
      default: "default",
      index: true,
    },
    officeName: {
      type: String,
      required: [true, "Office name is required"],
      trim: true,
    },
    address: {
      type: String,
      required: [true, "Address is required"],
      trim: true,
    },
    latitude: {
      type: Number,
      required: [true, "Latitude is required"],
      min: -90,
      max: 90,
    },
    longitude: {
      type: Number,
      required: [true, "Longitude is required"],
      min: -180,
      max: 180,
    },
    allowedRadius: {
      type: Number,
      default: 100, // in meters
      min: [10, "Allowed radius must be at least 10 meters"],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
      default: null,
    },
  },
  { timestamps: true }
);

officeLocationSchema.index({ businessId: 1, isActive: 1 });

const OfficeLocation = mongoose.model("OfficeLocation", officeLocationSchema);
export default OfficeLocation;

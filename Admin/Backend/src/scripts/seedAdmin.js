import { connectDatabase } from "../config/db.js";
import { User } from "../models/User.js";

const seedAdmin = async () => {
  await connectDatabase();

  const existingAdmin = await User.findOne({ username: "admin" });

  if (existingAdmin) {
    console.log("Admin user already exists");
    process.exit(0);
  }

  await User.create({
    username: "admin",
    password: "admin123",
    role: "admin",
    isActive: true
  });

  console.log("Default admin created: admin / admin123");
  process.exit(0);
};

seedAdmin().catch((error) => {
  console.error("Failed to seed admin", error);
  process.exit(1);
});

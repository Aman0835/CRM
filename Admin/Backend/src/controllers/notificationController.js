import Notification from "../models/Notification.js";

// Helper: Seed default welcome notifications if database is empty
const seedDefaultNotifications = async (role, employeeId = null) => {
  const count = await Notification.countDocuments();
  if (count === 0) {
    await Notification.create([
      {
        recipientRole: "admin",
        title: "System Ready",
        message: "Diva The Salon management system initialized successfully.",
        type: "system",
      },
      {
        recipientRole: "all",
        title: "Welcome to Diva",
        message: "Track your attendance, leave, and payroll all in one place.",
        type: "system",
      },
    ]);
  }
};

// GET Admin Notifications
export const getAdminNotifications = async (req, res) => {
  try {
    await seedDefaultNotifications("admin");
    const notifications = await Notification.find({
      recipientRole: { $in: ["admin", "all"] },
    })
      .sort({ createdAt: -1 })
      .limit(30);

    const unreadCount = await Notification.countDocuments({
      recipientRole: { $in: ["admin", "all"] },
      read: false,
    });

    res.status(200).json({
      success: true,
      unreadCount,
      data: notifications,
    });
  } catch (error) {
    console.error("Get Admin Notifications Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET Employee Notifications
export const getEmployeeNotifications = async (req, res) => {
  try {
    const { employeeId } = req.params;
    await seedDefaultNotifications("employee", employeeId);

    const query = {
      $or: [
        { recipientRole: "all" },
        { recipientRole: "employee", employeeId: null },
        { recipientRole: "employee", employeeId },
      ],
    };

    const notifications = await Notification.find(query)
      .sort({ createdAt: -1 })
      .limit(30);

    const unreadCount = await Notification.countDocuments({
      ...query,
      read: false,
    });

    res.status(200).json({
      success: true,
      unreadCount,
      data: notifications,
    });
  } catch (error) {
    console.error("Get Employee Notifications Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Mark Single Notification as Read
export const markNotificationRead = async (req, res) => {
  try {
    const { id } = req.params;
    const notification = await Notification.findByIdAndUpdate(
      id,
      { read: true },
      { new: true }
    );
    res.status(200).json({ success: true, data: notification });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Mark All Notifications as Read for Role
export const markAllNotificationsRead = async (req, res) => {
  try {
    const { role, employeeId } = req.body;
    let query = {};
    if (role === "admin") {
      query = { recipientRole: { $in: ["admin", "all"] } };
    } else {
      query = {
        $or: [
          { recipientRole: "all" },
          { recipientRole: "employee", employeeId: null },
          { recipientRole: "employee", employeeId },
        ],
      };
    }

    await Notification.updateMany(query, { read: true });

    res.status(200).json({ success: true, message: "All notifications marked as read" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

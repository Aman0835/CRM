import Settings from "../models/Settings.js";

// Helper: Get or initialize singleton settings document
export const getSettings = async (req, res) => {
  try {
    let settings = await Settings.findOne();
    if (!settings) {
      settings = await Settings.create({});
    }
    res.status(200).json({
      success: true,
      data: settings,
    });
  } catch (error) {
    console.error("Get Settings Error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Update settings document
export const updateSettings = async (req, res) => {
  try {
    const {
      shopName,
      contactEmail,
      checkInTime,
      checkOutTime,
      overtimeRate,
      leaveDeduction,
    } = req.body;

    let settings = await Settings.findOne();
    if (!settings) {
      settings = new Settings({});
    }

    if (shopName !== undefined) settings.shopName = shopName;
    if (contactEmail !== undefined) settings.contactEmail = contactEmail;
    if (checkInTime !== undefined) settings.checkInTime = checkInTime;
    if (checkOutTime !== undefined) settings.checkOutTime = checkOutTime;
    if (overtimeRate !== undefined) settings.overtimeRate = Number(overtimeRate);
    if (leaveDeduction !== undefined) settings.leaveDeduction = Number(leaveDeduction);

    await settings.save();

    res.status(200).json({
      success: true,
      message: "Settings saved successfully",
      data: settings,
    });
  } catch (error) {
    console.error("Update Settings Error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

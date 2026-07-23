import Employee from "../models/Employee.js";
import Payroll from "../models/Payroll.js";
import Attendance from "../models/Attendance.js";
import Settings from "../models/Settings.js";

// Generate Payroll
export const generatePayroll = async (req, res) => {
  try {
    const { month, year } = req.body;

    if (!month || !year) {
      return res.status(400).json({
        success: false,
        message: "Month and Year are required",
      });
    }

    const settings = (await Settings.findOne()) || {
      overtimeRate: 25,
      leaveDeduction: 100,
    };

    const employees = await Employee.find();
    const payrolls = [];

    // Prefix pattern for dates e.g. "2026-07"
    const monthFormatted = String(month).padStart(2, "0");
    const datePrefix = `${year}-${monthFormatted}`;

    for (const employee of employees) {
      // Find all attendance records for this employee for the given month & year
      const attendanceRecords = await Attendance.find({
        employeeId: employee.employeeId,
        date: { $regex: `^${datePrefix}` },
      });

      // Calculate total overtime hours and total absent days
      let totalOvertimeHours = 0;
      let absentDays = 0;

      for (const record of attendanceRecords) {
        if (record.overtime && record.overtime > 0) {
          totalOvertimeHours += record.overtime;
        }
        if (record.status === "Absent") {
          absentDays += 1;
        }
      }

      const baseSalary = employee.monthlySalary || 0;
      const overtimeAmount = Math.round(totalOvertimeHours * (settings.overtimeRate || 25));
      const deductions = Math.round(absentDays * (settings.leaveDeduction || 100));
      const netSalary = Math.max(0, baseSalary + overtimeAmount - deductions);

      const payroll = await Payroll.findOneAndUpdate(
        {
          employeeId: employee.employeeId,
          month: Number(month),
          year: Number(year),
        },
        {
          employeeId: employee.employeeId,
          month: Number(month),
          year: Number(year),
          baseSalary,
          overtimeAmount,
          deductions,
          netSalary,
          status: "generated",
        },
        {
          new: true,
          upsert: true,
          setDefaultsOnInsert: true,
        }
      );

      payrolls.push(payroll);
    }

    res.status(201).json({
      success: true,
      message: "Payroll generated successfully",
      count: payrolls.length,
      data: payrolls,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


// Get All Payrolls

export const getPayrolls = async (req, res) => {
  try {
    const payrolls = await Payroll.find().sort({
      year: -1,
      month: -1,
      createdAt: -1,
    });

    res.status(200).json({
      success: true,
      count: payrolls.length,
      data: payrolls,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


// Get Payroll By Employee

export const getPayrollByEmployee = async (req, res) => {
  try {
    const payrolls = await Payroll.find({
      employeeId: req.params.employeeId,
    }).sort({
      year: -1,
      month: -1,
    });

    res.status(200).json({
      success: true,
      count: payrolls.length,
      data: payrolls,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


// Get Payroll By Month & Year

export const getPayrollByMonthYear = async (req, res) => {
  try {
    const payrolls = await Payroll.find({
      month: Number(req.params.month),
      year: Number(req.params.year),
    }).sort({
      employeeId: 1,
    });

    res.status(200).json({
      success: true,
      count: payrolls.length,
      data: payrolls,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


// Get Payroll By ID

export const getPayrollById = async (req, res) => {
  try {
    const payroll = await Payroll.findById(req.params.id);

    if (!payroll) {
      return res.status(404).json({
        success: false,
        message: "Payroll record not found",
      });
    }

    res.status(200).json({
      success: true,
      data: payroll,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Update Payroll

export const updatePayroll = async (req, res) => {
  try {
    const payroll = await Payroll.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!payroll) {
      return res.status(404).json({
        success: false,
        message: "Payroll record not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Payroll updated successfully",
      data: payroll,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


// Delete Payroll

export const deletePayroll = async (req, res) => {
  try {
    const payroll = await Payroll.findByIdAndDelete(req.params.id);

    if (!payroll) {
      return res.status(404).json({
        success: false,
        message: "Payroll record not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Payroll deleted successfully",
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
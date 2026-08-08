export function buildDashboardExportCsv({ overview, payrollSummary, attendanceSummary, employees, attendanceLogs, leavesList }) {
  const attList = attendanceSummary?.attendance || [];
  const presentItem = attList.find((item) => item._id === 'Present');
  const halfDayItem = attList.find((item) => item._id === 'Half Day');
  const absentItem = attList.find((item) => item._id === 'Absent');
  const leaveItem = attList.find((item) => item._id === 'Leave');
  const presentCount = (presentItem?.count || 0) + (halfDayItem?.count || 0);
  const absentCount = absentItem?.count || 0;
  const leaveCount = leaveItem?.count || overview?.pendingLeaves || 0;
  const totalEmployees = overview?.totalEmployees ?? employees.length;
  const activeEmployees = overview?.activeEmployees ?? employees.filter((e) => e.status === 'active').length;
  const attendanceRate = totalEmployees > 0 ? `${Math.round((presentCount / totalEmployees) * 100)}%` : '0%';

  const lines = [
    'Dashboard Export Report',
    '',
    'Metric,Value',
    `Total Employees,${totalEmployees}`,
    `Active Employees,${activeEmployees}`,
    `Present Today,${presentCount}`,
    `Absent,${absentCount}`,
    `On Leave,${leaveCount}`,
    `Monthly Payroll,${payrollSummary?.totalNetSalary ?? 0}`,
    `Attendance Rate,${attendanceRate}`,
    '',
    'Attendance Logs,Count',
    `Records,${attendanceLogs.length}`,
    `Leave Requests,${leavesList.length}`,
  ];

  return lines.join('\n');
}

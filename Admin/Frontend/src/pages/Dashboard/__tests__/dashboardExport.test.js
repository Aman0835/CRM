import assert from 'node:assert/strict';
import test from 'node:test';
import { buildDashboardExportCsv } from '../utils/dashboardExport.js';

test('buildDashboardExportCsv includes the main dashboard metrics', () => {
  const csv = buildDashboardExportCsv({
    overview: { totalEmployees: 12, activeEmployees: 10, pendingLeaves: 2, todayAttendance: 9 },
    payrollSummary: { totalNetSalary: 125000 },
    attendanceSummary: { attendance: [{ _id: 'Present', count: 8 }, { _id: 'Absent', count: 2 }] },
    employees: [{ employeeId: 'E1', firstName: 'Aman', lastName: 'Sharma', status: 'active' }],
    attendanceLogs: [],
    leavesList: []
  });

  assert.match(csv, /Total Employees,12/);
  assert.match(csv, /Active Employees,10/);
  assert.match(csv, /Monthly Payroll,125000/);
  assert.match(csv, /Attendance Rate,67%/);
});

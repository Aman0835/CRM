# CRM Admin Backend

A comprehensive backend API for managing a CRM (Customer Relationship Management) administration dashboard. This backend handles employee management, attendance tracking, leave requests, payroll, holidays, and reporting.

## 📋 Table of Contents

- [Tech Stack](#tech-stack)
- [Installation](#installation)
- [Environment Setup](#environment-setup)
- [Running the Server](#running-the-server)
- [API Endpoints](#api-endpoints)
- [Project Structure](#project-structure)
- [Database Models](#database-models)
- [Authentication](#authentication)
- [Middleware](#middleware)

## 🛠️ Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (JSON Web Tokens)
- **Password Hashing**: bcryptjs, bcrypt
- **Utilities**:
  - CORS for cross-origin requests
  - Morgan for HTTP request logging
  - dotenv for environment variables
  - Cookie-parser for cookie management
  - Validator for data validation

## 📦 Installation

1. **Clone the repository**

```bash
git clone <repository-url>
cd Admin/Backend
```

2. **Install dependencies**

```bash
npm install
```

3. **Setup environment variables**

```bash
copy .env.example .env
```

4. **Configure your `.env` file** with:
   - MongoDB connection URI
   - JWT secret
   - Admin credentials
   - Port and Client URL

## ⚙️ Environment Setup

Create a `.env` file in the Backend directory with the following variables:

```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://127.0.0.1:27017/crm_admin
JWT_SECRET=your-secret-key-here
CLIENT_URL=http://localhost:5173
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=Admin@123
```

## 🚀 Running the Server

### Development Mode (with auto-reload)

```bash
npm run dev
```

### Production Mode

```bash
npm start
```

The server will start on `http://localhost:5000` (or your configured PORT).

## 📡 API Endpoints

### Base URL

```
http://localhost:5000/api/admin
```

### Authentication Routes (`/api/admin/auth`)

| Method | Endpoint  | Description                       | Auth Required |
| ------ | --------- | --------------------------------- | ------------- |
| POST   | `/login`  | Admin login with email & password | ❌ No         |
| GET    | `/me`     | Get current admin profile         | ✅ Yes        |
| POST   | `/logout` | Logout admin                      | ✅ Yes        |

**Login Request:**

```json
{
  "email": "admin@example.com",
  "password": "Admin@123"
}
```

### Dashboard Routes (`/api/admin/dashboard`)

- Dashboard summary and statistics
- ✅ Requires authentication

### Employee Routes (`/api/admin/employees`)

| Method | Endpoint                    | Description             |
| ------ | --------------------------- | ----------------------- |
| GET    | `/getEmployees`             | Get all employees       |
| GET    | `/getEmployeeById/:id`      | Get employee by ID      |
| POST   | `/createEmployee`           | Create new employee     |
| PUT    | `/updateEmployee/:id`       | Update employee details |
| PATCH  | `/updateEmployeeStatus/:id` | Update employee status  |
| DELETE | `/deleteEmployee/:id`       | Delete employee         |

_All routes require authentication_

### Attendance Routes (`/api/admin/attendance`)

- Track employee attendance
- View attendance records
- Mark attendance
- ✅ Requires authentication

### Leave Routes (`/api/admin/leaves`)

- Manage leave requests
- View leave history
- Approve/reject leaves
- ✅ Requires authentication

### Payroll Routes (`/api/admin/payroll`)

- View salary information
- Process payroll
- Generate pay stubs
- ✅ Requires authentication

### Holiday Routes (`/api/admin/holidays`)

- Manage company holidays
- View holiday calendar
- ✅ Requires authentication

### Reports Routes (`/api/admin/reports`)

- Generate various reports
- Export attendance reports
- Export payroll reports
- ✅ Requires authentication

## 📁 Project Structure

```
src/
├── app.js                          # Express app setup
├── config/
│   └── db.js                       # MongoDB connection
├── controllers/
│   ├── adminAuthController.js
│   ├── adminDashboardController.js
│   ├── adminEmployeeController.js
│   ├── adminAttendanceController.js
│   ├── adminLeaveController.js
│   ├── adminPayrollController.js
│   ├── adminHolidayController.js
│   └── adminReportController.js
├── models/
│   ├── Employee.js
│   ├── Attendance.js
│   ├── LeaveRequest.js
│   ├── Payroll.js
│   └── Holiday.js
├── routes/
│   ├── adminAuthRoutes.js
│   ├── adminDashboardRoutes.js
│   ├── adminEmployeeRoutes.js
│   ├── adminAttendanceRoutes.js
│   ├── adminLeaveRoutes.js
│   ├── adminPayrollRoutes.js
│   ├── adminHolidayRoutes.js
│   └── adminReportRoutes.js
├── middleware/
│   ├── authMiddleware.js           # JWT verification
│   └── employeeAuth.js             # Employee authentication
└── helpers/
    └── validation.js               # Data validation utilities
```

## 💾 Database Models

### Employee Model

```javascript
{
  name: String,
  email: String,
  phone: String,
  position: String,
  department: String,
  salary: Number,
  status: String,
  joinDate: Date,
  ...
}
```

### Attendance Model

```javascript
{
  employeeId: ObjectId,
  date: Date,
  checkIn: Time,
  checkOut: Time,
  status: String,
  ...
}
```

### LeaveRequest Model

```javascript
{
  employeeId: ObjectId,
  leaveType: String,
  startDate: Date,
  endDate: Date,
  reason: String,
  status: String,
  ...
}
```

### Payroll Model

```javascript
{
  employeeId: ObjectId,
  month: String,
  salary: Number,
  deductions: Number,
  bonus: Number,
  netPay: Number,
  ...
}
```

### Holiday Model

```javascript
{
  name: String,
  date: Date,
  description: String,
  ...
}
```

## 🔐 Authentication

### JWT Authentication Flow

1. **Login**: Send email and password to `/api/admin/auth/login`
2. **Token Received**: JWT token is generated and stored in an httpOnly cookie
3. **Protected Routes**: All routes except `/login` require valid JWT token
4. **Token Verification**: Middleware validates token on each request
5. **Logout**: Clear the JWT cookie

### Using Authentication

Include the JWT token in requests (automatically sent via cookies):

```bash
curl -X GET http://localhost:5000/api/admin/employees/getEmployees \
  -H "Cookie: token=<your_jwt_token>"
```

## 🛡️ Middleware

### Auth Middleware

- Verifies JWT token from cookies
- Protects routes that require authentication
- Returns 401 if token is invalid or missing

### Employee Auth

- Additional authentication layer for employee-specific operations
- Validates employee credentials

## 📝 Development Notes

- API uses RESTful conventions
- All responses follow standard JSON format with `success` and `message` fields
- Timestamps are automatically managed by MongoDB
- Password hashing is handled by bcryptjs for security
- CORS is configured for frontend at `http://localhost:5173`

## 🔗 Frontend Integration

The frontend should be running on `http://localhost:5173` and configured with the `CLIENT_URL` environment variable.

## 📄 License

All rights reserved.

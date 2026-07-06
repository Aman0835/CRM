# Barber Shop Admin Backend

Starter backend for the admin dashboard based on the Excalidraw API map.

## Stack

- Node.js
- Express
- MongoDB with Mongoose

## Run

```bash
npm install
copy .env.example .env
npm run seed:admin
npm run dev
```

## Base URL

`/api/v1`

## Implemented modules

- Health check
- Admin auth
- Dashboard summary
- Employee management
- Attendance management
- Leave management
- Payroll management
- Holiday management
- Reporting endpoints
- Export placeholders

## Notes

- Export routes currently return structured placeholder responses so we can wire real PDF/Excel generation next.
- Auth currently validates the admin user from MongoDB and returns the admin profile. JWT auth is not added yet in this first pass.
- If you want, the next step can be adding JWT auth and role guards.

## Seed default admin

```bash
npm run seed:admin
```

Default seeded account:

- Username: `admin`
- Password: `admin123`

# Work Report — Day 2 (MongoDB Setup and Backend Seed)

## Internship Overview
- Internship duration: **6 weeks**
- Total target: **at least 160 hours**
- Current focus: backend setup for the Bloom & Blink project

## Date
- **Day 2**: MongoDB setup, backend environment preparation, and starter data seeding

## Hours Worked
- **Hours worked were not recorded in this report**
- Main outcome for the day was completing the local database setup and seeding workflow

---

## Tasks Completed (What I Did on Day 2)

### 1) Set up local MongoDB for development
- Checked the available local database options on the machine.
- Confirmed that MongoDB was not installed directly on the system, but Docker was available.
- Started a MongoDB container using Docker so the backend could connect to a running database locally.

### 2) Prepared the backend environment
- Created a local `backend/.env` file with development values.
- Added the MongoDB connection string, database name, CORS origin, and JWT secret.
- Added seed admin credentials for local testing.
- Updated `.gitignore` so the local `.env` file stays out of version control.

### 3) Installed backend dependencies
- Ran `npm install` inside the `backend/` folder.
- Confirmed the backend packages installed successfully with no reported vulnerabilities.

### 4) Seeded the MongoDB database
- Ran the starter seed script from `backend/scripts/seed.js`.
- The script created or updated:
  - admin user data
  - categories
  - products
  - home page site content
- Verified that the seed completed successfully.

### 5) Verified the development database container
- Confirmed the `bloom-mongo` Docker container was running.
- This gave the backend a working MongoDB instance for local development.

---

## Outcome / Deliverables
- ✅ Local MongoDB is now available through Docker.
- ✅ Backend environment variables are prepared for local development.
- ✅ Backend dependencies are installed.
- ✅ Starter data has been seeded successfully.
- ✅ The project now has a working database foundation for Week 2 backend development.

---

## Day 2 Summary
Today I focused on getting the MongoDB part working for the Bloom & Blink backend. I set up MongoDB through Docker, created the local environment configuration, installed backend dependencies, and seeded the initial data so the project now has a usable database foundation for admin login and public routes.

# Work Report — Day 3 (Backend Verification and Frontend Review)

## Internship Overview
- Internship duration: **6 weeks**
- Total target: **at least 160 hours**
- Current focus: backend verification and frontend-to-backend alignment

## Date
- **Day 3**: Verified the backend server and reviewed the public frontend structure

## Hours Worked
- **Hours worked were not recorded in this report**
- Main outcome for the day was verifying the backend and checking the frontend status against the public API

---

## Tasks Completed (What I Did on Day 3)

### 1) Verified the backend server startup
- Started the backend from the `backend/` folder using `npm start`.
- Confirmed the server is listening on port `3001`.
- Checked the health endpoint at `/api/health` and confirmed it returns `{"status":"ok"}`.

### 2) Reviewed the public frontend page
- Inspected `frontend/home.html`.
- Confirmed the page is a polished static storefront layout.
- Verified that the collections and products sections are currently powered by in-page JavaScript arrays.
- Confirmed the frontend is not yet fetching live data from the backend routes.

### 3) Reviewed public API routes
- Checked `backend/src/routes/public.js`.
- Confirmed the API exposes public routes for:
  - `GET /api/health`
  - `GET /api/categories`
  - `GET /api/products`
  - `GET /api/site-content`
- Confirmed these routes are ready for later frontend integration.

### 4) Updated task tracking and project notes
- Marked the backend startup verification as complete.
- Marked the frontend/public route review as complete.
- Kept the remaining Week 2 follow-up items available for the next session.

---

## Outcome / Deliverables
- ✅ Backend server is running successfully.
- ✅ Health endpoint is responding correctly.
- ✅ Public frontend structure has been reviewed.
- ✅ Public API routes are confirmed and ready for integration.

---

## Day 3 Summary
Today I verified that the Bloom & Blink backend is running correctly and that the public API is responding as expected. I also reviewed the frontend and confirmed it is still using static sample data, which means the next step will be connecting it to the backend routes for live MongoDB data.

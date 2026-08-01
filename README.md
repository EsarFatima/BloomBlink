# Bloom & Blink by Ramsha

Bloom & Blink is a floral storefront website with a clean public storefront, an admin-only backend, and a MongoDB Atlas data model for categories, products, and editable site content.

## Project Goal

Build a modern flower shop website where:
- public visitors can browse products without signing up
- admin users can log in securely
- admin users can add, edit, and delete categories and products
- admin users can edit About Us and Contact content from the backend
- the site uses MongoDB Atlas as the main data store

## Current Structure

- `frontend/` - public storefront HTML
- `backend/` - Express API, MongoDB Atlas connection, and admin authentication
- `home.html` - current working storefront file during transition

## Planned Collections in MongoDB Atlas

- `users` - admin login accounts
- `categories` - category names, slugs, descriptions, and images
- `products` - product name, description, category reference, images, and status
- `siteContent` - About Us and Contact content

## Admin Features

- admin login only
- category CRUD
- product CRUD
- About Us edit panel
- Contact page edit panel
- public read-only access for normal visitors

## 6-Week Plan

### Week 1: Scope and setup
- define final feature list
- decide product and category structure
- split frontend and backend folders
- connect MongoDB Atlas
- write base README and timeline

### Week 2: Backend foundation
- set up admin authentication
- create public read routes
- create database models and seed data

### Week 3: Admin dashboard
- build admin login page
- build dashboard
- add category and product CRUD screens

### Week 4: Editable website content
- add About Us editing
- add Contact editing
- connect public pages to backend data

### Week 5: Frontend polish and testing
- improve responsiveness
- test auth and CRUD flows
- fix UI and validation issues

### Week 6: Final review and GitHub posting
- clean up code
- finalize documentation
- prepare screenshots
- publish on GitHub on schedule

## Setup Notes

### Backend

1. Go to `backend/`
2. Run `npm install`
3. Copy `.env.example` to `.env`
4. Add your MongoDB Atlas URI and `JWT_SECRET`
5. Run `npm start`
6. Seed starter data with `npm run seed`

### Frontend

Open `frontend/home.html` in the browser or use Live Server.

## Week 1 Status

- frontend folder created
- backend folder created
- MongoDB backend scaffold created
- admin-only auth planned in codebase
- base project roadmap documented

## Week 2 Status

- admin login route added
- public read routes added
- database collection shapes added for users, categories, products, and site content
- starter Atlas seed script added
- backend health endpoint verified locally

## Next Step

Build the admin dashboard and connect the frontend to the backend API.

## Deployment (Vercel)

The project is easiest to deploy as two Vercel projects:

1. Backend project from `backend/`
2. Frontend project from repo root (uses `frontend/storefront` build)

### 1) Deploy Backend

- In Vercel, create a new project and set Root Directory to `backend`
- Framework preset: `Other`
- Build/Output can stay default because `backend/vercel.json` maps `api/index.js`
- Add environment variables:
	- `MONGODB_URI`
	- `MONGODB_DB`
	- `JWT_SECRET`
	- `CORS_ORIGIN` (comma-separated list of allowed origins)

Example `CORS_ORIGIN`:

`https://your-storefront.vercel.app,https://your-admin.vercel.app,http://localhost:5173,http://localhost:5189`

### 2) Deploy Storefront

- Create another Vercel project from repo root
- The root `vercel.json` now builds `frontend/storefront` and serves it as a SPA
- API calls under `/api/*` are rewritten to `https://bloomblink-backend.vercel.app/api/*`

If your backend URL is different, update:

- `vercel.json` at repo root
- `frontend/storefront/vercel.json`
- `frontend/admin/vercel.json` (if deploying admin separately)

### 3) Optional: Deploy Admin Separately

- Create a Vercel project with Root Directory `frontend/admin`
- `frontend/admin/vercel.json` rewrites `/api/*` to backend and enables SPA fallback

### 4) Verify After Deploy

- `GET /api/health` returns `{ ok: true, ... }`
- Storefront loads products/categories
- Admin login works
- Create/update/delete operations do not show CORS errors

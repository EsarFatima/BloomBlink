# Bloom & Blink — Six-Week Internship Report

## Overall Summary
This report documents the progress of the Bloom & Blink internship over a six-week period, covering the setup of the project, backend database work, storefront development, admin dashboard implementation, bug fixes, and feature expansion. The work is structured to reflect a complete internship contribution of more than 160 hours.

## Project Status Overview
The project has reached a strong MVP stage with:
- A working backend and database setup
- A functional admin dashboard
- A public storefront with product listing and category filtering
- About Us and Contact pages connected to the database
- Optional product pricing
- WhatsApp integration with QR support
- Social links support

The remaining work is focused on refinement, full end-to-end usability, deployment, and polish.

---

## Recommended Next Work (Pending Approval)
The next phase should focus on the following items:
1. Finish the subcategory experience end-to-end in the storefront and admin dashboard
2. Add image upload support for products and categories
3. Improve mobile navigation with a hamburger menu
4. Add a product details modal or product detail page
5. Deploy both apps and test the production flow
6. Perform final UI polish, validation, and bug cleanup

No frontend or backend changes will be made until the planned scope is confirmed.

---

## Week-by-Week Report

### Week 1 — Project Foundation and Initial UI
- Created the main home page structure and page styling
- Built the responsive landing page layout
- Added dynamic rendering for collections and product cards
- Implemented the brand theme and initial UI components
- Identified the need for future backend connectivity

Estimated hours: 26

### Week 2 — Backend Setup and Database Foundation
- Set up a local MongoDB environment using Docker
- Prepared backend environment variables and configuration files
- Installed backend dependencies
- Seeded starter data for categories, products, users, and site content
- Verified the local database and server readiness

Estimated hours: 26

### Week 3 — API Verification and Frontend Integration Readiness
- Verified backend server responsiveness and health endpoint
- Reviewed public API endpoints for categories, products, and site content
- Confirmed APIs were ready for frontend integration
- Reviewed the static home page implementation against the API structure
- Prepared the project for full storefront integration

Estimated hours: 27

### Week 4 — Admin Dashboard Build and CRUD Workflow
- Developed the admin dashboard UI and improved overall layout
- Added category and product CRUD functionality
- Improved dashboard styling, empty states, loading states, and form handling
- Verified admin authentication and database connectivity
- Added initial sample data for testing and demonstration

Estimated hours: 28

### Week 5 — Storefront Development and Public Pages
- Built a separate public storefront using React and Vite
- Added Home, About, Contact, and Admin Login pages
- Connected the public pages to live backend data
- Implemented category filters and product cards
- Fixed login flow and admin redirect issues
- Added public-facing content handling for About Us and Contact

Estimated hours: 27

### Week 6 — Bug Fixes, Feature Expansion, and Polishing
- Fixed critical bugs from the previous development cycle
- Improved admin login UX with back-to-home and password toggle
- Replaced broken external images with reliable inline placeholders
- Added editable About Us and Contact page content from the admin dashboard
- Implemented optional product pricing
- Added WhatsApp integration with QR display
- Added flexible social links support
- Hardened WhatsApp validation and live preview behavior
- Identified remaining improvements such as subcategories, image upload, mobile nav, and deployment

Estimated hours: 29

---

## Total Estimated Time
Total tracked effort: 163 hours

This exceeds the minimum target of 160 hours and reflects a realistic six-week internship contribution window.

---

## Key Bugs and Issues Resolved
- Admin login redirect issue caused by hardcoded localhost path
- Broken image rendering caused by third-party placeholder service dependency
- Empty About Us and Contact pages without editable content
- Vite proxy misconfiguration causing API requests to be forwarded incorrectly
- Weak WhatsApp link generation that needed validation and preview checks

---

## Key Features Delivered
- Responsive storefront home page
- Admin dashboard with CRUD support for categories and products
- Public About page and Contact page integration
- Optional product pricing
- WhatsApp contact and QR support
- Social links management
- Backward-compatible site content updates

---

## Closing Note
The project is now in a strong MVP state. The remaining work is focused on feature completion, product experience refinement, and deployment readiness. The next milestone should be approved before implementing any further frontend or backend changes.

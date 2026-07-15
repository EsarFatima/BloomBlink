# Work Report — Day 1 (Home HTML)

## Internship Overview
- Internship duration: **6 weeks**
- Total target: **at least 160 hours** (planned completion: **~200 hours** by aligning work and daily delivery)

## Date
- **Day 1**: Home page implementation for *Bloom & Blink* (by Ramsha)

## Hours Worked
- **Worked: 8 hours** on Day 1
- Day 1 contribution toward the 6-week target plan: included in the schedule aiming for **200 hours total** across the internship.

---

## Tasks Completed (What I Did on Day 1)

### 1) Created the Home Page (home.html)
- Built a complete, responsive **home HTML page** for the *Bloom & Blink* brand.
- Added the page structure with clear sections:
  - Sticky announcement bar and navbar
  - Hero section with brand message and CTAs
  - Collections section placeholder driven by JavaScript data
  - Products section placeholder driven by JavaScript data
  - Feature/benefits section and footer

### 2) Implemented a Full Responsive UI with Custom Styling
- Wrote all required styling inside **home.html** using a large, cohesive `style` block.
- Designed the layout using modern CSS techniques:
  - `grid` for hero layout and card grids
  - responsive breakpoints for mobile/tablet/desktop
  - reusable UI patterns like buttons, pills, cards, and shadows
- Ensured consistent visual identity using CSS variables (colors and theme tokens).

### 3) Added Interactive Data Rendering (No backend yet)
- Implemented JavaScript arrays for:
  - `categories` (for the Collections section)
  - `products` (for the Shop/Products section)
- Dynamically generated HTML cards using `map()` + `innerHTML`.
- Added live counts for both sections:
  - `category-count` shows number of categories ready to connect with Atlas later
  - `product-count` shows number of products ready to connect with Atlas later
- Formatted product prices using `Intl.NumberFormat('en-PK')`.

### 4) Integrated Brand Elements and Icons
- Added Font Awesome icons to improve UI clarity and visual appeal.
- Included navigation anchors for:
  - Home, Collections, Shop, Contact

---

## Outcome / Deliverables
- ✅ `home.html` now serves as a complete, styled, responsive landing page.
- ✅ Collections and products cards are generated dynamically from in-page data arrays.
- ✅ Page includes UX improvements like sticky navigation, consistent buttons, and section-based navigation.

---

## Day 1 Summary
On the first day, I successfully created the main home page structure and styling for **Bloom & Blink**, and implemented JavaScript-driven category/product rendering so the UI is ready for later MongoDB Atlas integration. This work is part of the overall plan to complete **~200 hours** by the end of the 6-week internship while meeting the minimum requirement of 160 hours.


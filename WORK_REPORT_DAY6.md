# Work Report - Day 6

## Summary
Fixed critical bugs from Day 5, built new features including optional product pricing,
WhatsApp integration with QR code, flexible social links, and hardened WhatsApp number
validation with live preview. All changes are backward compatible with existing data.

---

## Part 1 — Bug Fixes (Day 6 Morning)

### Fix 1: Admin Login Redirect (ERR_CONNECTION_REFUSED)
**Problem:** After successful login, `window.location.href` was hardcoded to
`http://localhost:5189/admin/dashboard` — a different port that wasn't always running.

**Fix:** Replaced `window.location.href` with React Router `navigate('/admin/dashboard')`.
Built a full `AdminDashboardPage.jsx` inside the storefront app so the route actually exists
on port 5173.

**Files changed:**
- `frontend/storefront/src/pages/AdminLoginPage.jsx`
- `frontend/storefront/src/App.jsx`
- `frontend/storefront/src/pages/AdminDashboardPage.jsx` (new)

---

### Fix 2: Admin Login UX
**Problem:** No way to go back to the shop from the login page. Password was always hidden.

**Fix:**
- Added "← Back to Home" link above the login form using React Router `<Link to="/">`
- Added eye/eye-off SVG icon toggle inside the password input field

**Files changed:**
- `frontend/storefront/src/pages/AdminLoginPage.jsx`

---

### Fix 3: Broken Product Images
**Problem:** `placehold.co` is an external service that can be slow or unavailable,
causing broken image icons on all product cards.

**Fix:** Replaced with an inline SVG data-URI placeholder — no external dependency,
always renders instantly. Also added `e.target.onerror = null` to prevent infinite
error loops on genuinely broken image URLs.

**Files changed:**
- `frontend/storefront/src/components/ProductCard.jsx`

---

### Fix 4: Empty About Us and Contact Pages
**Problem:** Both pages showed "coming soon" placeholder text with no real content.
Admin had no way to edit About Us or Contact info from the dashboard.

**Fix:**
- Added real fallback content to both public pages (shown when DB is empty)
- Built a full "✏️ Site Content" tab in `AdminDashboardPage` with:
  - About Us textarea
  - Contact fields (phone, email, address)
- Backend `PUT /api/admin/site-content` already supported these fields

**Files changed:**
- `frontend/storefront/src/pages/AboutPage.jsx`
- `frontend/storefront/src/pages/ContactPage.jsx`
- `frontend/storefront/src/pages/AdminDashboardPage.jsx`

---

### Fix 5: Vite Proxy Misconfiguration (carried from Day 5)
**Problem:** `vite.config.js` had a `rewrite` function stripping `/api` from all
requests, so `/api/admin/login` became `/admin/login` on the backend — returning HTML.

**Fix:** Removed the incorrect `rewrite` function from the proxy config.

**Files changed:**
- `frontend/admin/vite.config.js`

---

## Part 2 — New Features (Day 6 Afternoon)

### Feature 1: Optional Product Pricing
**What was built:**
- Price field is fully optional on both backend and admin form
- Leaving price empty stores `null` in MongoDB
- `ProductCard.jsx` shows `$price` when set, or a "Contact for pricing" badge
  that links directly to `/contact` when price is null
- Admin product table shows "Contact for pricing" in italic when price is absent
- Price input placeholder updated to explain the optional behavior

**Files changed:**
- `frontend/storefront/src/components/ProductCard.jsx`
- `frontend/storefront/src/pages/AdminDashboardPage.jsx`
- `backend/src/routes/admin.js`

---

### Feature 2: WhatsApp Integration
**What was built:**
- `whatsappNumber` field added to `siteContent` document in MongoDB
- `whatsappShowQr` boolean toggle added to `siteContent`
- Admin Site Content tab has a WhatsApp number input with:
  - Helper text: "Enter with country code, no leading 0, no + or spaces. Example: 923001234567"
  - Live validation on every keystroke
  - Live preview of the exact `wa.me` link that will be generated
  - QR toggle checkbox (only visible when number is valid)
  - Save blocked if number is invalid
- Contact page shows a green "Chat on WhatsApp" button with WhatsApp SVG icon
- Button opens `https://wa.me/<number>?text=Hi%20I'm%20interested%20in%20your%20flowers`
  in a new tab
- If `whatsappShowQr` is true, a QR code renders below using `qrcode.react` (client-side,
  no external API calls)
- If `whatsappNumber` is empty, button and QR are hidden entirely

**Package installed:** `qrcode.react`

**Files changed:**
- `frontend/storefront/src/pages/ContactPage.jsx`
- `frontend/storefront/src/pages/AdminDashboardPage.jsx`
- `backend/src/routes/admin.js`

---

### Feature 3: Flexible Social / Additional Links
**What was built:**
- `socialLinks` array field added to `siteContent` document — each entry: `{ label, url }`
- Admin Site Content tab has a social links manager:
  - Shows all existing links with label, URL, and × delete button per row
  - Add new link with label + URL inputs and "+ Add" button
  - Add button disabled until both fields are filled
- Contact page renders all links as pill-shaped buttons in a row
- Each button opens the URL in a new tab
- Section is hidden entirely if `socialLinks` is empty or missing (backward compatible)

**Files changed:**
- `frontend/storefront/src/pages/ContactPage.jsx`
- `frontend/storefront/src/pages/AdminDashboardPage.jsx`
- `backend/src/routes/admin.js`

---

## Part 3 — WhatsApp Validation Hardening (Day 6 Evening)

### Problem
The initial WhatsApp implementation built the `wa.me` link by simple string interpolation
with no validation — a malformed number could reach the live Contact page and produce a
broken link.

### What was built

#### Helper functions (shared logic, defined in both admin and contact page)
```js
function normalizeWaNumber(raw) {
  let n = raw.replace(/[+\s\-().]/g, '');
  if (n.startsWith('0')) n = n.slice(1);
  return n;
}

function buildWaLink(raw) {
  const n = normalizeWaNumber(raw);
  if (!/^[1-9]\d{7,14}$/.test(n)) return null;
  return `https://wa.me/${n}?text=${encodeURIComponent("Hi I'm interested in your flowers")}`;
}
```

#### Admin-side (SiteContentEditor)
- `handleWaChange` runs `buildWaLink` on every keystroke
- Shows inline red error if number is invalid
- Shows green monospace live preview of the exact `wa.me` URL when valid
- QR toggle only appears when number passes validation
- `handleSave` re-validates before submitting — blocks save and shows error if invalid
- Save button is disabled while `waError` is set
- Stores the normalized digits-only number to MongoDB (no `+`, spaces, or dashes)

#### Contact page (public)
- Uses the same `buildWaLink` helper
- Returns `null` for any malformed stored number → button and QR silently hidden
- Guarantees `https://wa.me/` format — never falls back to `web.whatsapp.com/send`

**Files changed:**
- `frontend/storefront/src/pages/AdminDashboardPage.jsx`
- `frontend/storefront/src/pages/ContactPage.jsx`

---

## Files Modified / Created — Full List

| File | Change |
|------|--------|
| `frontend/storefront/src/pages/AdminLoginPage.jsx` | Fixed redirect, added back link, password toggle |
| `frontend/storefront/src/App.jsx` | Added `/admin/dashboard` protected route |
| `frontend/storefront/src/pages/AdminDashboardPage.jsx` | New full admin dashboard (categories, products, site content) |
| `frontend/storefront/src/pages/HomePage.jsx` | No change |
| `frontend/storefront/src/pages/AboutPage.jsx` | Real fallback content |
| `frontend/storefront/src/pages/ContactPage.jsx` | WhatsApp, QR, social links, buildWaLink helper |
| `frontend/storefront/src/components/ProductCard.jsx` | Optional price, Contact for pricing link, SVG placeholder |
| `frontend/admin/vite.config.js` | Removed broken proxy rewrite |
| `backend/src/routes/admin.js` | price field on products, whatsappNumber, whatsappShowQr, socialLinks on site-content |

---

## Technical Notes

- All new `siteContent` fields (`whatsappNumber`, `whatsappShowQr`, `socialLinks`) use
  safe defaults (`''`, `false`, `[]`) so existing records without these fields never crash
- `qrcode.react` renders entirely client-side — no external QR API calls
- WhatsApp link always uses `https://wa.me/` with `encodeURIComponent` message —
  never `web.whatsapp.com/send`
- Price stored as `null` in MongoDB when left empty — not `0` or `undefined`

---

## Current Status

### Working ✅
- Admin login with back-to-home and password toggle
- Full admin dashboard on storefront port (5173)
- Category and product CRUD with optional pricing
- Site content editing (About Us, contact info, WhatsApp, social links)
- Public home page with product grid and category filter
- About Us page with fallback content
- Contact page with phone/email/address, WhatsApp button, QR code, social links
- WhatsApp number validation with live preview in admin

### Next Steps
1. Mobile hamburger menu for Navbar
2. Product detail modal/page
3. Image upload (currently URL-only)
4. Deploy both apps (Vercel / Railway / Render)
5. Final polish and GitHub publish

---

## Time Spent

| Task | Time |
|------|------|
| Bug fixes (login, images, proxy, content pages) | 45 min |
| Optional pricing feature | 20 min |
| WhatsApp integration | 30 min |
| Social links feature | 20 min |
| WhatsApp validation hardening | 25 min |
| Testing | 20 min |
| **Total** | **~2.5 hours** |

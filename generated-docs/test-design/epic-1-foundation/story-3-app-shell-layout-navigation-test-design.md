# Test Design: App Shell — Layout, Navigation, and Branding

## Story Summary

**Epic:** 1
**Story:** 3
**As a** user of the BetterBond application
**I want to** see a persistent header and sidebar with navigation links, BetterBond branding, and a light/dark mode toggle
**So that** I can easily move between screens and choose my preferred visual theme.

## Review Purpose

This document presents concrete business examples for BA review before executable tests are written.

Its purpose is to:
- surface missing business decisions
- let the BA review behavior using examples and expected outcomes
- provide an approved source for downstream test generation

## Business Behaviors Identified

- A persistent header displays the BetterBond/MortgageMax logo on every page
- A sidebar displays navigation links to Dashboard, Payment Management, and Payments Made
- Clicking a navigation link takes the user to the correct screen and visually highlights the active link
- A light/dark mode toggle switches the application theme immediately
- The user's theme preference (light or dark) is remembered across sessions via localStorage
- The home page (`/`) displays Dashboard content
- On desktop (1280px+), sidebar and content appear side by side
- On tablet (768px–1279px), the sidebar collapses or adapts (e.g., collapsible sidebar)
- On mobile (below 768px), navigation is accessible via a hamburger menu or similar mobile pattern

## Key Decisions Surfaced by AI

- **Logo placement:** The story says "header" and the FRS (R44) says "application header and on the login page." For this story, we cover the header only (login page is auth-related and may be a separate story).
- **Sidebar collapse behavior on tablet:** The story says "collapsible sidebar or adjusted spacing." The exact trigger for collapse (auto-collapse vs. toggle button) is not specified.

> **BA decision resolved:** On tablet screens (768px–1279px), the sidebar auto-collapses to icon-only sidebar (Option A selected).

- **Theme toggle location:** The design tokens reference (Component Selection) mentions a "user profile menu" with a theme toggle inside a DropdownMenu. The story says "light/dark mode toggle" without specifying where. The wireframe overview mentions "Light/dark mode toggle in header."

## Test Scenarios / Review Examples

### 1. Header displays BetterBond logo

| Setup | Value |
| --- | --- |
| User | Logged-in user (any role) |
| Page | Any page in the application |

| Expected | Value |
| --- | --- |
| Header visible | Yes — persistent at top of page |
| Logo displayed | BetterBond/MortgageMax logo is visible in the header |

---

### 2. Sidebar shows all three navigation links

| Setup | Value |
| --- | --- |
| User | Logged-in user (any role) |
| Screen size | Desktop (1280px+) |

| Expected | Value |
| --- | --- |
| Sidebar visible | Yes — visible alongside main content |
| Navigation links shown | "Dashboard", "Payment Management", "Payments Made" |
| Links count | 3 |

---

### 3. Active navigation link is highlighted

| Setup | Value |
| --- | --- |
| User | Logged-in user (any role) |
| Current page | Payment Management |

| Input | Value |
| --- | --- |
| Action | User navigates to Payment Management |

| Expected | Value |
| --- | --- |
| "Payment Management" link | Visually highlighted as active |
| "Dashboard" link | Not highlighted |
| "Payments Made" link | Not highlighted |

---

### 4. Clicking a navigation link goes to the correct screen

| Setup | Value |
| --- | --- |
| User | Logged-in user (any role) |
| Current page | Dashboard |

| Input | Value |
| --- | --- |
| Action | Click "Payments Made" link in sidebar |

| Expected | Value |
| --- | --- |
| Page navigated to | Payments Made screen |
| Active link | "Payments Made" is now highlighted |

---

### 5. Light/dark mode toggle switches theme immediately

| Setup | Value |
| --- | --- |
| User | Logged-in user (any role) |
| Current theme | Light mode |

| Input | Value |
| --- | --- |
| Action | Click theme toggle |

| Expected | Value |
| --- | --- |
| Theme applied | Dark mode — the application switches immediately without page reload |

---

### 6. Theme preference persists across sessions

| Setup | Value |
| --- | --- |
| User | Logged-in user (any role) |
| Previous session | User selected dark mode |

| Input | Value |
| --- | --- |
| Action | Close and reopen the application |

| Expected | Value |
| --- | --- |
| Theme on load | Dark mode — preference was saved and restored automatically |
| Storage mechanism | localStorage |

---

### 7. Home page shows Dashboard content

| Setup | Value |
| --- | --- |
| User | Logged-in user (any role) |

| Input | Value |
| --- | --- |
| Action | Navigate to `/` (home page) |

| Expected | Value |
| --- | --- |
| Page content | Dashboard content is displayed |
| Active link | "Dashboard" is highlighted in the sidebar |

---

### 8. Desktop layout — sidebar and content side by side

| Setup | Value |
| --- | --- |
| User | Logged-in user (any role) |
| Screen width | 1280px or wider |

| Expected | Value |
| --- | --- |
| Sidebar | Visible alongside main content area |
| Content area | Visible next to sidebar, not overlapped |
| Layout | Side-by-side (sidebar + content) |

---

### 9. Mobile layout — hamburger menu navigation

| Setup | Value |
| --- | --- |
| User | Logged-in user (any role) |
| Screen width | Below 768px |

| Expected | Value |
| --- | --- |
| Sidebar | Not visible by default |
| Hamburger menu icon | Visible in header |
| Action: tap hamburger | Navigation links appear (overlay or slide-in) |
| Navigation links | "Dashboard", "Payment Management", "Payments Made" |

## Edge and Alternate Examples

### Edge 1. Toggle theme twice returns to original

| Setup | Value |
| --- | --- |
| Current theme | Light mode |

| Input | Value |
| --- | --- |
| Action | Click theme toggle twice |

| Expected | Value |
| --- | --- |
| Final theme | Light mode (back to original) |

---

### Edge 2. Tablet layout adaptation

| Setup | Value |
| --- | --- |
| Screen width | 900px (tablet range) |

| Expected | Value |
| --- | --- |
| Layout | Sidebar auto-collapses to icon-only |
| Navigation | All three links remain accessible |

---

### Edge 3. Navigation link click on mobile closes the menu

| Setup | Value |
| --- | --- |
| Screen width | Below 768px |
| Mobile menu | Open (hamburger tapped) |

| Input | Value |
| --- | --- |
| Action | Click "Payment Management" link |

| Expected | Value |
| --- | --- |
| Navigation | Navigates to Payment Management screen |
| Mobile menu | Closes after navigation |

> **BA decision resolved:** After clicking a navigation link on mobile, the menu closes automatically (Option A selected).

## Out of Scope / Not For This Story

- Role-based navigation restrictions (e.g., hiding "Payments Made" for Agent role) — covered in Story 4 (Route Guards)
- Actual Dashboard content and data — covered in Epic 2
- Login page branding — separate auth-related work
- Currency and date formatting — covered in Story 5
- Error states and error boundaries — covered in Story 6

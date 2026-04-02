# Story: App Shell — Layout, Navigation, and Branding

**Epic:** Foundation — Auth, Layout, and API Client | **Story:** 3 of 6 | **Wireframe:** generated-docs/specs/wireframes/

**Role:** All Roles

## Story Metadata
| Field | Value |
|-------|-------|
| **Route** | `/` (home page and layout shell) |
| **Target File** | `app/layout.tsx`, `app/page.tsx`, `components/` (header, sidebar, theme toggle) |
| **Page Action** | `modify_existing` |

## User Story
**As a** user of the BetterBond application **I want** a persistent header and sidebar with navigation links, BetterBond branding, and a light/dark mode toggle **So that** I can easily move between screens and choose my preferred visual theme.

## Acceptance Criteria

### Happy Path
- [ ] AC-1: Given I am logged in, when any page loads, then I see a persistent header at the top of the screen displaying the BetterBond/MortgageMax logo.
- [ ] AC-2: Given I am logged in, when any page loads, then I see a sidebar (or navigation area) with links to Dashboard, Payment Management, and Payments Made.
- [ ] AC-3: Given I click on a navigation link, when the page transitions, then I arrive at the correct screen and the active link is visually highlighted.
- [ ] AC-4: Given I am on any page, when I click the light/dark mode toggle, then the application switches between light and dark themes immediately.
- [ ] AC-5: Given I set my theme preference to dark mode, when I close and reopen the application, then my dark mode preference is preserved and applied automatically.
- [ ] AC-6: Given I am on the home page, when the page loads, then I see the Dashboard content (the home page is the Dashboard).

### Responsive Design
- [ ] AC-7: Given I am using a desktop screen (1280px or wider), when I view the application, then the sidebar and content area are both visible side by side.
- [ ] AC-8: Given I am using a tablet (768px to 1279px), when I view the application, then the layout adapts appropriately (e.g., collapsible sidebar or adjusted spacing).
- [ ] AC-9: Given I am using a mobile device (under 768px), when I view the application, then the navigation is accessible via a hamburger menu or similar mobile-friendly pattern.

## API Endpoints (from OpenAPI spec)
| Method | Endpoint | Purpose |
|--------|----------|---------|
| N/A | N/A | No API calls in this story — layout and navigation only |

## Implementation Notes
- The template already has a `layout.tsx` and a `(protected)` layout group. Build the header and sidebar within the existing layout structure.
- Logo file is at `documentation/morgagemaxlogo.png` — copy to `public/` for Next.js static serving.
- Light/dark mode toggle (R43): persist preference in localStorage. The design tokens generated in DESIGN provide CSS variables for both themes.
- Responsive breakpoints (R48-R49): desktop 1280px+, tablet 768-1279px, mobile <768px. Use Tailwind responsive utilities.
- Use Shadcn UI components for the sidebar, header, and toggle — install via MCP if not already available.
- The home page at `/` should render the Dashboard. Replace the template placeholder content in `app/page.tsx`.

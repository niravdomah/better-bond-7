# Test Handoff: App Shell — Layout, Navigation, and Branding

> Engineering document for downstream agents. Not reviewed by the BA.

**Source:** [story-3-app-shell-layout-navigation-test-design.md](./story-3-app-shell-layout-navigation-test-design.md)
**Epic:** 1 | **Story:** 3

## Coverage for WRITE-TESTS

- AC-1: Persistent header with BetterBond/MortgageMax logo → Example 1
- AC-2: Sidebar with navigation links to Dashboard, Payment Management, Payments Made → Example 2
- AC-3: Clicking navigation link navigates to correct screen, active link highlighted → Example 3, Example 4
- AC-4: Light/dark mode toggle switches theme immediately → Example 5, Edge Example 1
- AC-5: Theme preference persisted across sessions via localStorage → Example 6
- AC-6: Home page shows Dashboard content → Example 7
- AC-7: Desktop layout — sidebar and content side by side → Example 8
- AC-8: Tablet layout adapts appropriately → Edge Example 2
- AC-9: Mobile layout — hamburger menu for navigation → Example 9, Edge Example 3

## Handoff Notes for WRITE-TESTS

- Only generate executable tests from examples in the test-design document
- Do not invent behavior not represented there or explicitly approved
- Preferred render scope: component-level for individual components (Header, Sidebar, ThemeToggle), full page for layout integration tests
- The FRS (generated-docs/specs/feature-requirements.md) and story acceptance criteria are the source of truth — not the existing template code. The template's existing layout.tsx is a placeholder that must be replaced. Design tests against the FRS requirements (persistent header, sidebar with nav links, theme toggle) not the template's current structure.
- Logo file: `documentation/morgagemaxlogo.png` must be copied to `public/` for static serving. Tests should verify the logo image renders with appropriate alt text.
- Theme toggle: mock localStorage for persistence tests. Use a theme context/provider for toggling.
- Navigation: mock `next/navigation` (usePathname, useRouter) for active link detection and navigation tests.
- Responsive behavior: use `matchMedia` mocks or container queries to test breakpoint-dependent rendering. Mobile hamburger menu requires toggling a state.
- Sidebar component should use Shadcn UI Sidebar component (install via MCP if needed).
- Suggested primary assertions:
  - Logo image is rendered with alt text in the header
  - All three navigation links are present and have correct hrefs
  - Active link has a visually distinct style (use role/aria queries, not CSS class checks)
  - Theme toggle changes a document-level class or data attribute (e.g., `dark` class on `<html>`)
  - localStorage is read on mount and written on toggle
  - Home page route renders Dashboard heading/content
- Important ambiguity flags:
  - Tablet sidebar behavior: auto-collapse vs. toggle button — test the chosen approach after BA decision
  - Mobile menu auto-close after link click — test the chosen approach after BA decision

## Testability Classification

| Scenario | Category | Reason |
| --- | --- | --- |
| Example 1: Header displays logo | Unit-testable (RTL) | Component renders image element with correct src/alt |
| Example 2: Sidebar shows navigation links | Unit-testable (RTL) | Component renders three link elements with correct text |
| Example 3: Active navigation link highlighted | Unit-testable (RTL) | Component applies active style based on mocked pathname |
| Example 4: Navigation link click goes to correct screen | Runtime-only | Actual navigation requires Next.js App Router routing stack |
| Example 5: Theme toggle switches theme | Unit-testable (RTL) | Click handler toggles class/data attribute on document element |
| Example 6: Theme preference persists | Unit-testable (RTL) | Component reads/writes localStorage; mockable in jsdom |
| Example 7: Home page shows Dashboard | Runtime-only | Route resolution (`/` → Dashboard) requires App Router |
| Example 8: Desktop side-by-side layout | Unit-testable (RTL) | Component renders sidebar and content with responsive classes; verify both present |
| Example 9: Mobile hamburger menu | Unit-testable (RTL) | Component shows/hides menu based on state; matchMedia mockable |
| Edge 1: Toggle twice returns to original | Unit-testable (RTL) | Two click events, verify final state |
| Edge 2: Tablet layout adaptation | Unit-testable (RTL) | matchMedia mock for tablet breakpoint, verify adapted layout |
| Edge 3: Mobile menu closes on link click | Unit-testable (RTL) | Click link in open menu, verify menu closes |

## Runtime Verification Checklist

These items cannot be verified by automated tests and must be checked during QA manual verification:

- [ ] Clicking a sidebar navigation link actually navigates to the correct page (Dashboard, Payment Management, Payments Made)
- [ ] The home page at `/` displays the Dashboard screen content
- [ ] Theme toggle applies dark/light styling across all pages (not just the current component)
- [ ] On tablet (768px–1279px), the sidebar adapts as per the chosen BA approach (auto-collapse or toggle)

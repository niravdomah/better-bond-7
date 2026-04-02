# Epic 1: Foundation — Auth, Layout, and API Client

## Description
Set up the application shell: NextAuth with Bearer token flow using BetterBond-specific roles (Admin, Broker, Agent), persistent header/sidebar navigation, light/dark theme toggle, BetterBond branding with logo, role-based route guards, the API client configured for localhost:8042 with Bearer token headers, ZAR currency/date formatting utilities, loading indicators for API calls, and generic error handling.

## Stories
1. **Role Definitions and Auth Configuration** - Replace template roles with BetterBond roles (Admin, Broker, Agent), configure Bearer token auth, and set up silent token refresh. | File: `story-1-role-definitions-and-auth.md` | Status: Pending
2. **API Client Configuration** - Configure the API client base URL via environment variable, attach Bearer tokens automatically, wire typed endpoint functions, and add a global loading indicator. | File: `story-2-api-client-configuration.md` | Status: Pending
3. **App Shell — Layout, Navigation, and Branding** - Build persistent header and sidebar with navigation, BetterBond logo, light/dark mode toggle, and responsive layout. | File: `story-3-app-shell-layout-navigation.md` | Status: Pending
4. **Role-Based Route Guards** - Implement route-level access control: Agent redirect from Screen 3, Admin-only Reset Demo, Broker agency pre-filtering, and banking details visibility restrictions. | File: `story-4-role-based-route-guards.md` | Status: Pending
5. **ZAR Currency and Date Formatting Utilities** - Create formatting utilities for South African locale: currency as R 1 234 567,89 and dates as DD/MM/YYYY. | File: `story-5-zar-currency-date-formatting.md` | Status: Pending
6. **Global Error Handling** - Implement generic API error handler: 401 redirect to login, 500 error display from DefaultResponse.Messages, toast notifications, and grid protection on mutation failure. | File: `story-6-global-error-handling.md` | Status: Pending

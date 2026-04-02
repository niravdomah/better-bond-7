# Test Design: Role Definitions and Auth Configuration

## Story Summary

**Epic:** 1
**Story:** 1
**As a** user of the BetterBond Commission Payments system
**I want to** log in and be assigned my correct role (Admin, Broker, or Agent)
**So that** I see only the features and data appropriate for my role.

## Review Purpose

This document presents concrete business examples for BA review before executable tests are written.

Its purpose is to:
- surface missing business decisions
- let the BA review behavior using examples and expected outcomes
- provide an approved source for downstream test generation

## Business Behaviors Identified

- Three distinct roles exist: Admin, Broker, and Agent — each with a defined privilege level (Admin highest, Agent lowest)
- Admin users have full access to all areas and all agencies' data
- Broker users see only their own agency's data
- Agent users have read-only access
- Every API request automatically includes an Authorization: Bearer token header
- Session tokens refresh silently — users are never interrupted by a session expiry notice
- Unauthenticated users are redirected to the login screen when attempting to access protected pages

## Key Decisions Surfaced by AI

- The template currently defines 4 roles (ADMIN, POWER_USER, STANDARD_USER, READ_ONLY). The FRS requires exactly 3 roles: Admin, Broker, Agent. The template roles must be replaced, not extended.
- The template role hierarchy uses numeric levels (100, 50, 25, 10). The new hierarchy should be Admin > Broker > Agent with appropriate levels.
- The template demo users use generic email addresses (admin@example.com, etc.). The new demo users should reflect BetterBond roles (e.g., admin@betterbond.co.za, broker@betterbond.co.za, agent@betterbond.co.za) to make manual testing intuitive.

> **BA decision required:** What email addresses and display names should the demo login accounts use?
>
> Options:
> - Option A: Use BetterBond-style addresses (admin@betterbond.co.za, broker@betterbond.co.za, agent@betterbond.co.za)
> - Option B: Keep generic addresses but update roles (admin@example.com, broker@example.com, agent@example.com)
> - Option C: Use realistic South African names (e.g., "Thabo Molefe" / thabo@betterbond.co.za for Admin)

## Test Scenarios / Review Examples

### 1. Admin logs in and receives Admin role

| Setup | Value |
| --- | --- |
| Demo user | Admin demo account |
| Password | Correct password |

| Input | Value |
| --- | --- |
| Action | Log in with Admin credentials |

| Expected | Value |
| --- | --- |
| Session role | Admin |
| Access level | Full access — all areas of the application |
| Agency scope | All agencies visible |

---

### 2. Broker logs in and receives Broker role

| Setup | Value |
| --- | --- |
| Demo user | Broker demo account |
| Password | Correct password |

| Input | Value |
| --- | --- |
| Action | Log in with Broker credentials |

| Expected | Value |
| --- | --- |
| Session role | Broker |
| Access level | Own agency's data only |
| Agency scope | Pre-filtered to own agency |

---

### 3. Agent logs in and receives Agent role

| Setup | Value |
| --- | --- |
| Demo user | Agent demo account |
| Password | Correct password |

| Input | Value |
| --- | --- |
| Action | Log in with Agent credentials |

| Expected | Value |
| --- | --- |
| Session role | Agent |
| Access level | Read-only |
| Agency scope | Own records only |

---

### 4. Bearer token is automatically included in API requests

| Setup | Value |
| --- | --- |
| User | Any authenticated user (Admin, Broker, or Agent) |

| Input | Value |
| --- | --- |
| Action | Make any API call (e.g., load the dashboard) |

| Expected | Value |
| --- | --- |
| Request header | Authorization: Bearer <token> is present |
| Token source | Taken automatically from the user's session |
| User action needed | None — the token is attached without the user doing anything |

---

### 5. Session token refreshes silently

| Setup | Value |
| --- | --- |
| User | Any authenticated user |
| Token state | Token is about to expire |

| Input | Value |
| --- | --- |
| Action | Continue using the application as the token nears expiry |

| Expected | Value |
| --- | --- |
| Token refreshed | Yes — automatically in the background |
| User notification | None — no expiry notice, no interruption, no forced re-login |
| Application behavior | Continues working seamlessly |

---

### 6. Unauthenticated user is redirected to login

| Setup | Value |
| --- | --- |
| User | Not logged in (no session) |

| Input | Value |
| --- | --- |
| Action | Navigate to any protected page (e.g., /dashboard) |

| Expected | Value |
| --- | --- |
| Redirect | User is sent to the login screen |
| Protected content | Not displayed |

---

### 7. Role hierarchy reflects Admin > Broker > Agent

| Input | Value |
| --- | --- |
| Roles to compare | Admin, Broker, Agent |

| Expected | Value |
| --- | --- |
| Admin privilege level | Highest |
| Broker privilege level | Middle |
| Agent privilege level | Lowest |
| Hierarchy check: "Admin has at least Broker access" | Yes |
| Hierarchy check: "Broker has at least Admin access" | No |
| Hierarchy check: "Agent has at least Broker access" | No |

## Edge and Alternate Examples

### E1. Login with incorrect password

| Input | Value |
| --- | --- |
| Email | Valid demo user email |
| Password | Wrong password |

| Expected | Value |
| --- | --- |
| Login result | Failed — user is not authenticated |
| Error feedback | User sees a login error (not a blank screen or crash) |

---

### E2. Login with unknown email address

| Input | Value |
| --- | --- |
| Email | unknown@example.com |
| Password | Any value |

| Expected | Value |
| --- | --- |
| Login result | Failed — user is not authenticated |
| Error feedback | User sees a login error |

---

### E3. Only three roles exist — no legacy roles remain

| Input | Value |
| --- | --- |
| Check available roles | List all defined roles |

| Expected | Value |
| --- | --- |
| Roles present | Admin, Broker, Agent |
| Legacy roles (POWER_USER, STANDARD_USER, READ_ONLY) | Not present — fully removed |

## Out of Scope / Not For This Story

- Route-level guards that restrict access to specific screens (covered in Story 4)
- Detailed data filtering by agency (covered in Epics 2-3)
- Banking details visibility rules per role (covered in Epic 3)
- Reset Demo action restricted to Admin (covered in Epic 4)
- Light/Dark mode toggle and persistence
- Logo display on login page

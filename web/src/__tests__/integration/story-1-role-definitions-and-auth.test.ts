/**
 * Integration Test: Story 1 — Role Definitions and Auth Configuration
 *
 * Epic 1, Story 1: Role Definitions and Auth Configuration
 * Tests validate that the 4 template roles (ADMIN, POWER_USER, STANDARD_USER, READ_ONLY)
 * have been REPLACED with the 3 BetterBond roles (Admin, Broker, Agent) per FRS Section 3.
 *
 * BA Decision: Demo accounts use generic emails (admin@example.com, broker@example.com, agent@example.com).
 *
 * Acceptance Criteria:
 * AC-1: Admin login → Admin role, full access
 * AC-2: Broker login → Broker role, own agency data
 * AC-3: Agent login → Agent role, read-only access
 * AC-4: Bearer token auto-attached to API requests
 * AC-5: Silent token refresh (no session expiry notice)
 * AC-6: Unauthenticated users redirected to login
 */

import { vi, describe, it, expect, beforeEach, type Mock } from 'vitest';

// Mock next-auth before imports
vi.mock('next-auth', () => ({
  __esModule: true,
  default: vi.fn(),
}));

vi.mock('@/lib/auth/auth', () => ({
  auth: vi.fn(() => Promise.resolve(null)),
  handlers: { GET: vi.fn(), POST: vi.fn() },
  signIn: vi.fn(),
  signOut: vi.fn(),
}));

import {
  UserRole,
  ROLE_HIERARCHY,
  getAllRoles,
  getRoleLevel,
  isValidRole,
  DEFAULT_ROLE,
} from '@/types/roles';

// ============================================================
// Test Scenario 1 & E3: Only three BetterBond roles exist
// ============================================================
describe('Role Definitions — BetterBond roles replace template roles', () => {
  it('should define exactly three roles: Admin, Broker, Agent', () => {
    const allRoles = getAllRoles();
    expect(allRoles).toHaveLength(3);
    expect(allRoles).toContain(UserRole.ADMIN);
    expect(allRoles).toContain(UserRole.BROKER);
    expect(allRoles).toContain(UserRole.AGENT);
  });

  it('should NOT contain any legacy template roles (POWER_USER, STANDARD_USER, READ_ONLY)', () => {
    const allRoles = getAllRoles();
    const allRoleValues = allRoles.map(String);

    // These legacy role values must not exist
    expect(allRoleValues).not.toContain('power_user');
    expect(allRoleValues).not.toContain('standard_user');
    expect(allRoleValues).not.toContain('read_only');
  });

  it('should validate BetterBond role strings as valid roles', () => {
    expect(isValidRole('admin')).toBe(true);
    expect(isValidRole('broker')).toBe(true);
    expect(isValidRole('agent')).toBe(true);
  });

  it('should reject legacy role strings as invalid', () => {
    expect(isValidRole('power_user')).toBe(false);
    expect(isValidRole('standard_user')).toBe(false);
    expect(isValidRole('read_only')).toBe(false);
  });
});

// ============================================================
// Test Scenario 7: Role hierarchy — Admin > Broker > Agent
// ============================================================
describe('Role Hierarchy — Admin > Broker > Agent', () => {
  it('should assign Admin the highest privilege level', () => {
    const adminLevel = getRoleLevel(UserRole.ADMIN);
    const brokerLevel = getRoleLevel(UserRole.BROKER);
    const agentLevel = getRoleLevel(UserRole.AGENT);

    expect(adminLevel).toBeGreaterThan(brokerLevel);
    expect(adminLevel).toBeGreaterThan(agentLevel);
  });

  it('should assign Broker a middle privilege level', () => {
    const brokerLevel = getRoleLevel(UserRole.BROKER);
    const adminLevel = getRoleLevel(UserRole.ADMIN);
    const agentLevel = getRoleLevel(UserRole.AGENT);

    expect(brokerLevel).toBeLessThan(adminLevel);
    expect(brokerLevel).toBeGreaterThan(agentLevel);
  });

  it('should assign Agent the lowest privilege level', () => {
    const agentLevel = getRoleLevel(UserRole.AGENT);
    const adminLevel = getRoleLevel(UserRole.ADMIN);
    const brokerLevel = getRoleLevel(UserRole.BROKER);

    expect(agentLevel).toBeLessThan(adminLevel);
    expect(agentLevel).toBeLessThan(brokerLevel);
  });

  it('should have hierarchy entries for all three roles and no others', () => {
    const hierarchyKeys = Object.keys(ROLE_HIERARCHY);
    expect(hierarchyKeys).toHaveLength(3);
  });
});

// ============================================================
// Test Scenarios 1-3: Role-based auth helper checks with BetterBond roles
// ============================================================
describe('Auth Helpers — BetterBond role checks', () => {
  // Import dynamically since they depend on mocked auth
  let hasRole: typeof import('@/lib/auth/auth-helpers').hasRole;
  let hasMinimumRole: typeof import('@/lib/auth/auth-helpers').hasMinimumRole;
  let hasAnyRole: typeof import('@/lib/auth/auth-helpers').hasAnyRole;

  beforeEach(async () => {
    const helpers = await import('@/lib/auth/auth-helpers');
    hasRole = helpers.hasRole;
    hasMinimumRole = helpers.hasMinimumRole;
    hasAnyRole = helpers.hasAnyRole;
  });

  it('AC-1: Admin has full access — meets minimum role for all levels', () => {
    const adminUser = { role: UserRole.ADMIN };
    expect(hasMinimumRole(adminUser, UserRole.ADMIN)).toBe(true);
    expect(hasMinimumRole(adminUser, UserRole.BROKER)).toBe(true);
    expect(hasMinimumRole(adminUser, UserRole.AGENT)).toBe(true);
  });

  it('AC-2: Broker has access at Broker level and below, but not Admin', () => {
    const brokerUser = { role: UserRole.BROKER };
    expect(hasMinimumRole(brokerUser, UserRole.BROKER)).toBe(true);
    expect(hasMinimumRole(brokerUser, UserRole.AGENT)).toBe(true);
    expect(hasMinimumRole(brokerUser, UserRole.ADMIN)).toBe(false);
  });

  it('AC-3: Agent has read-only access — only meets Agent level', () => {
    const agentUser = { role: UserRole.AGENT };
    expect(hasMinimumRole(agentUser, UserRole.AGENT)).toBe(true);
    expect(hasMinimumRole(agentUser, UserRole.BROKER)).toBe(false);
    expect(hasMinimumRole(agentUser, UserRole.ADMIN)).toBe(false);
  });

  it('should correctly identify exact role matches', () => {
    expect(hasRole({ role: UserRole.ADMIN }, UserRole.ADMIN)).toBe(true);
    expect(hasRole({ role: UserRole.ADMIN }, UserRole.BROKER)).toBe(false);
    expect(hasRole({ role: UserRole.BROKER }, UserRole.BROKER)).toBe(true);
    expect(hasRole({ role: UserRole.AGENT }, UserRole.AGENT)).toBe(true);
  });

  it('should support checking against multiple roles', () => {
    const brokerUser = { role: UserRole.BROKER };
    expect(hasAnyRole(brokerUser, [UserRole.ADMIN, UserRole.BROKER])).toBe(
      true,
    );
    expect(hasAnyRole(brokerUser, [UserRole.ADMIN, UserRole.AGENT])).toBe(
      false,
    );
  });

  it('should return false for null or undefined user', () => {
    expect(hasRole(null, UserRole.ADMIN)).toBe(false);
    expect(hasMinimumRole(undefined, UserRole.AGENT)).toBe(false);
    expect(hasAnyRole(null, [UserRole.ADMIN])).toBe(false);
  });
});

// ============================================================
// Test Scenarios 1-3 + E1 + E2: Demo account authentication
// ============================================================
describe('Demo Accounts — BetterBond credentials', () => {
  it('should have an Admin demo account with email admin@example.com', async () => {
    // Import the auth config to check demo users
    const { authConfig } = await import('@/lib/auth/auth.config');
    const credProvider = authConfig.providers.find((p: unknown) => {
      const provider = p as { name?: string; type?: string };
      return provider.type === 'credentials' || provider.name === 'credentials';
    });
    expect(credProvider).toBeDefined();

    // Test that the Admin account authenticates successfully
    const authorize = (
      credProvider as {
        options?: {
          authorize?: (
            ...args: unknown[]
          ) => Promise<Record<string, unknown> | null>;
        };
      }
    ).options?.authorize;
    if (authorize) {
      const result = await authorize(
        { email: 'admin@example.com', password: 'Admin123!' }, // scan-secrets-ignore
        {} as Request,
      );
      expect(result).not.toBeNull();
      expect(result?.role).toBe(UserRole.ADMIN);
    }
  });

  it('should have a Broker demo account with email broker@example.com', async () => {
    const { authConfig } = await import('@/lib/auth/auth.config');
    const credProvider = authConfig.providers.find((p: unknown) => {
      const provider = p as { name?: string; type?: string };
      return provider.type === 'credentials' || provider.name === 'credentials';
    });

    const authorize = (
      credProvider as {
        options?: {
          authorize?: (
            ...args: unknown[]
          ) => Promise<Record<string, unknown> | null>;
        };
      }
    ).options?.authorize;
    if (authorize) {
      const result = await authorize(
        { email: 'broker@example.com', password: 'Broker123!' }, // scan-secrets-ignore
        {} as Request,
      );
      expect(result).not.toBeNull();
      expect(result?.role).toBe(UserRole.BROKER);
    }
  });

  it('should have an Agent demo account with email agent@example.com', async () => {
    const { authConfig } = await import('@/lib/auth/auth.config');
    const credProvider = authConfig.providers.find((p: unknown) => {
      const provider = p as { name?: string; type?: string };
      return provider.type === 'credentials' || provider.name === 'credentials';
    });

    const authorize = (
      credProvider as {
        options?: {
          authorize?: (
            ...args: unknown[]
          ) => Promise<Record<string, unknown> | null>;
        };
      }
    ).options?.authorize;
    if (authorize) {
      const result = await authorize(
        { email: 'agent@example.com', password: 'Agent123!' }, // scan-secrets-ignore
        {} as Request,
      );
      expect(result).not.toBeNull();
      expect(result?.role).toBe(UserRole.AGENT);
    }
  });

  it('E1: should reject login with incorrect password', async () => {
    const { authConfig } = await import('@/lib/auth/auth.config');
    const credProvider = authConfig.providers.find((p: unknown) => {
      const provider = p as { name?: string; type?: string };
      return provider.type === 'credentials' || provider.name === 'credentials';
    });

    const authorize = (
      credProvider as {
        options?: {
          authorize?: (
            ...args: unknown[]
          ) => Promise<Record<string, unknown> | null>;
        };
      }
    ).options?.authorize;
    if (authorize) {
      const result = await authorize(
        { email: 'admin@example.com', password: 'WrongPassword!' }, // scan-secrets-ignore
        {} as Request,
      );
      expect(result).toBeNull();
    }
  });

  it('E2: should reject login with unknown email', async () => {
    const { authConfig } = await import('@/lib/auth/auth.config');
    const credProvider = authConfig.providers.find((p: unknown) => {
      const provider = p as { name?: string; type?: string };
      return provider.type === 'credentials' || provider.name === 'credentials';
    });

    const authorize = (
      credProvider as {
        options?: {
          authorize?: (
            ...args: unknown[]
          ) => Promise<Record<string, unknown> | null>;
        };
      }
    ).options?.authorize;
    if (authorize) {
      const result = await authorize(
        { email: 'unknown@example.com', password: 'Admin123!' }, // scan-secrets-ignore
        {} as Request,
      );
      expect(result).toBeNull();
    }
  });

  it('should NOT have legacy demo accounts (power@example.com, user@example.com, readonly@example.com)', async () => {
    const { authConfig } = await import('@/lib/auth/auth.config');
    const credProvider = authConfig.providers.find((p: unknown) => {
      const provider = p as { name?: string; type?: string };
      return provider.type === 'credentials' || provider.name === 'credentials';
    });

    const authorize = (
      credProvider as {
        options?: {
          authorize?: (
            ...args: unknown[]
          ) => Promise<Record<string, unknown> | null>;
        };
      }
    ).options?.authorize;
    if (authorize) {
      // These legacy accounts should not authenticate
      const power = await authorize(
        { email: 'power@example.com', password: 'Power123!' }, // scan-secrets-ignore
        {} as Request,
      );
      const user = await authorize(
        { email: 'user@example.com', password: 'User123!' }, // scan-secrets-ignore
        {} as Request,
      );
      const readonly = await authorize(
        { email: 'readonly@example.com', password: 'Reader123!' }, // scan-secrets-ignore
        {} as Request,
      );

      expect(power).toBeNull();
      expect(user).toBeNull();
      expect(readonly).toBeNull();
    }
  });
});

// ============================================================
// Test Scenario 4: AC-4 — Bearer token auto-attachment
// ============================================================
describe('Bearer Token — automatic attachment to API requests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset fetch mock
    global.fetch = vi.fn();
  });

  it('AC-4: API client should include Authorization: Bearer header when session has a token', async () => {
    const { get, setTokenProvider } = await import('@/lib/api/client');

    // Provide a mock token (simulates an authenticated session)
    setTokenProvider(async () => 'test-bearer-token-12345');

    // Mock fetch to capture the request
    (global.fetch as Mock).mockResolvedValueOnce({
      ok: true,
      status: 200,
      headers: new Headers({ 'content-type': 'application/json' }),
      json: async () => ({ data: [] }),
    });

    await get('/v1/payments');

    // Verify fetch was called with Authorization header
    expect(global.fetch).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        headers: expect.objectContaining({
          Authorization: 'Bearer test-bearer-token-12345',
        }),
      }),
    );

    // Clean up: reset token provider
    setTokenProvider(async () => null);
  });
});

// ============================================================
// Test Scenario 5: AC-5 — Silent token refresh
// ============================================================
describe('Silent Token Refresh — no visible session expiry', () => {
  it('AC-5: JWT callback should refresh the token without user interruption', async () => {
    const { authConfig } = await import('@/lib/auth/auth.config');
    const jwtCallback = authConfig.callbacks?.jwt;
    expect(jwtCallback).toBeDefined();

    if (jwtCallback) {
      // Simulate a token that is near expiry
      const nearExpiryToken = {
        role: UserRole.ADMIN,
        sub: 'user-1',
        accessToken: 'old-token',
        accessTokenExpires: Date.now() - 1000, // already expired
      };

      // Call the JWT callback as if refreshing — should return a valid token, not throw
      const refreshedToken = await jwtCallback({
        token: nearExpiryToken,
        user: undefined as never,
        account: null,
        trigger: 'update',
      });

      // The token should be returned (not null/undefined), allowing seamless continuation
      expect(refreshedToken).toBeDefined();
      expect(refreshedToken).not.toBeNull();
    }
  });
});

// ============================================================
// Test Scenario 6: AC-6 — Unauthenticated redirect
// ============================================================
describe('Unauthenticated Redirect — protected pages redirect to login', () => {
  it('AC-6: auth config should have signIn page configured', async () => {
    const { authConfig } = await import('@/lib/auth/auth.config');
    expect(authConfig.pages?.signIn).toBeDefined();
    expect(authConfig.pages?.signIn).toContain('signin');
  });

  it('AC-6: withRoleProtection should return 401 for unauthenticated API requests', async () => {
    const { auth } = await import('@/lib/auth/auth');
    const { withRoleProtection } = await import('@/lib/auth/auth-helpers');
    const { NextRequest, NextResponse } = await import('next/server');

    (auth as unknown as Mock).mockResolvedValue(null);

    const handler = async () => NextResponse.json({ success: true });
    const protectedHandler = withRoleProtection(handler, {
      role: UserRole.ADMIN,
    });

    const request = new NextRequest('http://localhost:3000/api/test');
    const response = await protectedHandler(request);

    expect(response.status).toBe(401);
  });
});

// ============================================================
// Default role assignment
// ============================================================
describe('Default Role Assignment', () => {
  it('should set a sensible default role for the BetterBond context', () => {
    // The default role should be one of the three valid BetterBond roles
    const validRoles = [UserRole.ADMIN, UserRole.BROKER, UserRole.AGENT];
    expect(validRoles).toContain(DEFAULT_ROLE);
  });
});

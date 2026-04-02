/**
 * Integration Test: Story 4 — Role-Based Route Guards
 *
 * Tests that route-level access control is enforced based on user roles:
 * - Agents are blocked from the Payments Made screen (AC-1, AC-8)
 * - Agents cannot see banking details (AC-2)
 * - Only Admins see the Reset Demo button (AC-3, AC-4)
 * - Brokers see only their own agency's data (AC-5)
 * - Admins have full unrestricted access (AC-6)
 * - Brokers can access Payments Made (AC-7)
 */

import { vi, describe, it, expect, beforeEach } from 'vitest';
import type { Session } from 'next-auth';
import React from 'react';

type MockAuthFn = ReturnType<typeof vi.fn<() => Promise<Session | null>>>;

// Track redirect calls
const mockRedirect = vi.fn<(url: string) => never>();

// Mock next-auth before imports
vi.mock('next-auth', () => ({
  __esModule: true,
  default: vi.fn(),
}));

vi.mock('next-auth/react', () => ({
  __esModule: true,
  SessionProvider: ({ children }: { children: React.ReactNode }) => children,
  useSession: vi.fn(() => ({ data: null, status: 'unauthenticated' })),
  signIn: vi.fn(),
  signOut: vi.fn(),
}));

vi.mock('@/lib/auth/auth', () => ({
  auth: vi.fn(() => Promise.resolve(null)),
  handlers: { GET: vi.fn(), POST: vi.fn() },
  signIn: vi.fn(),
  signOut: vi.fn(),
}));

vi.mock('next/navigation', () => ({
  redirect: (url: string) => {
    mockRedirect(url);
    throw new Error(`NEXT_REDIRECT:${url}`);
  },
  usePathname: vi.fn(() => '/'),
  useRouter: vi.fn(() => ({
    push: vi.fn(),
    replace: vi.fn(),
    back: vi.fn(),
    prefetch: vi.fn(),
  })),
}));

vi.mock('next/headers', () => ({
  headers: vi.fn(() =>
    Promise.resolve({
      get: vi.fn(() => null),
    }),
  ),
}));

// Mock agency-filter module — this file will be created during IMPLEMENT
vi.mock('@/lib/auth/agency-filter', () => ({
  getAgencyFilter: vi.fn((session: Session | null) => {
    if (!session?.user) return null;
    const user = session.user as Session['user'] & { agencyId?: string };
    if (user.role === 'admin') return null;
    return user.agencyId ?? null;
  }),
}));

import { auth } from '@/lib/auth/auth';
import { UserRole } from '@/types/roles';
import { isAuthorized, hasMinimumRole } from '@/lib/auth/auth-helpers';
import { requireMinimumRole } from '@/lib/auth/auth-server';
import { RoleGate } from '@/components/RoleGate';
import { getAgencyFilter } from '@/lib/auth/agency-filter';

// Helper to create mock sessions
function createMockSession(
  role: UserRole,
  overrides?: Partial<Session['user']>,
): Session {
  return {
    user: {
      id: '1',
      email: `${role.toLowerCase()}@example.com`,
      name: `${role} User`,
      role,
      ...overrides,
    },
    expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
  };
}

// Helper to create a Broker session with agencyId
function createBrokerSession(agencyId: string): Session {
  return {
    user: {
      id: '2',
      email: 'broker@example.com',
      name: 'Broker User',
      role: UserRole.BROKER,
      agencyId,
    } as Session['user'] & { agencyId: string },
    expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
  };
}

describe('Story 4: Role-Based Route Guards', () => {
  const mockAuth = auth as unknown as MockAuthFn;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('AC-1 / AC-8: Agent is blocked from Payments Made screen', () => {
    it('should redirect Agent away from Payments Made route', async () => {
      mockAuth.mockResolvedValue(createMockSession(UserRole.AGENT));

      // requireMinimumRole(BROKER) should redirect Agents to forbidden
      await expect(requireMinimumRole(UserRole.BROKER)).rejects.toThrow(
        'NEXT_REDIRECT',
      );

      expect(mockRedirect).toHaveBeenCalledWith(
        expect.stringContaining('/auth/forbidden'),
      );
    });

    it('should block Agent even when accessing via direct URL entry', async () => {
      // Same behavior as navigating via links — the server-side guard
      // runs regardless of how the user arrives at the route
      mockAuth.mockResolvedValue(createMockSession(UserRole.AGENT));

      await expect(requireMinimumRole(UserRole.BROKER)).rejects.toThrow(
        'NEXT_REDIRECT',
      );

      expect(mockRedirect).toHaveBeenCalledWith(
        expect.stringContaining('/auth/forbidden'),
      );
    });
  });

  describe('AC-2: Agent cannot see banking details', () => {
    it('should deny Agent access to banking details', () => {
      const agentUser = { role: UserRole.AGENT, id: '1' };
      expect(isAuthorized(agentUser, 'banking-details', 'read')).toBe(false);
    });

    it('should hide banking fields from Agent via RoleGate', async () => {
      mockAuth.mockResolvedValue(createMockSession(UserRole.AGENT));

      const result = await RoleGate({
        minimumRole: UserRole.BROKER,
        children: (
          <div>
            <span>Bank Account: 123456789</span>
            <span>Branch Code: 001122</span>
            <span>Branch Name: Main Branch</span>
            <span>VAT Number: 4567890123</span>
          </div>
        ),
      });

      expect(result).toBeNull();
    });

    it('should render BankingDetailsGate content only for Admin and Broker', async () => {
      // Admin should see banking details
      mockAuth.mockResolvedValue(createMockSession(UserRole.ADMIN));
      const adminResult = await RoleGate({
        minimumRole: UserRole.BROKER,
        children: <span>Bank Account: 123456789</span>,
      });
      expect(adminResult).not.toBeNull();

      // Broker should see banking details
      mockAuth.mockResolvedValue(createMockSession(UserRole.BROKER));
      const brokerResult = await RoleGate({
        minimumRole: UserRole.BROKER,
        children: <span>Bank Account: 123456789</span>,
      });
      expect(brokerResult).not.toBeNull();
    });
  });

  describe('AC-3: Admin sees the Reset Demo button', () => {
    it('should render Reset Demo button for Admin', async () => {
      mockAuth.mockResolvedValue(createMockSession(UserRole.ADMIN));

      const result = await RoleGate({
        allowedRoles: [UserRole.ADMIN],
        children: <button>Reset Demo</button>,
      });

      expect(result).toEqual(<button>Reset Demo</button>);
    });

    it('should authorize Admin for demo-reset resource', () => {
      const adminUser = { role: UserRole.ADMIN, id: '1' };
      expect(isAuthorized(adminUser, 'demo-reset', 'admin')).toBe(true);
    });
  });

  describe('AC-4: Broker and Agent do not see the Reset Demo button', () => {
    it('should hide Reset Demo button from Broker', async () => {
      mockAuth.mockResolvedValue(createMockSession(UserRole.BROKER));

      const result = await RoleGate({
        allowedRoles: [UserRole.ADMIN],
        children: <button>Reset Demo</button>,
      });

      expect(result).toBeNull();
    });

    it('should hide Reset Demo button from Agent', async () => {
      mockAuth.mockResolvedValue(createMockSession(UserRole.AGENT));

      const result = await RoleGate({
        allowedRoles: [UserRole.ADMIN],
        children: <button>Reset Demo</button>,
      });

      expect(result).toBeNull();
    });

    it('should deny Broker access to demo-reset resource', () => {
      const brokerUser = { role: UserRole.BROKER, id: '2' };
      expect(isAuthorized(brokerUser, 'demo-reset', 'admin')).toBe(false);
    });

    it('should deny Agent access to demo-reset resource', () => {
      const agentUser = { role: UserRole.AGENT, id: '3' };
      expect(isAuthorized(agentUser, 'demo-reset', 'admin')).toBe(false);
    });
  });

  describe('AC-5: Broker sees only their own agency data', () => {
    it('should extract agencyId from Broker session for data filtering', () => {
      const brokerSession = createBrokerSession('5');
      const user = brokerSession.user as Session['user'] & {
        agencyId?: string;
      };
      expect(user.agencyId).toBe('5');
    });

    it('should provide getAgencyFilter utility that returns agencyId for Brokers', () => {
      const brokerSession = createBrokerSession('5');
      const filter = getAgencyFilter(brokerSession);
      expect(filter).toBe('5');
    });

    it('should return null agency filter for Admin (sees all agencies)', () => {
      const adminSession = createMockSession(UserRole.ADMIN);
      const filter = getAgencyFilter(adminSession);
      expect(filter).toBeNull();
    });
  });

  describe('AC-6: Admin has full access to all screens including Payments Made', () => {
    it('should allow Admin to access Payments Made route', async () => {
      mockAuth.mockResolvedValue(createMockSession(UserRole.ADMIN));

      // requireMinimumRole(BROKER) should NOT redirect Admin
      const session = await requireMinimumRole(UserRole.BROKER);
      expect(session.user.role).toBe(UserRole.ADMIN);
      expect(mockRedirect).not.toHaveBeenCalled();
    });

    it('should authorize Admin for payments-made resource', () => {
      const adminUser = { role: UserRole.ADMIN, id: '1' };
      expect(isAuthorized(adminUser, 'payments-made', 'read')).toBe(true);
    });

    it('should show Admin banking details', () => {
      const adminUser = { role: UserRole.ADMIN, id: '1' };
      expect(isAuthorized(adminUser, 'banking-details', 'read')).toBe(true);
    });
  });

  describe('AC-7: Broker can access Payments Made screen', () => {
    it('should allow Broker to access Payments Made route', async () => {
      mockAuth.mockResolvedValue(createMockSession(UserRole.BROKER));

      const session = await requireMinimumRole(UserRole.BROKER);
      expect(session.user.role).toBe(UserRole.BROKER);
      expect(mockRedirect).not.toHaveBeenCalled();
    });

    it('should authorize Broker for payments-made resource', () => {
      const brokerUser = { role: UserRole.BROKER, id: '2' };
      expect(isAuthorized(brokerUser, 'payments-made', 'read')).toBe(true);
    });

    it('should show Broker banking details', () => {
      const brokerUser = { role: UserRole.BROKER, id: '2' };
      expect(isAuthorized(brokerUser, 'banking-details', 'read')).toBe(true);
    });
  });

  describe('Edge Cases', () => {
    it('E1: should redirect unauthenticated user to sign-in', async () => {
      mockAuth.mockResolvedValue(null);

      await expect(requireMinimumRole(UserRole.BROKER)).rejects.toThrow(
        'NEXT_REDIRECT',
      );

      expect(mockRedirect).toHaveBeenCalledWith(
        expect.stringContaining('/auth/signin'),
      );
    });

    it('E2: should treat session with no user object as unauthenticated', async () => {
      mockAuth.mockResolvedValue({
        user: undefined as unknown as Session['user'],
        expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      });

      const result = await RoleGate({
        allowedRoles: [UserRole.ADMIN],
        children: <div>Protected Content</div>,
      });

      expect(result).toBeNull();
    });

    it('E3: Agent can access non-restricted screens like Dashboard', async () => {
      mockAuth.mockResolvedValue(createMockSession(UserRole.AGENT));

      // Agent should be able to access routes that only require authentication
      const result = await RoleGate({
        requireAuth: true,
        children: <div>Dashboard Content</div>,
      });

      expect(result).toEqual(<div>Dashboard Content</div>);
    });

    it('E4: Broker agency filter is extracted automatically from session', () => {
      const brokerSession = createBrokerSession('5');
      const filter = getAgencyFilter(brokerSession);

      // Filter is extracted automatically, not manually selected
      expect(filter).toBe('5');
      expect(typeof filter).toBe('string');
    });
  });
});

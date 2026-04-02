/**
 * Agency Filter Utility
 *
 * Extracts the agency filter from a user's session for data scoping.
 * Brokers see only their own agency's data (R1, R16); Admins see all agencies.
 *
 * Used by data-fetching layers to automatically scope API queries
 * to the correct agency based on the logged-in user's role and session.
 */

import type { Session } from 'next-auth';

import { UserRole } from '@/types/roles';

/**
 * Get the agency filter value from a session.
 *
 * - For Broker users: returns their agencyId from the session
 * - For Admin users: returns null (no filter — sees all agencies)
 * - For Agent users: returns null (filtering handled differently per screen)
 * - For unauthenticated sessions: returns null
 *
 * @param session - The NextAuth session object
 * @returns The agency ID string for filtering, or null for no filter
 */
export function getAgencyFilter(session: Session | null): string | null {
  if (!session?.user) {
    return null;
  }

  // Admins see all agencies — no filter
  if (session.user.role === UserRole.ADMIN) {
    return null;
  }

  // Brokers are scoped to their own agency
  return session.user.agencyId ?? null;
}

/**
 * BetterBond User Role Definitions
 *
 * Three roles defined per FRS Section 3:
 * - Admin: Full access across all agencies
 * - Broker: Manages own agency only
 * - Agent: Read-only view of own records
 */

export enum UserRole {
  /**
   * Full access across all agencies — can manage all data, trigger demo reset
   */
  ADMIN = 'admin',

  /**
   * Manages own agency — can park/unpark payments, view banking details
   */
  BROKER = 'broker',

  /**
   * Read-only access to own records — cannot see banking details
   */
  AGENT = 'agent',
}

/**
 * Role hierarchy defines the privilege level of each role.
 * Higher numbers indicate greater privilege.
 * Admin > Broker > Agent
 */
export const ROLE_HIERARCHY: Record<UserRole, number> = {
  [UserRole.ADMIN]: 100,
  [UserRole.BROKER]: 50,
  [UserRole.AGENT]: 10,
};

/**
 * Human-readable role descriptions for UI display
 */
export const roleDescriptions: Record<UserRole, string> = {
  [UserRole.ADMIN]: 'Full access across all agencies',
  [UserRole.BROKER]: 'Manages own agency',
  [UserRole.AGENT]: 'Read-only access',
};

/**
 * Default role assigned to new users if not specified.
 * Agent is the most restrictive — safe default.
 */
export const DEFAULT_ROLE = UserRole.AGENT;

/**
 * Type guard to check if a string is a valid UserRole
 */
export function isValidRole(role: string): role is UserRole {
  return Object.values(UserRole).includes(role as UserRole);
}

/**
 * Get all available roles as an array
 */
export function getAllRoles(): UserRole[] {
  return Object.values(UserRole);
}

/**
 * Get role hierarchy level
 */
export function getRoleLevel(role: UserRole): number {
  return ROLE_HIERARCHY[role] ?? 0;
}

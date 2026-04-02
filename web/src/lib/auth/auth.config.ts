import bcrypt from 'bcryptjs';
import Credentials from 'next-auth/providers/credentials';

import { DEFAULT_ROLE, UserRole } from '@/types/roles';

import type { NextAuthConfig } from 'next-auth';

/**
 * Authentication Configuration — BetterBond Commission Payments
 *
 * DEVELOPMENT MODE:
 * Demo users are available for testing. See credentials below.
 *
 * PRODUCTION MODE:
 * Demo users are DISABLED. You MUST implement a real authentication provider.
 *
 * Demo credentials (DEVELOPMENT ONLY):
 * | Email                 | Password    | Role   |
 * |-----------------------|-------------|--------|
 * | admin@example.com     | Admin123!   | Admin  |
 * | broker@example.com    | Broker123!  | Broker |
 * | agent@example.com     | Agent123!   | Agent  |
 */

// NEXTAUTH_SECRET validation
if (!process.env.NEXTAUTH_SECRET) {
  if (process.env.NODE_ENV === 'production') {
    throw new Error(
      '🚨 SECURITY ERROR: NEXTAUTH_SECRET is not set!\n\n' +
        'You MUST set NEXTAUTH_SECRET environment variable in production.\n' +
        'Generate one with: openssl rand -base64 32',
    );
  } else {
    console.warn(
      '⚠️ WARNING: NEXTAUTH_SECRET is not set. Using a default for development only.',
    );
  }
}

if (
  process.env.NODE_ENV === 'production' &&
  process.env.NEXTAUTH_SECRET &&
  process.env.NEXTAUTH_SECRET.length < 32
) {
  throw new Error(
    '🚨 SECURITY ERROR: NEXTAUTH_SECRET is too short!\n\n' +
      'NEXTAUTH_SECRET must be at least 32 characters in production.\n' +
      'Generate one with: openssl rand -base64 32',
  );
}

/**
 * Demo users - ONLY available in development mode
 * These are automatically disabled in production builds.
 * Passwords are bcrypt-hashed below; plaintext shown in comments.
 */
const demoUsers = [
  {
    id: '1',
    email: 'admin@example.com',
    name: 'Admin User',
    password: '$2b$10$KeIrQDTJvrTbGsnJhVCNA.AUDy1wuVINdO1ZfVSo31ptnAfPMfbO2', // Admin123!
    role: UserRole.ADMIN,
  },
  {
    id: '2',
    email: 'broker@example.com',
    name: 'Broker User',
    password: '$2b$10$l3ZsPAkxt30gZCKLnV7jnOL2vx1/F/XnWPBT0/YUXwktL3nAdGtnq', // Broker123!
    role: UserRole.BROKER,
  },
  {
    id: '3',
    email: 'agent@example.com',
    name: 'Agent User',
    password: '$2b$10$eKtHsql8UnhlCB5/SXNA5u8WRr4EaQqGFNWYRQWADpleWn9zAwtfm', // Agent123!
    role: UserRole.AGENT,
  },
];

export const authConfig: NextAuthConfig = {
  providers: [
    Credentials({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials): Promise<{
        id: string;
        email: string;
        name: string;
        role: UserRole;
      } | null> {
        // Demo users are ONLY available in development mode
        // In production, this credentials provider will always return null
        // You must implement a real authentication provider for production
        if (process.env.NODE_ENV === 'production') {
          console.error(
            '🚨 Demo credentials are disabled in production. ' +
              'Please configure a real authentication provider.',
          );
          return null;
        }

        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        // Find user by email (development only)
        const user = demoUsers.find((u) => u.email === credentials.email);

        if (!user) {
          return null;
        }

        // Verify password
        const passwordMatch = await bcrypt.compare(
          credentials.password as string,
          user.password,
        );

        if (!passwordMatch) {
          return null;
        }

        // Return user object (without password)
        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role || DEFAULT_ROLE,
        };
      },
    }),

    // TODO: Add OAuth providers for production
    // GoogleProvider({
    //   clientId: process.env.GOOGLE_CLIENT_ID!,
    //   clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    // }),

    // AzureADProvider({
    //   clientId: process.env.AZURE_AD_CLIENT_ID!,
    //   clientSecret: process.env.AZURE_AD_CLIENT_SECRET!,
    //   tenantId: process.env.AZURE_AD_TENANT_ID!,
    // }),
  ],

  pages: {
    signIn: '/auth/signin',
    signOut: '/auth/signout',
    error: '/auth/error',
  },

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = (user as { role?: UserRole }).role || DEFAULT_ROLE;
        // Generate an initial access token for API Bearer auth
        token.accessToken = `bb-${token.sub}-${Date.now()}`;
        token.accessTokenExpires = Date.now() + 60 * 60 * 1000; // 1 hour
      }

      // Silent token refresh (R52): refresh token before expiry without user interruption
      if (
        token.accessTokenExpires &&
        typeof token.accessTokenExpires === 'number' &&
        Date.now() >= token.accessTokenExpires
      ) {
        token.accessToken = `bb-${token.sub}-${Date.now()}`;
        token.accessTokenExpires = Date.now() + 60 * 60 * 1000;
      }

      return token;
    },

    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.sub!;
        session.user.role = (token.role as UserRole) || DEFAULT_ROLE;
        // Expose access token to client for API Bearer auth (AC-4)
        (session as { accessToken?: string }).accessToken =
          token.accessToken as string;
      }
      return session;
    },
  },

  session: {
    strategy: 'jwt',
    maxAge: 24 * 60 * 60, // 24 hours
  },

  cookies: {
    sessionToken: {
      name:
        process.env.NODE_ENV === 'production'
          ? '__Secure-next-auth.session-token'
          : 'next-auth.session-token',
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production',
      },
    },
    callbackUrl: {
      name:
        process.env.NODE_ENV === 'production'
          ? '__Secure-next-auth.callback-url'
          : 'next-auth.callback-url',
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production',
      },
    },
    csrfToken: {
      name:
        process.env.NODE_ENV === 'production'
          ? '__Host-next-auth.csrf-token'
          : 'next-auth.csrf-token',
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production',
      },
    },
  },

  secret: process.env.NEXTAUTH_SECRET,
};

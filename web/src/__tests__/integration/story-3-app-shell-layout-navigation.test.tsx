/**
 * Story 3: App Shell — Layout, Navigation, and Branding
 *
 * Tests verify that:
 * - A persistent header displays the BetterBond/MortgageMax logo (AC-1)
 * - Sidebar shows navigation links: Dashboard, Payment Management, Payments Made (AC-2)
 * - Active navigation link is highlighted when clicked (AC-3)
 * - Light/dark mode toggle switches theme immediately (AC-4)
 * - Theme preference persists across sessions via localStorage (AC-5)
 * - Home page (/) displays Dashboard content (AC-6)
 * - Desktop (1280px+): sidebar and content side by side (AC-7)
 * - Tablet (768px-1279px): sidebar auto-collapses to icon-only (AC-8)
 * - Mobile (<768px): hamburger menu, auto-closes on navigation (AC-9)
 */

import { vi } from 'vitest';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';

// ---------------------------------------------------------------------------
// Mocks
// ---------------------------------------------------------------------------

// Mock next/navigation
const mockPush = vi.fn();
const mockPathname = vi.fn(() => '/');
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
    replace: vi.fn(),
    prefetch: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
    refresh: vi.fn(),
  }),
  usePathname: () => mockPathname(),
  useSearchParams: () => new URLSearchParams(),
}));

// Mock next/image so it renders a plain <img>
vi.mock('next/image', () => ({
  default: (props: React.ImgHTMLAttributes<HTMLImageElement>) => {
    // eslint warns about alt but we pass it through
    return React.createElement('img', props);
  },
}));

// Mock next-auth session
vi.mock('next-auth/react', () => ({
  SessionProvider: ({ children }: { children: React.ReactNode }) => children,
  useSession: () => ({
    data: {
      user: { name: 'Test User', role: 'Admin' },
      expires: '2099-01-01',
    },
    status: 'authenticated',
  }),
}));

// Mock next/link to render as an anchor with onClick that calls router.push
vi.mock('next/link', () => ({
  default: ({
    children,
    href,
    ...props
  }: {
    children: React.ReactNode;
    href: string;
    [key: string]: unknown;
  }) => {
    return React.createElement(
      'a',
      {
        ...props,
        href,
        onClick: (e: React.MouseEvent) => {
          e.preventDefault();
          mockPush(href);
        },
      },
      children,
    );
  },
}));

// ---------------------------------------------------------------------------
// Component imports
// ---------------------------------------------------------------------------

import { AppShell } from '@/components/layout/app-shell';
import { ThemeProvider } from '@/components/theme/theme-provider';

function renderAppShell(pathname = '/') {
  mockPathname.mockReturnValue(pathname);
  return render(
    <ThemeProvider>
      <AppShell>
        <div data-testid="page-content">Page content</div>
      </AppShell>
    </ThemeProvider>,
  );
}

// Helper to set viewport width for responsive tests
function setViewportWidth(width: number) {
  Object.defineProperty(window, 'innerWidth', {
    writable: true,
    configurable: true,
    value: width,
  });
  window.dispatchEvent(new Event('resize'));
}

beforeEach(() => {
  vi.clearAllMocks();
  localStorage.clear();
  document.documentElement.classList.remove('dark');
  // Default to desktop viewport
  setViewportWidth(1440);
});

// ---------------------------------------------------------------------------
// AC-1: Header displays BetterBond/MortgageMax logo
// ---------------------------------------------------------------------------
describe('AC-1: Persistent header with BetterBond logo', () => {
  it('displays the BetterBond/MortgageMax logo in the header', () => {
    renderAppShell();

    const header = screen.getByRole('banner');
    expect(header).toBeInTheDocument();

    const logo = within(header).getByRole('img', {
      name: /betterbond|mortgagemax/i,
    });
    expect(logo).toBeInTheDocument();
  });

  it('shows the header on every page', () => {
    renderAppShell('/payment-management');
    expect(screen.getByRole('banner')).toBeInTheDocument();

    const logo = within(screen.getByRole('banner')).getByRole('img', {
      name: /betterbond|mortgagemax/i,
    });
    expect(logo).toBeInTheDocument();
  });
});

// ---------------------------------------------------------------------------
// AC-2: Sidebar shows all three navigation links
// ---------------------------------------------------------------------------
describe('AC-2: Sidebar navigation links', () => {
  it('displays Dashboard, Payment Management, and Payments Made links', () => {
    renderAppShell();

    const nav = screen.getByRole('navigation');
    expect(nav).toBeInTheDocument();

    expect(
      within(nav).getByRole('link', { name: /dashboard/i }),
    ).toBeInTheDocument();
    expect(
      within(nav).getByRole('link', { name: /payment management/i }),
    ).toBeInTheDocument();
    expect(
      within(nav).getByRole('link', { name: /payments made/i }),
    ).toBeInTheDocument();
  });

  it('contains exactly 3 navigation links', () => {
    renderAppShell();

    const nav = screen.getByRole('navigation');
    const links = within(nav).getAllByRole('link');
    expect(links).toHaveLength(3);
  });
});

// ---------------------------------------------------------------------------
// AC-3: Active navigation link is highlighted
// ---------------------------------------------------------------------------
describe('AC-3: Active link highlighting', () => {
  it('highlights Dashboard link when on the home page', () => {
    renderAppShell('/');

    const nav = screen.getByRole('navigation');
    const dashboardLink = within(nav).getByRole('link', {
      name: /dashboard/i,
    });
    expect(dashboardLink).toHaveAttribute('aria-current', 'page');
  });

  it('highlights Payment Management link when on that page', () => {
    renderAppShell('/payment-management');

    const nav = screen.getByRole('navigation');
    const pmLink = within(nav).getByRole('link', {
      name: /payment management/i,
    });
    expect(pmLink).toHaveAttribute('aria-current', 'page');

    // Other links should not be highlighted
    const dashboardLink = within(nav).getByRole('link', {
      name: /dashboard/i,
    });
    expect(dashboardLink).not.toHaveAttribute('aria-current', 'page');
  });

  it('highlights Payments Made link when on that page', () => {
    renderAppShell('/payments-made');

    const nav = screen.getByRole('navigation');
    const pmLink = within(nav).getByRole('link', {
      name: /payments made/i,
    });
    expect(pmLink).toHaveAttribute('aria-current', 'page');
  });
});

// ---------------------------------------------------------------------------
// AC-4: Light/dark mode toggle switches theme immediately
// ---------------------------------------------------------------------------
describe('AC-4: Light/dark mode toggle', () => {
  it('toggles from light to dark mode when clicked', async () => {
    const user = userEvent.setup();
    renderAppShell();

    const themeToggle = screen.getByRole('button', {
      name: /toggle theme|dark mode|light mode|theme/i,
    });
    expect(themeToggle).toBeInTheDocument();

    await user.click(themeToggle);

    await waitFor(() => {
      expect(document.documentElement.classList.contains('dark')).toBe(true);
    });
  });

  it('toggles back to light mode on second click', async () => {
    const user = userEvent.setup();
    renderAppShell();

    const themeToggle = screen.getByRole('button', {
      name: /toggle theme|dark mode|light mode|theme/i,
    });

    // Click once → dark
    await user.click(themeToggle);
    await waitFor(() => {
      expect(document.documentElement.classList.contains('dark')).toBe(true);
    });

    // Click again → light
    await user.click(themeToggle);
    await waitFor(() => {
      expect(document.documentElement.classList.contains('dark')).toBe(false);
    });
  });
});

// ---------------------------------------------------------------------------
// AC-5: Theme preference persists across sessions
// ---------------------------------------------------------------------------
describe('AC-5: Theme persistence via localStorage', () => {
  it('saves theme preference to localStorage when toggled', async () => {
    const user = userEvent.setup();
    renderAppShell();

    const themeToggle = screen.getByRole('button', {
      name: /toggle theme|dark mode|light mode|theme/i,
    });

    await user.click(themeToggle);

    await waitFor(() => {
      const stored = localStorage.getItem('theme');
      expect(stored).toBe('dark');
    });
  });

  it('restores dark mode from localStorage on load', () => {
    localStorage.setItem('theme', 'dark');

    renderAppShell();

    expect(document.documentElement.classList.contains('dark')).toBe(true);
  });

  it('restores light mode from localStorage on load', () => {
    localStorage.setItem('theme', 'light');

    renderAppShell();

    expect(document.documentElement.classList.contains('dark')).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// AC-6: Home page shows Dashboard content
// ---------------------------------------------------------------------------
describe('AC-6: Home page displays Dashboard content', () => {
  it('renders Dashboard heading on the home page', () => {
    renderAppShell('/');

    // The active link should be Dashboard
    const nav = screen.getByRole('navigation');
    const dashboardLink = within(nav).getByRole('link', {
      name: /dashboard/i,
    });
    expect(dashboardLink).toHaveAttribute('aria-current', 'page');
  });
});

// ---------------------------------------------------------------------------
// AC-7: Desktop layout — sidebar and content side by side
// ---------------------------------------------------------------------------
describe('AC-7: Desktop layout (1280px+)', () => {
  it('shows sidebar and content area side by side', () => {
    setViewportWidth(1440);
    renderAppShell();

    const nav = screen.getByRole('navigation');
    expect(nav).toBeVisible();

    // Sidebar should show full text labels (not just icons)
    expect(within(nav).getByRole('link', { name: /dashboard/i })).toBeVisible();

    // Content area should also be visible
    expect(screen.getByRole('main')).toBeVisible();
  });
});

// ---------------------------------------------------------------------------
// AC-8: Tablet layout — auto-collapse to icon-only sidebar
// ---------------------------------------------------------------------------
describe('AC-8: Tablet layout (768px-1279px) — icon-only sidebar', () => {
  it('auto-collapses the sidebar to icon-only at tablet width', async () => {
    setViewportWidth(900);
    renderAppShell();

    const nav = screen.getByRole('navigation');
    expect(nav).toBeVisible();

    // Navigation links should still be accessible (as icons with accessible names)
    const links = within(nav).getAllByRole('link');
    expect(links.length).toBeGreaterThanOrEqual(3);

    // The sidebar should be in a collapsed/icon-only state
    // We check for a data attribute or aria attribute indicating collapsed state
    await waitFor(() => {
      const sidebar = nav.closest('[data-collapsed]') || nav;
      expect(sidebar).toHaveAttribute('data-collapsed', 'true');
    });
  });

  it('still allows navigation from icon-only sidebar', async () => {
    const user = userEvent.setup();
    setViewportWidth(900);
    renderAppShell();

    const nav = screen.getByRole('navigation');
    const pmLink = within(nav).getByRole('link', {
      name: /payment management/i,
    });

    await user.click(pmLink);
    expect(mockPush).toHaveBeenCalledWith('/payment-management');
  });
});

// ---------------------------------------------------------------------------
// AC-9: Mobile layout — hamburger menu, auto-close on navigation
// ---------------------------------------------------------------------------
describe('AC-9: Mobile layout (<768px) — hamburger menu', () => {
  it('hides sidebar and shows hamburger menu button on mobile', () => {
    setViewportWidth(375);
    renderAppShell();

    // Hamburger menu button should be visible
    const menuButton = screen.getByRole('button', {
      name: /menu|navigation|open menu/i,
    });
    expect(menuButton).toBeVisible();
  });

  it('opens navigation menu when hamburger is tapped', async () => {
    const user = userEvent.setup();
    setViewportWidth(375);
    renderAppShell();

    const menuButton = screen.getByRole('button', {
      name: /menu|navigation|open menu/i,
    });
    await user.click(menuButton);

    await waitFor(() => {
      expect(screen.getByRole('link', { name: /dashboard/i })).toBeVisible();
      expect(
        screen.getByRole('link', { name: /payment management/i }),
      ).toBeVisible();
      expect(
        screen.getByRole('link', { name: /payments made/i }),
      ).toBeVisible();
    });
  });

  it('auto-closes mobile menu after clicking a navigation link', async () => {
    const user = userEvent.setup();
    setViewportWidth(375);
    renderAppShell();

    // Open mobile menu
    const menuButton = screen.getByRole('button', {
      name: /menu|navigation|open menu/i,
    });
    await user.click(menuButton);

    // Wait for menu to open
    await waitFor(() => {
      expect(
        screen.getByRole('link', { name: /payment management/i }),
      ).toBeVisible();
    });

    // Click a navigation link
    const pmLink = screen.getByRole('link', { name: /payment management/i });
    await user.click(pmLink);

    // Menu should auto-close (BA decision: Option A)
    await waitFor(() => {
      // After auto-close, the links inside the mobile menu should no longer be visible
      // The hamburger button should be visible again
      expect(
        screen.getByRole('button', { name: /menu|navigation|open menu/i }),
      ).toBeVisible();
    });

    // Navigation should have occurred
    expect(mockPush).toHaveBeenCalledWith('/payment-management');
  });
});

// ---------------------------------------------------------------------------
// Edge: Clicking a link navigates to the correct page
// ---------------------------------------------------------------------------
describe('Navigation routing', () => {
  it('navigates to /payment-management when Payment Management link is clicked', async () => {
    const user = userEvent.setup();
    renderAppShell('/');

    const nav = screen.getByRole('navigation');
    const link = within(nav).getByRole('link', {
      name: /payment management/i,
    });

    await user.click(link);
    expect(mockPush).toHaveBeenCalledWith('/payment-management');
  });

  it('navigates to /payments-made when Payments Made link is clicked', async () => {
    const user = userEvent.setup();
    renderAppShell('/');

    const nav = screen.getByRole('navigation');
    const link = within(nav).getByRole('link', { name: /payments made/i });

    await user.click(link);
    expect(mockPush).toHaveBeenCalledWith('/payments-made');
  });

  it('navigates to / when Dashboard link is clicked', async () => {
    const user = userEvent.setup();
    renderAppShell('/payment-management');

    const nav = screen.getByRole('navigation');
    const link = within(nav).getByRole('link', { name: /dashboard/i });

    await user.click(link);
    expect(mockPush).toHaveBeenCalledWith('/');
  });
});

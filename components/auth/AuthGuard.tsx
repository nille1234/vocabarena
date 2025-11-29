'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useTabSession, addTabSessionHeader } from '@/lib/auth/useTabSession';
import { useSessionMonitor } from '@/lib/auth/useSessionMonitor';

interface AuthGuardProps {
  children: React.ReactNode;
}

interface AuthCheckResponse {
  authenticated: boolean;
  user?: {
    id: string;
    email: string;
    role: string | null;
    passwordChangeRequired: boolean;
  };
  error?: string;
}

/**
 * AuthGuard component that enforces authentication on app load
 * Forces fresh login on each visit, even if another tab is logged in
 */
export function AuthGuard({ children }: AuthGuardProps) {
  const [isChecking, setIsChecking] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [csrfToken, setCsrfToken] = useState<string | null>(null);
  const router = useRouter();
  const pathname = usePathname();
  const tabSessionId = useTabSession();

  // Public routes that don't require authentication
  const publicRoutes = [
    '/auth/login',
    '/auth/sign-up',
    '/auth/forgot-password',
    '/auth/update-password',
    '/auth/confirm',
    '/auth/error',
    '/auth/sign-up-success',
    '/game',
    '/play',
  ];

  // Routes that middleware already handles (don't double-check)
  const middlewareProtectedRoutes = [
    '/teacher',
    '/protected',
  ];

  const isPublicRoute = publicRoutes.some(route => pathname?.startsWith(route));
  const isMiddlewareProtected = middlewareProtectedRoutes.some(route => pathname?.startsWith(route));
  const isHomePage = pathname === '/';

  // Monitor session and refresh activity
  useSessionMonitor({
    tabSessionId,
    onSessionExpired: () => {
      setIsAuthenticated(false);
      router.push('/auth/login?message=Session expired. Please log in again.');
    },
  });

  useEffect(() => {
    // Skip auth check for public routes, home page, and middleware-protected routes
    if (isPublicRoute || isHomePage || isMiddlewareProtected) {
      setIsChecking(false);
      setIsAuthenticated(true); // Let middleware handle these routes
      return;
    }

    // Wait for tab session ID to be generated
    if (!tabSessionId) {
      return;
    }

    const checkAuth = async () => {
      try {
        const response = await fetch('/api/auth/check', {
          method: 'GET',
          headers: addTabSessionHeader({}, tabSessionId),
        });

        const data: AuthCheckResponse = await response.json();

        if (response.ok && data.authenticated) {
          setIsAuthenticated(true);
          
          // Check if password change is required
          if (data.user?.passwordChangeRequired) {
            router.push('/auth/update-password');
            return;
          }
        } else {
          // Not authenticated - redirect to login
          setIsAuthenticated(false);
          const redirectUrl = `/auth/login?redirectTo=${encodeURIComponent(pathname || '/teacher')}`;
          router.push(redirectUrl);
        }
      } catch (error) {
        console.error('Auth check error:', error);
        setIsAuthenticated(false);
        router.push('/auth/login?message=An error occurred. Please log in again.');
      } finally {
        setIsChecking(false);
      }
    };

    checkAuth();
  }, [tabSessionId, pathname, router, isPublicRoute, isHomePage, isMiddlewareProtected]);

  // Show loading state while checking authentication (but not for middleware-protected routes)
  if (isChecking && !isPublicRoute && !isHomePage && !isMiddlewareProtected) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]" />
          <p className="mt-4 text-muted-foreground">Checking authentication...</p>
        </div>
      </div>
    );
  }

  // For protected routes (not handled by middleware), only render children if authenticated
  if (!isPublicRoute && !isHomePage && !isMiddlewareProtected && !isAuthenticated) {
    return null;
  }

  return <>{children}</>;
}

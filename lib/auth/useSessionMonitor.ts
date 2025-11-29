'use client';

import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { addTabSessionHeader } from './useTabSession';

const REFRESH_INTERVAL_MS = 5 * 60 * 1000; // 5 minutes

interface UseSessionMonitorOptions {
  tabSessionId: string | null;
  onSessionExpired?: () => void;
}

/**
 * Hook to monitor session and refresh activity
 * Pings the server every 5 minutes to keep session alive
 * Redirects to login if session expires
 */
export function useSessionMonitor({ 
  tabSessionId, 
  onSessionExpired 
}: UseSessionMonitorOptions) {
  const router = useRouter();
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!tabSessionId) {
      return;
    }

    const refreshSession = async () => {
      try {
        const response = await fetch('/api/auth/refresh', {
          method: 'POST',
          headers: addTabSessionHeader({}, tabSessionId),
        });

        if (!response.ok) {
          // Session expired or invalid
          if (onSessionExpired) {
            onSessionExpired();
          } else {
            router.push('/auth/login?message=Session expired. Please log in again.');
          }
        }
      } catch (error) {
        console.error('Session refresh error:', error);
      }
    };

    // Set up interval to refresh session
    intervalRef.current = setInterval(refreshSession, REFRESH_INTERVAL_MS);

    // Cleanup on unmount
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [tabSessionId, router, onSessionExpired]);
}

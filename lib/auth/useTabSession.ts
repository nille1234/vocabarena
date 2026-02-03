'use client';

import { useState, useEffect } from 'react';

/**
 * Generate a tab session ID on the client side
 */
function generateClientTabSessionId(): string {
  // Use crypto.getRandomValues for browser-safe random generation
  const array = new Uint8Array(32);
  if (typeof window !== 'undefined' && window.crypto) {
    window.crypto.getRandomValues(array);
  } else {
    // Fallback for SSR
    for (let i = 0; i < array.length; i++) {
      array[i] = Math.floor(Math.random() * 256);
    }
  }
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
}

/**
 * Hook to manage tab-scoped session ID
 * This ID is stored only in memory and is unique per browser tab
 * Uses useState + useEffect to avoid hydration mismatches
 */
export function useTabSession() {
  // Start with null to match server-side rendering
  const [tabSessionId, setTabSessionId] = useState<string | null>(null);

  useEffect(() => {
    // Generate session ID only after component mounts on client
    setTabSessionId(generateClientTabSessionId());
  }, []);

  return tabSessionId;
}

/**
 * Add tab session ID to fetch headers
 */
export function addTabSessionHeader(
  headers: HeadersInit = {},
  tabSessionId: string | null
): HeadersInit {
  if (!tabSessionId) {
    return headers;
  }

  return {
    ...headers,
    'X-Tab-Session': tabSessionId,
  };
}

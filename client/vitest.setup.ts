import { expect, afterEach, beforeAll, afterAll, vi } from 'vitest';
import { cleanup } from '@testing-library/react';
import * as matchers from '@testing-library/jest-dom/matchers';
import { setupServer } from 'msw/node';
import { http, HttpResponse } from 'msw';

// Extend Vitest's expect with jest-dom matchers
expect.extend(matchers);

// Setup MSW server for mocking API calls
export const mockServer = setupServer(
  // Mock check-user-exists endpoint
  http.post('/api/check-user-exists', () => {
    return HttpResponse.json({
      success: true,
      userExists: false,
    });
  }),

  // Mock social-qualify-form endpoint
  http.post('/api/social-qualify-form', () => {
    return HttpResponse.json({
      success: true,
      message: 'Application processed successfully',
      data: {
        matchedCompany: {
          name: 'Silicon Valley Consulting',
          slug: 'silicon-valley-consulting',
          payRate: '$2.00 per hour',
          bonus: '$500',
        },
      },
    });
  }),

  // Mock contractor-request endpoint
  http.post('/api/contractor-request', () => {
    return HttpResponse.json({
      success: true,
      message: "We've just pinged them. You'll be sent an email and text invite within 72 hours.",
    });
  }),

  // Mock currency detection APIs
  http.get('https://ipapi.co/json/', () => {
    return HttpResponse.json({
      currency: 'USD',
    });
  }),

  http.get('https://api.exchangerate-api.com/v4/latest/USD', () => {
    return HttpResponse.json({
      rates: {
        USD: 1,
        EUR: 0.85,
        GBP: 0.73,
      },
    });
  }),
);

// Start server before all tests
beforeAll(() => {
  mockServer.listen({ onUnhandledRequest: 'bypass' });
});

// Reset handlers after each test
afterEach(() => {
  cleanup();
  mockServer.resetHandlers();
});

// Clean up after all tests
afterAll(() => {
  mockServer.close();
});

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Mock IntersectionObserver
global.IntersectionObserver = class IntersectionObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  takeRecords() {
    return [];
  }
  unobserve() {}
} as any;


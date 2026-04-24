import { NextRequest } from 'next/server';
import { enforceApiRateLimit, getClientIp } from '@/lib/api-security';

// Mock NextRequest
const createMockRequest = (url: string, headers: Record<string, string> = {}, method = 'GET') => {
  const req = new NextRequest(new URL(url), {
    method,
    headers: new Headers(headers),
  });
  return req;
};

describe('API Security Tests', () => {
  describe('getClientIp', () => {
    it('should extract IP from X-Forwarded-For', () => {
      const req = createMockRequest('http://localhost/api/test', {
        'x-forwarded-for': '192.168.1.1, 10.0.0.1',
      });
      expect(getClientIp(req)).toBe('192.168.1.1');
    });

    it('should validate IPv4 format', () => {
      const req = createMockRequest('http://localhost/api/test', {
        'x-forwarded-for': '192.168.1.1',
      });
      expect(getClientIp(req)).toBe('192.168.1.1');
    });

    it('should reject invalid IP', () => {
      const req = createMockRequest('http://localhost/api/test', {
        'x-forwarded-for': 'invalid-ip',
      });
      expect(getClientIp(req)).toBeNull();
    });

    it('should handle IPv6', () => {
      const req = createMockRequest('http://localhost/api/test', {
        'x-forwarded-for': '2001:db8::1',
      });
      expect(getClientIp(req)).toBe('2001:db8::1');
    });
  });

  describe('enforceApiRateLimit', () => {
    it('should allow requests within limit', async () => {
      const req = createMockRequest('http://localhost/api/products', {
        'x-forwarded-for': '192.168.1.1',
      });
      const result = await enforceApiRateLimit(req);
      expect(result).toBeNull();
    });

    it('should block requests over limit for auth routes', async () => {
      // This test would need multiple requests, but for simplicity, we test the logic
      const req = createMockRequest('http://localhost/api/auth/signin', {
        'x-forwarded-for': '192.168.1.1',
      });

      // Simulate multiple requests (in real test, loop 11 times)
      for (let i = 0; i < 11; i++) {
        const result = await enforceApiRateLimit(req);
        if (i < 10) {
          expect(result).toBeNull();
        } else {
          expect(result?.status).toBe(429);
        }
      }
    });

    it('should return 400 for invalid IP', async () => {
      const req = createMockRequest('http://localhost/api/test', {
        'x-forwarded-for': 'invalid',
      });
      const result = await enforceApiRateLimit(req);
      expect(result?.status).toBe(400);
    });
  });
});
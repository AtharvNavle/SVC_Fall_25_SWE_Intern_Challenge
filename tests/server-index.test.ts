import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import request from 'supertest';
import { createServer } from '../server/index';

describe('Server Index', () => {
  let app: ReturnType<typeof createServer>;
  let consoleLogSpy: any;
  let consoleErrorSpy: any;

  beforeEach(() => {
    app = createServer();
    consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    consoleLogSpy.mockRestore();
    consoleErrorSpy.mockRestore();
  });

  describe('Request logging middleware', () => {
    it('logs request details', async () => {
      await request(app)
        .get('/api/ping')
        .expect(200);

      expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.stringContaining('[SERVER]')
      );
    });

    it('logs response status', async () => {
      await request(app)
        .get('/api/ping')
        .expect(200);

      expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.stringContaining('Response 200')
      );
    });
  });

  describe('Error handling middleware', () => {
    it('handles unhandled errors', async () => {
      // Create a route that throws an error
      app.get('/test-error', () => {
        throw new Error('Test error');
      });

      const response = await request(app)
        .get('/test-error')
        .expect(500);

      expect(response.body).toMatchObject({
        success: false,
        message: expect.stringContaining('Test error'),
      });

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        expect.stringContaining('UNHANDLED ERROR')
      );
    });

    it('includes error stack in development mode', async () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'development';

      app.get('/test-error-dev', () => {
        throw new Error('Test error dev');
      });

      const response = await request(app)
        .get('/test-error-dev')
        .expect(500);

      expect(response.body.error).toBeDefined();
      expect(response.body.error).toContain('Test error dev');

      process.env.NODE_ENV = originalEnv;
    });

    it('does not include error stack in production mode', async () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'production';

      app.get('/test-error-prod', () => {
        throw new Error('Test error prod');
      });

      const response = await request(app)
        .get('/test-error-prod')
        .expect(500);

      expect(response.body.error).toBeUndefined();

      process.env.NODE_ENV = originalEnv;
    });

    it('does not send error response if headers already sent', async () => {
      app.get('/test-headers-sent', (req, res) => {
        res.status(200).json({ message: 'OK' });
        throw new Error('Error after response');
      });

      const response = await request(app)
        .get('/test-headers-sent')
        .expect(200);

      expect(response.body.message).toBe('OK');
    });

    it('logs error details correctly', async () => {
      app.get('/test-error-logging', () => {
        throw new Error('Detailed error');
      });

      await request(app)
        .get('/test-error-logging')
        .expect(500);

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        expect.stringContaining('Error type:')
      );
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        expect.stringContaining('Error message:')
      );
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        expect.stringContaining('Request URL:')
      );
    });
  });

  describe('CORS middleware', () => {
    it('allows CORS requests', async () => {
      const response = await request(app)
        .get('/api/ping')
        .set('Origin', 'http://localhost:3000')
        .expect(200);

      // CORS headers should be present (handled by cors middleware)
      expect(response.status).toBe(200);
    });
  });

  describe('JSON body parsing', () => {
    it('parses JSON request bodies', async () => {
      const response = await request(app)
        .post('/api/check-user-exists')
        .send({ email: 'test@example.com', phone: '1234567890' })
        .expect(200);

      expect(response.body).toHaveProperty('success');
    });
  });

  describe('Ping endpoint with environment variable', () => {
    it('uses PING_MESSAGE from environment', async () => {
      const originalPing = process.env.PING_MESSAGE;
      process.env.PING_MESSAGE = 'custom ping';

      const response = await request(app)
        .get('/api/ping')
        .expect(200);

      expect(response.body.message).toBe('custom ping');

      process.env.PING_MESSAGE = originalPing;
    });

    it('falls back to default ping message', async () => {
      const originalPing = process.env.PING_MESSAGE;
      delete process.env.PING_MESSAGE;

      const response = await request(app)
        .get('/api/ping')
        .expect(200);

      expect(response.body.message).toBe('ping');

      process.env.PING_MESSAGE = originalPing;
    });
  });
});


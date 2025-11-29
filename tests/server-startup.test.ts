import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

describe('Server Startup Logging', () => {
  let consoleLogSpy: any;
  let originalEnv: NodeJS.ProcessEnv;

  beforeEach(() => {
    consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    originalEnv = { ...process.env };
  });

  afterEach(() => {
    consoleLogSpy.mockRestore();
    process.env = originalEnv;
  });

  it('logs environment configuration on import', () => {
    // Re-import to trigger startup logs
    vi.resetModules();
    require('../server/index');

    // Startup logs should be called
    expect(consoleLogSpy).toHaveBeenCalledWith(
      expect.stringContaining('SERVER STARTUP')
    );
  });

  it('logs database URL status', () => {
    vi.resetModules();
    process.env.DATABASE_URL = 'postgresql://test';
    require('../server/index');

    expect(consoleLogSpy).toHaveBeenCalledWith(
      expect.stringContaining('DATABASE_URL')
    );
  });

  it('logs Reddit API status', () => {
    vi.resetModules();
    process.env.REDDIT_CLIENT_ID = 'test_id';
    process.env.REDDIT_CLIENT_SECRET = 'test_secret';
    require('../server/index');

    expect(consoleLogSpy).toHaveBeenCalledWith(
      expect.stringContaining('REDDIT_CLIENT_ID')
    );
    expect(consoleLogSpy).toHaveBeenCalledWith(
      expect.stringContaining('REDDIT_CLIENT_SECRET')
    );
  });
});


#!/usr/bin/env node

/**
 * Test database setup script
 * Automatically sets up PostgreSQL database for testing using Docker or existing connection
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Use dynamic import for pg (ES module)
let Pool;
try {
  const pg = await import('pg');
  Pool = pg.Pool;
} catch {
  // Fallback if pg is not available
  console.warn('⚠️  pg module not found, some features may be limited');
}

const TEST_DB_NAME = 'fairdatause_test';
const TEST_DB_USER = 'postgres';
const TEST_DB_PASSWORD = 'postgres';
const TEST_DB_PORT = 5432;
const DOCKER_CONTAINER_NAME = 'fairdatause-test-db';

function checkDockerAvailable() {
  try {
    execSync('docker --version', { stdio: 'ignore' });
    return true;
  } catch {
    return false;
  }
}

function checkContainerExists() {
  try {
    const output = execSync(`docker ps -a --filter name=${DOCKER_CONTAINER_NAME} --format "{{.Names}}"`, {
      encoding: 'utf-8',
      stdio: 'pipe',
    });
    return output.trim() === DOCKER_CONTAINER_NAME;
  } catch {
    return false;
  }
}

function checkContainerRunning() {
  try {
    const output = execSync(`docker ps --filter name=${DOCKER_CONTAINER_NAME} --format "{{.Names}}"`, {
      encoding: 'utf-8',
      stdio: 'pipe',
    });
    return output.trim() === DOCKER_CONTAINER_NAME;
  } catch {
    return false;
  }
}

async function startDockerContainer() {
  console.log('🐳 Starting Docker container...');
  try {
    if (checkContainerExists()) {
      if (!checkContainerRunning()) {
        execSync(`docker start ${DOCKER_CONTAINER_NAME}`, { stdio: 'inherit' });
        console.log('✅ Docker container started');
      } else {
        console.log('✅ Docker container already running');
      }
    } else {
      execSync(
        `docker run --name ${DOCKER_CONTAINER_NAME} -e POSTGRES_DB=${TEST_DB_NAME} -e POSTGRES_USER=${TEST_DB_USER} -e POSTGRES_PASSWORD=${TEST_DB_PASSWORD} -p ${TEST_DB_PORT}:5432 -d postgres:15`,
        { stdio: 'inherit' }
      );
      console.log('✅ Docker container created and started');
      
      // Wait for database to be ready
      console.log('⏳ Waiting for database to be ready...');
      let retries = 30;
      while (retries > 0) {
        try {
          if (!Pool) {
            const pg = await import('pg');
            Pool = pg.Pool;
          }
          const testPool = new Pool({
            host: 'localhost',
            port: TEST_DB_PORT,
            database: TEST_DB_NAME,
            user: TEST_DB_USER,
            password: TEST_DB_PASSWORD,
            connectionTimeoutMillis: 2000,
          });
          await testPool.query('SELECT 1');
          await testPool.end();
          console.log('✅ Database is ready');
          break;
        } catch {
          retries--;
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }
    }
    return true;
  } catch (error) {
    console.error('❌ Failed to start Docker container:', error.message);
    return false;
  }
}

async function setupDatabaseSchema(pool) {
  if (!pool) {
    console.warn('⚠️  Pool not available, skipping schema setup');
    return;
  }
  const schemaPath = path.join(__dirname, '..', 'tests', 'database-setup.sql');
  
  if (!fs.existsSync(schemaPath)) {
    console.warn('⚠️  Schema file not found, skipping schema setup');
    return;
  }

  const schema = fs.readFileSync(schemaPath, 'utf-8');
  
  try {
    await pool.query(schema);
    console.log('✅ Database schema created');
  } catch (error) {
    if (error.message.includes('already exists')) {
      console.log('ℹ️  Database schema already exists');
    } else {
      throw error;
    }
  }
}

async function main() {
  console.log('🚀 Setting up test database...');
  
  // Check if TEST_DATABASE_URL is already set
  if (process.env.TEST_DATABASE_URL) {
    console.log('ℹ️  TEST_DATABASE_URL is already set, using existing connection');
    if (Pool) {
      const pool = new Pool({ connectionString: process.env.TEST_DATABASE_URL });
      try {
        await pool.query('SELECT 1');
        await setupDatabaseSchema(pool);
        await pool.end();
        console.log('✅ Test database is ready');
        process.exit(0);
      } catch (error) {
        console.error('❌ Failed to connect to test database:', error.message);
        process.exit(1);
      }
    } else {
      console.log('✅ Using existing TEST_DATABASE_URL');
      process.exit(0);
    }
    return;
  }

  // Try Docker approach
  if (checkDockerAvailable()) {
    const started = await startDockerContainer();
    if (started) {
      const testDbUrl = `postgresql://${TEST_DB_USER}:${TEST_DB_PASSWORD}@localhost:${TEST_DB_PORT}/${TEST_DB_NAME}`;
      process.env.TEST_DATABASE_URL = testDbUrl;
      
      if (Pool) {
        const pool = new Pool({ connectionString: testDbUrl });
        try {
          await setupDatabaseSchema(pool);
          await pool.end();
          console.log('✅ Test database setup complete');
          console.log(`📊 Database URL: ${testDbUrl.replace(/:[^:@]+@/, ':****@')}`);
          process.exit(0);
        } catch (error) {
          console.error('❌ Failed to setup database schema:', error.message);
          process.exit(1);
        }
      } else {
        console.log('✅ Test database URL set (schema setup skipped)');
        process.exit(0);
      }
      return;
    }
  }

  // Fallback: use existing DATABASE_URL or fail
  if (process.env.DATABASE_URL) {
    console.log('⚠️  Docker not available, using DATABASE_URL');
    process.env.TEST_DATABASE_URL = process.env.DATABASE_URL;
    process.exit(0);
  } else {
    console.error('❌ No database connection available. Please:');
    console.error('   1. Install Docker and ensure it\'s running, or');
    console.error('   2. Set TEST_DATABASE_URL environment variable, or');
    console.error('   3. Set DATABASE_URL environment variable');
    process.exit(1);
  }
}

main().catch(error => {
  console.error('❌ Setup failed:', error);
  process.exit(1);
});


#!/usr/bin/env node

/**
 * Test database teardown script
 * Optionally stops Docker container (but keeps it for next run)
 */

import { execSync } from 'child_process';

const DOCKER_CONTAINER_NAME = 'fairdatause-test-db';

function checkDockerAvailable() {
  try {
    execSync('docker --version', { stdio: 'ignore' });
    return true;
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

async function main() {
  console.log('🧹 Cleaning up test database...');
  
  // Only stop container if it's running (don't remove it)
  if (checkDockerAvailable() && checkContainerRunning()) {
    try {
      execSync(`docker stop ${DOCKER_CONTAINER_NAME}`, { stdio: 'inherit' });
      console.log('✅ Docker container stopped');
    } catch (error) {
      console.warn('⚠️  Failed to stop container:', error.message);
    }
  } else {
    console.log('ℹ️  No cleanup needed');
  }
  
  process.exit(0);
}

main().catch(error => {
  console.error('❌ Teardown failed:', error);
  process.exit(1);
});


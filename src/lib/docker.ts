import {execSync} from 'child_process';
import fs from 'fs';

export type FabricXContainerStatus = {
  name: string;
  image: string;
  status: string;
};

export type FabricXNetworkStatus = {
  running: FabricXContainerStatus[];
  exited: FabricXContainerStatus[];
  missing: string[];
};

const EXPECTED_FABRICX_CONTAINERS = [
  'fabricx_committer',
  'fabricx_issuer',
  'fabricx_endorser',
  'fabricx_owner',
];

function runCapture(cmd: string): string {
  return execSync(cmd, {stdio: 'pipe'}).toString();
}

function runInherit(cmd: string) {
  execSync(cmd, {stdio: 'inherit'});
}

function getAllContainers(): FabricXContainerStatus[] {
  const out = runCapture('docker ps -a --format "{{.Names}}|{{.Image}}|{{.Status}}"');
  return out
    .split(/\r?\n/)
    .filter(Boolean)
    .map(line => {
      const [name, image, status] = line.split('|');
      return {name, image, status};
    });
}

export function checkDockerInstalled() {
  try {
    runCapture('docker --version');
  } catch (err: any) {
    throw new Error('Docker not found. Please install Docker and ensure it is on your PATH.');
  }

  try {
    runCapture('docker info');
  } catch (err: any) {
    throw new Error('Docker appears to be installed but the daemon is not running. Start Docker and try again.');
  }
}

export function up(composeFile = 'output/docker-compose.yaml') {
  checkDockerInstalled();
  if (!fs.existsSync(composeFile)) {
    throw new Error(`Compose file not found: ${composeFile}. Run 'fabx generate' first.`);
  }

  console.log('Starting Fabric-X containers...');

  try {
    try {
      runInherit(`docker compose -f ${composeFile} down --remove-orphans`);
    } catch {
      // non-fatal cleanup
    }

    runInherit(`docker compose -f ${composeFile} up --build -d`);

    const health = verifyFabricXNetwork();
    if (health.missing.length > 0 || health.exited.length > 0) {
      if (health.exited.length > 0) {
        console.error('One or more Fabric-X containers exited immediately. Showing recent logs:');
        printContainerLogs(health.exited.map(container => container.name));
      }

      const problems = [
        health.missing.length > 0 ? `missing: ${health.missing.join(', ')}` : '',
        health.exited.length > 0 ? `exited: ${health.exited.map(container => container.name).join(', ')}` : '',
      ].filter(Boolean);

      throw new Error(`Fabric-X did not fully start (${problems.join('; ')}).`);
    }
  } catch (err: any) {
    const msg = err?.message || String(err);
    throw new Error(`Failed to start containers. Docker output: ${msg}`);
  }
}

export function down(composeFile = 'output/docker-compose.yaml') {
  checkDockerInstalled();
  if (!fs.existsSync(composeFile)) {
    console.warn(`Compose file not found: ${composeFile}. Nothing to stop.`);
    return;
  }

  console.log('Stopping containers...');
  try {
    runInherit(`docker compose -f ${composeFile} down`);
  } catch (err: any) {
    const msg = err?.message || String(err);
    throw new Error(`Failed to stop containers. Docker output: ${msg}`);
  }
}

export function listFabricXContainers() {
  try {
    return getAllContainers().filter(
      item => EXPECTED_FABRICX_CONTAINERS.includes(item.name) && item.status.toLowerCase().includes('up'),
    );
  } catch (err: any) {
    throw new Error(`Failed to list containers: ${err?.message || String(err)}`);
  }
}

export function verifyFabricXNetwork(): FabricXNetworkStatus {
  checkDockerInstalled();

  try {
    const containers = getAllContainers().filter(item => EXPECTED_FABRICX_CONTAINERS.includes(item.name));
    const running = containers.filter(item => item.status.toLowerCase().includes('up'));
    const exited = containers.filter(item => !item.status.toLowerCase().includes('up'));
    const missing = EXPECTED_FABRICX_CONTAINERS.filter(
      name => !containers.some(container => container.name === name),
    );

    return {running, exited, missing};
  } catch (err: any) {
    throw new Error(`Failed to verify Fabric-X network: ${err?.message || String(err)}`);
  }
}

export function printContainerLogs(containerNames: string[], tail = 200) {
  for (const containerName of containerNames) {
    try {
      runInherit(`docker logs --tail ${tail} ${containerName}`);
    } catch {
      // best effort only
    }
  }
}

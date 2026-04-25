import fs from 'fs';
import os from 'os';
import path from 'path';
import {spawnSync} from 'child_process';

export const SUPPORTED_ANSIBLE_TARGETS = [
  'help',
  'install',
  'install-deps',
  'install-venv',
  'install-python-deps',
  'install-ansible-deps',
  'install-remote-node-deps',
  'lint',
  'check-license-header',
  'check-trailing-spaces',
  'login-cr',
  'setup',
  'artifacts',
  'generate-crypto',
  'genesis-block',
  'binaries',
  'clean',
  'clean-cache',
  'configs',
  'start',
  'stop',
  'teardown',
  'update',
  'restart',
  'hard-restart',
  'wipe',
  'hard-wipe',
  'targets',
  'run-command',
  'ping',
  'get-metrics',
  'fetch-crypto',
  'fetch-logs',
  'limit-rate',
] as const;

export const SUPPORTED_TARGET_GROUPS = [
  'fabric_cas',
  'fabric_x',
  'fabric_x_orderers',
  'fabric_x_committer',
  'load_generators',
  'monitoring',
] as const;

export type AnsibleTarget = typeof SUPPORTED_ANSIBLE_TARGETS[number];
export type AnsibleTargetGroup = typeof SUPPORTED_TARGET_GROUPS[number];

export type RunAnsibleTargetOptions = {
  ansibleConfig?: string;
  assertMetrics?: boolean;
  collectionPath?: string;
  containerRegistry?: string;
  containerRegistryPassword?: string;
  containerRegistryUsername?: string;
  dryRun?: boolean;
  extraMakeArgs?: string[];
  group?: string;
  limit?: number;
  remoteCommand?: string;
  target: AnsibleTarget;
  targetHosts?: string;
  useVenv?: boolean;
};

function defaultCollectionCandidate(collectionPath?: string): string {
  return (
    collectionPath ??
    process.env.FABX_ANSIBLE_COLLECTION_PATH ??
    path.resolve(process.cwd(), 'fabric-x-ansible-collection')
  );
}

function isCollectionRoot(candidatePath: string): boolean {
  return fs.existsSync(path.join(candidatePath, 'Makefile'));
}

export function resolveCollectionPath(collectionPath?: string, allowMissing = false): string {
  const candidates = [
    collectionPath,
    process.env.FABX_ANSIBLE_COLLECTION_PATH,
    path.resolve(process.cwd(), 'fabric-x-ansible-collection'),
    path.resolve(process.cwd(), '..', 'fabric-x-ansible-collection'),
    path.resolve(
      os.homedir(),
      '.ansible',
      'collections',
      'ansible_collections',
      'hyperledger',
      'fabricx',
    ),
  ].filter((value): value is string => Boolean(value));

  const resolved = candidates.find(candidate => isCollectionRoot(candidate));
  if (resolved) {
    return resolved;
  }

  if (allowMissing) {
    return defaultCollectionCandidate(collectionPath);
  }

  throw new Error(
    'Fabric-X Ansible collection not found. Set `FABX_ANSIBLE_COLLECTION_PATH`, pass `--collection-path`, or clone/install the collection first.',
  );
}

function buildEnv(options: RunAnsibleTargetOptions): NodeJS.ProcessEnv {
  const env: NodeJS.ProcessEnv = {...process.env};

  if (options.targetHosts) {
    env.TARGET_HOSTS = options.targetHosts;
  }

  if (typeof options.limit === 'number') {
    env.LIMIT = String(options.limit);
  }

  if (typeof options.assertMetrics === 'boolean') {
    env.ASSERT_METRICS = options.assertMetrics ? 'true' : 'false';
  }

  if (typeof options.useVenv === 'boolean') {
    env.USE_VENV = options.useVenv ? 'true' : 'false';
  }

  if (options.ansibleConfig) {
    env.ANSIBLE_CONFIG = options.ansibleConfig;
  }

  if (options.containerRegistry) {
    env.CONTAINER_REGISTRY = options.containerRegistry;
  }

  if (options.containerRegistryUsername) {
    env.CONTAINER_REGISTRY_USERNAME = options.containerRegistryUsername;
  }

  if (options.containerRegistryPassword) {
    env.CONTAINER_REGISTRY_PASSWORD = options.containerRegistryPassword;
  }

  if (options.remoteCommand) {
    env.COMMAND = options.remoteCommand;
    env.RUN_COMMAND = options.remoteCommand;
  }

  return env;
}

export function runAnsibleTarget(options: RunAnsibleTargetOptions) {
  const collectionPath = resolveCollectionPath(options.collectionPath, options.dryRun);
  const args = [
    ...(options.group ? [options.group] : []),
    options.target,
    ...(options.extraMakeArgs ?? []),
  ];
  const env = buildEnv(options);
  const printableCommand = ['make', ...args].join(' ');

  if (options.dryRun) {
    return {
      collectionPath,
      env,
      command: printableCommand,
      args,
    };
  }

  const result = spawnSync('make', args, {
    cwd: collectionPath,
    env,
    stdio: 'inherit',
    shell: process.platform === 'win32',
  });

  if (result.error) {
    throw new Error(
      `Failed to run ${printableCommand}. Ensure GNU Make is installed and the Fabric-X Ansible collection dependencies are available. ${result.error.message}`,
    );
  }

  if (typeof result.status === 'number' && result.status !== 0) {
    throw new Error(`Command failed with exit code ${result.status}: ${printableCommand}`);
  }

  return {
    collectionPath,
    env,
    command: printableCommand,
    args,
  };
}

import fs from 'fs/promises';
import path from 'path';

export interface FabloConfig {
  network: string;
  orgs: number;
  enableMonitoring: boolean;
}

const DEFAULTS: FabloConfig = {
  network: 'demo',
  orgs: 1,
  enableMonitoring: false,
};

export async function readConfig(configPath = 'fablo-config.json'): Promise<FabloConfig> {
  try {
    const p = path.resolve(configPath);
    const raw = await fs.readFile(p, 'utf8');
    const parsed = JSON.parse(raw);
    const cfg: FabloConfig = {
      network: parsed.network ?? DEFAULTS.network,
      orgs: typeof parsed.orgs === 'number' ? parsed.orgs : DEFAULTS.orgs,
      enableMonitoring: typeof parsed.enableMonitoring === 'boolean' ? parsed.enableMonitoring : DEFAULTS.enableMonitoring,
    };
    validate(cfg);
    return cfg;
  } catch (err: any) {
    if (err.code === 'ENOENT') {
      throw new Error(`Configuration file not found: ${configPath}`);
    }
    throw new Error(`Failed to read config: ${err.message}`);
  }
}

export function validate(cfg: FabloConfig) {
  if (!cfg.network || typeof cfg.network !== 'string') {
    throw new Error('Invalid config: "network" must be a non-empty string.');
  }
  if (!Number.isInteger(cfg.orgs) || cfg.orgs < 1) {
    throw new Error('Invalid config: "orgs" must be an integer >= 1.');
  }
}

import {Command} from '@oclif/core';
import {execSync} from 'child_process';
import fs from 'fs';
import * as gen from '../lib/generator';
import {readConfig} from '../lib/config';
import * as docker from '../lib/docker';
import {banner} from '../utils/banner';

export default class Up extends Command {
  static description = 'Start the Fabric-X network (docker compose up -d)';

  async run(): Promise<void> {
    try {
      this.log('');
      this.log(banner);
      this.log('Starting Fabric-X network...');
      this.log('');

      const cfg = await readConfig();
      await gen.generate(cfg);

      const required = [
        './config/issuer/keys/node.crt',
        './config/issuer/keys/node.key',
        './config/endorser/keys/node.crt',
        './config/endorser/keys/node.key',
        './config/owner/keys/node.crt',
        './config/owner/keys/node.key',
      ];
      const configFiles = [
        './config/issuer/core.yaml',
        './config/endorser/core.yaml',
        './config/owner/core.yaml',
        './config/namespace/zkatdlognoghv1_pp.json',
      ];

      const missing = required.filter(filePath => !fs.existsSync(filePath));
      if (missing.length > 0) {
        this.error(`Missing Fabric-X identity configuration. Missing: ${missing.join(', ')}`);
        return;
      }

      const cfgMissing = configFiles.filter(filePath => !fs.existsSync(filePath));
      if (cfgMissing.length > 0) {
        this.error(`Missing runtime config files required by Fabric-X. Missing: ${cfgMissing.join(', ')}`);
        return;
      }

      try {
        execSync('docker compose -f output/docker-compose.yaml down --remove-orphans', {stdio: 'inherit'});
      } catch {
        // non-fatal cleanup
      }

      docker.up();

      await new Promise(resolve => setTimeout(resolve, 1500));
      this.log('Checking container status...');

      const health = docker.verifyFabricXNetwork();
      if (health.running.length === 0 && health.missing.length > 0) {
        try {
          const ps = execSync('docker ps -a --format "{{.Names}} {{.Status}} {{.Image}}"').toString();
          this.log('No Fabric-X containers matched. `docker ps -a` output:\n' + ps);
        } catch (e: any) {
          this.log('Failed to run `docker ps -a`: ' + (e?.message || String(e)));
        }

        this.error('No Fabric-X containers are running. Run `fabx check` or inspect `docker ps -a` for details.');
        return;
      }

      if (health.missing.length > 0 || health.exited.length > 0) {
        if (health.exited.length > 0) {
          this.log('Some Fabric-X containers exited. Showing recent logs:');
          docker.printContainerLogs(health.exited.map(container => container.name));
        }

        if (health.missing.length > 0) {
          this.log(`Missing containers: ${health.missing.join(', ')}`);
        }

        this.error('Fabric-X network did not fully start. Run `fabx check` for a full health summary.');
        return;
      }

      this.log('Fabric-X network is running successfully');
      health.running.forEach(container => {
        this.log(`${container.name} (${container.image}) - ${container.status}`);
      });
    } catch (err: any) {
      this.error(err.message);
    }
  }
}

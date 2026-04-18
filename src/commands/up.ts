import {Command} from '@oclif/core';
import {readConfig} from '../lib/config';
import * as gen from '../lib/generator';
import * as docker from '../lib/docker';
import {banner} from '../utils/banner';
import {execSync} from 'child_process';
import fs from 'fs';

export default class Up extends Command {
  static description = 'Start the Fabric-X network (docker compose up -d)';

  async run(): Promise<void> {
    try {
      // Print ASCII banner and starting message
      this.log('');
      this.log(banner);
      this.log('🚀 Starting Fabric-X network...');
      this.log('');
      const cfg = await readConfig();
      // ensure compose exists
      await gen.generate(cfg);

      // verify config presence for required services
      const required = [
        './config/issuer/keys/node.crt',
        './config/issuer/keys/node.key',
        './config/endorser/keys/node.crt',
        './config/endorser/keys/node.key',
        './config/owner/keys/node.crt',
        './config/owner/keys/node.key',
      ];
      const missing = required.filter(p => !fs.existsSync(p));
      if (missing.length > 0) {
        this.error('Fabric-X identity not found. Please configure keys in ./config. Missing: ' + missing.join(', '));
        return;
      }

      docker.up();
      console.log('Checking container status...');
      const list = docker.listFabricXContainers();
      if (list.length === 0) {
        // print helpful diagnostic info
        try {
          const ps = execSync('docker ps -a --format "{{.Names}} {{.Status}} {{.Image}}"').toString();
          this.log('No Fabric-X containers matched. `docker ps -a` output:\n' + ps);
        } catch (e: any) {
          this.log('Failed to run `docker ps -a`: ' + (e?.message || String(e)));
        }
        this.error('No Fabric-X containers are running. Run `docker ps` and `docker logs <container>` for details.');
      } else {
        // if any container exited, show logs
        const exited = list.filter(i => (i.status || '').toLowerCase().includes('exited'));
        if (exited.length > 0) {
          this.log('Some Fabric-X containers exited. Showing recent logs:');
          exited.forEach(e => {
            try {
              const logs = execSync(`docker logs --tail 200 ${e.name}`).toString();
              this.log(`== logs for ${e.name} ==\n${logs}`);
            } catch (le: any) {
              this.log(`Failed to fetch logs for ${e.name}: ${le?.message || String(le)}`);
            }
          });
          this.error('One or more Fabric-X containers have exited. See logs above.');
        }

        console.log('Fabric-X network is running successfully');
        list.forEach(l => console.log(`${l.name} (${l.image}) - ${l.status}`));
      }
    } catch (err: any) {
      this.error(err.message);
    }
  }
}

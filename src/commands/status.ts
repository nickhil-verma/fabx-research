import {Command} from '@oclif/core';
import * as docker from '../lib/docker';

export default class Status extends Command {
  static description = 'Show running Fabric-X containers';

  async run(): Promise<void> {
    try {
      this.log('Checking container status...');
      const health = docker.verifyFabricXNetwork();
      const list = [...health.running, ...health.exited];

      if (list.length === 0) {
        this.log('No Fabric-X containers are running.');
      } else {
        list.forEach(container => {
          this.log(`${container.name} (${container.image}) - ${container.status}`);
        });
      }

      if (health.missing.length > 0) {
        this.log(`Missing containers: ${health.missing.join(', ')}`);
      }
    } catch (err: any) {
      this.error(err.message);
    }
  }
}

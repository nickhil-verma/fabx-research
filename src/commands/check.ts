import {Command} from '@oclif/core';
import * as docker from '../lib/docker';

export default class Check extends Command {
  static description = 'Check whether the full Fabric-X network is running';

  async run(): Promise<void> {
    try {
      this.log('Checking Fabric-X network health...');
      const health = docker.verifyFabricXNetwork();

      if (health.running.length > 0) {
        health.running.forEach(container => {
          this.log(`${container.name} (${container.image}) - ${container.status}`);
        });
      }

      if (health.missing.length > 0) {
        this.log(`Missing containers: ${health.missing.join(', ')}`);
      }

      if (health.exited.length > 0) {
        this.log('Exited or unhealthy containers:');
        health.exited.forEach(container => {
          this.log(`${container.name} (${container.image}) - ${container.status}`);
        });
      }

      if (health.missing.length > 0 || health.exited.length > 0) {
        this.error('Fabric-X network is not fully running.');
        return;
      }

      this.log('Fabric-X network is fully running.');
    } catch (err: any) {
      this.error(err.message);
    }
  }
}

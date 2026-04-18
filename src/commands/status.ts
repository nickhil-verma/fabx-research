import {Command} from '@oclif/core';
import * as docker from '../lib/docker';

export default class Status extends Command {
  static description = 'Show running Fabric-X containers';

  async run(): Promise<void> {
    try {
      console.log('Checking container status...');
      const list = docker.listFabricXContainers();
      if (list.length === 0) {
        this.log('No Fabric-X containers are running.');
      } else {
        list.forEach(l => this.log(`${l.name} (${l.image}) - ${l.status}`));
      }
    } catch (err: any) {
      this.error(err.message);
    }
  }
}

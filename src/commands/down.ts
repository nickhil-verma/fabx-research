import {Command} from '@oclif/core';
import * as docker from '../lib/docker';

export default class Down extends Command {
  static description = 'Stop the Fabric-X network (docker compose down)';

  async run(): Promise<void> {
    try {
      docker.down();
      this.log('Network stopped.');
    } catch (err: any) {
      this.error(err.message);
    }
  }
}

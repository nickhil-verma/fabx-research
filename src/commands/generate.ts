import {Command} from '@oclif/core';
import {readConfig} from '../lib/config';
import {generate} from '../lib/generator';

export default class Generate extends Command {
  static description = 'Generate docker-compose.yaml from fablo-config.json';

  async run(): Promise<void> {
    try {
      const cfg = await readConfig();
      await generate(cfg);
      this.log('Generation complete.');
    } catch (err: any) {
      this.error(err.message);
    }
  }
}

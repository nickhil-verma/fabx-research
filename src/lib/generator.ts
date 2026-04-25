import ejs from 'ejs';
import path from 'path';
import fs from 'fs/promises';
import {FabloConfig} from './config';

export async function generate(config: FabloConfig, outDir = 'output') {
  const tplPath = path.resolve(__dirname, '..', '..', 'templates', 'docker-compose.ejs');
  const prometheusTpl = path.resolve(__dirname, '..', '..', 'templates', 'prometheus.yml');

  console.log('Generating configuration...');
  await fs.mkdir(outDir, {recursive: true});

  const rendered = await ejs.renderFile(tplPath, {config}, {async: true});
  await fs.writeFile(path.join(outDir, 'docker-compose.yaml'), rendered, 'utf8');

  if (config.enableMonitoring) {
    const prom = await fs.readFile(prometheusTpl, 'utf8');
    await fs.writeFile(path.join(outDir, 'prometheus.yml'), prom, 'utf8');
  }

  console.log(`Wrote ${outDir}/docker-compose.yaml`);
}

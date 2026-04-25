import ejs from 'ejs';
import path from 'path';
import fs from 'fs/promises';
import {FabloConfig} from './config';

export async function generate(config: FabloConfig, outDir = 'output') {
  const tplPath = path.resolve(__dirname, '..', '..', 'templates', 'docker-compose.ejs');
  const prometheusTpl = path.resolve(__dirname, '..', '..', 'templates', 'prometheus.yml.ejs');
  const blackboxTpl = path.resolve(__dirname, '..', '..', 'templates', 'blackbox.yml');
  const grafanaDatasourceTpl = path.resolve(
    __dirname,
    '..',
    '..',
    'templates',
    'grafana-datasource.yml',
  );
  const grafanaDashboardProviderTpl = path.resolve(
    __dirname,
    '..',
    '..',
    'templates',
    'grafana-dashboard-provider.yml',
  );
  const grafanaDashboardTpl = path.resolve(
    __dirname,
    '..',
    '..',
    'templates',
    'grafana-dashboard.json',
  );

  console.log('Generating configuration...');
  await fs.mkdir(outDir, {recursive: true});

  const rendered = await ejs.renderFile(tplPath, {config}, {async: true});
  await fs.writeFile(path.join(outDir, 'docker-compose.yaml'), rendered, 'utf8');

  if (config.enableMonitoring) {
    const prom = await ejs.renderFile(prometheusTpl, {config}, {async: true});
    const blackbox = await fs.readFile(blackboxTpl, 'utf8');
    const grafanaDatasource = await fs.readFile(grafanaDatasourceTpl, 'utf8');
    const grafanaDashboardProvider = await fs.readFile(grafanaDashboardProviderTpl, 'utf8');
    const grafanaDashboard = await fs.readFile(grafanaDashboardTpl, 'utf8');

    await fs.writeFile(path.join(outDir, 'prometheus.yml'), prom, 'utf8');
    await fs.writeFile(path.join(outDir, 'blackbox.yml'), blackbox, 'utf8');
    await fs.mkdir(path.join(outDir, 'grafana', 'provisioning', 'datasources'), {recursive: true});
    await fs.mkdir(path.join(outDir, 'grafana', 'provisioning', 'dashboards'), {recursive: true});
    await fs.mkdir(path.join(outDir, 'grafana', 'dashboards'), {recursive: true});
    await fs.writeFile(
      path.join(outDir, 'grafana', 'provisioning', 'datasources', 'datasource.yml'),
      grafanaDatasource,
      'utf8',
    );
    await fs.writeFile(
      path.join(outDir, 'grafana', 'provisioning', 'dashboards', 'dashboard-provider.yml'),
      grafanaDashboardProvider,
      'utf8',
    );
    await fs.writeFile(path.join(outDir, 'grafana', 'dashboards', 'fabx-overview.json'), grafanaDashboard, 'utf8');
  }

  console.log(`Wrote ${outDir}/docker-compose.yaml`);
}

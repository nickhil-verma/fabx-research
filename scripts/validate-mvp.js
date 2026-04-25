const {execSync} = require('child_process');
const path = require('path');

const repoRoot = path.resolve(__dirname, '..');

function run(command) {
  console.log(`\n> ${command}`);
  execSync(command, {
    cwd: repoRoot,
    stdio: 'inherit',
  });
}

function main() {
  let started = false;

  try {
    run('node ./bin/run.js generate');
    run('node ./bin/run.js up');
    started = true;
    run('node ./bin/run.js check');
    run('node ./bin/run.js status');
    console.log('\nMVP validation passed: local Fabric-X network generated, started, and verified.');
  } catch (error) {
    console.error('\nMVP validation failed.');
    process.exitCode = 1;
  } finally {
    if (started) {
      try {
        run('node ./bin/run.js down');
      } catch {
        console.error('\nCleanup warning: failed to stop the network automatically.');
      }
    }
  }
}

main();

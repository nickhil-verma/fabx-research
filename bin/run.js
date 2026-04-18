#!/usr/bin/env node
// oclif run shim
try {
  const {run} = require('@oclif/core');
  run().catch(require('@oclif/core/handle'));
} catch (err) {
  // fallback: try to require compiled index
  try {
    require('../lib/index.js');
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error('Failed to start fabx CLI:', (e && e.message) || err);
    process.exit(1);
  }
}

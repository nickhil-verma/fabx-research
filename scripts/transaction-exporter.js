'use strict';

const http = require('http');

const PORT = Number(process.env.PORT || 2112);
const OWNER_API_BASE = process.env.OWNER_API_BASE || 'http://owner:9000';
const POLL_INTERVAL_MS = Number(process.env.POLL_INTERVAL_MS || 5000);
const ACCOUNT_ID = process.env.ACCOUNT_ID || 'alice';

const state = {
  balance: 0,
  balanceSuccess: 0,
  exporterUp: 1,
  lastPollTimestamp: 0,
  observedTransactionRecords: 0,
  pollFailures: 0,
  pollSuccess: 0,
  transactionRecords: 0,
};

async function fetchJson(pathname) {
  const response = await fetch(`${OWNER_API_BASE}${pathname}`);
  if (!response.ok) {
    throw new Error(`HTTP ${response.status} for ${pathname}`);
  }

  return response.json();
}

function numericValue(value) {
  if (typeof value === 'number') {
    return value;
  }

  if (typeof value === 'string') {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
  }

  return 0;
}

function extractBalance(payload) {
  if (!payload || typeof payload !== 'object') {
    return 0;
  }

  if (Array.isArray(payload)) {
    return payload.reduce((sum, item) => sum + extractBalance(item), 0);
  }

  if ('value' in payload) {
    return numericValue(payload.value);
  }

  if ('balance' in payload) {
    return numericValue(payload.balance);
  }

  if ('balances' in payload && Array.isArray(payload.balances)) {
    return payload.balances.reduce((sum, item) => sum + extractBalance(item), 0);
  }

  return 0;
}

async function pollOwnerApi() {
  try {
    const transactionsResponse = await fetchJson(`/owner/accounts/${ACCOUNT_ID}/transactions`);
    const balanceResponse = await fetchJson(`/owner/accounts/${ACCOUNT_ID}`);

    const transactions = Array.isArray(transactionsResponse.payload)
      ? transactionsResponse.payload
      : [];
    const currentCount = transactions.length;

    if (currentCount > state.transactionRecords) {
      state.observedTransactionRecords += currentCount - state.transactionRecords;
    }

    state.transactionRecords = currentCount;
    state.balance = extractBalance(balanceResponse.payload);
    state.balanceSuccess = 1;
    state.pollSuccess = 1;
    state.lastPollTimestamp = Math.floor(Date.now() / 1000);
  } catch (error) {
    state.balanceSuccess = 0;
    state.pollSuccess = 0;
    state.pollFailures += 1;
  }
}

function metricsBody() {
  return [
    '# HELP fabx_transaction_exporter_up Whether the custom Fabx transaction exporter is running.',
    '# TYPE fabx_transaction_exporter_up gauge',
    `fabx_transaction_exporter_up ${state.exporterUp}`,
    '# HELP fabx_transaction_poll_success Whether the latest owner API poll succeeded.',
    '# TYPE fabx_transaction_poll_success gauge',
    `fabx_transaction_poll_success ${state.pollSuccess}`,
    '# HELP fabx_transaction_poll_failures_total Total failed owner API polls.',
    '# TYPE fabx_transaction_poll_failures_total counter',
    `fabx_transaction_poll_failures_total ${state.pollFailures}`,
    '# HELP fabx_owner_account_balance Current observed owner balance for the tracked account.',
    '# TYPE fabx_owner_account_balance gauge',
    `fabx_owner_account_balance{account="${ACCOUNT_ID}"} ${state.balance}`,
    '# HELP fabx_owner_balance_poll_success Whether the latest account balance fetch succeeded.',
    '# TYPE fabx_owner_balance_poll_success gauge',
    `fabx_owner_balance_poll_success{account="${ACCOUNT_ID}"} ${state.balanceSuccess}`,
    '# HELP fabx_owner_transaction_records Current number of transaction records returned by the owner API.',
    '# TYPE fabx_owner_transaction_records gauge',
    `fabx_owner_transaction_records{account="${ACCOUNT_ID}"} ${state.transactionRecords}`,
    '# HELP fabx_owner_observed_transaction_records_total Total new transaction records observed across exporter polls.',
    '# TYPE fabx_owner_observed_transaction_records_total counter',
    `fabx_owner_observed_transaction_records_total{account="${ACCOUNT_ID}"} ${state.observedTransactionRecords}`,
    '# HELP fabx_transaction_last_poll_timestamp_seconds Unix timestamp of the last successful poll.',
    '# TYPE fabx_transaction_last_poll_timestamp_seconds gauge',
    `fabx_transaction_last_poll_timestamp_seconds ${state.lastPollTimestamp}`,
    '',
  ].join('\n');
}

const server = http.createServer((req, res) => {
  if (req.url === '/metrics') {
    res.writeHead(200, {'Content-Type': 'text/plain; version=0.0.4; charset=utf-8'});
    res.end(metricsBody());
    return;
  }

  if (req.url === '/healthz') {
    res.writeHead(200, {'Content-Type': 'application/json'});
    res.end(JSON.stringify({status: 'ok'}));
    return;
  }

  res.writeHead(404, {'Content-Type': 'text/plain'});
  res.end('not found');
});

server.listen(PORT, () => {
  pollOwnerApi();
  setInterval(pollOwnerApi, POLL_INTERVAL_MS);
});

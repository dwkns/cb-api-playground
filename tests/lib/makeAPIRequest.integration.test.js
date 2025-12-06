import { describe, expect, test } from 'vitest';
import { granularitySeconds } from '../../app/lib/granularitySeconds.js';
import dotenv from 'dotenv';
dotenv.config();

const hasEnv = Boolean(process.env.COINBASE_API_KEY_NAME && process.env.COINBASE_API_PRIVATE_KEY);
const integration = test.runIf(hasEnv);

function getCandleWindow({
  granularity = 'FIFTEEN_MINUTE',
  results = 5,
  end = Math.round(Date.now() / 1000),
} = {}) {
  const seconds = granularitySeconds[granularity];
  const start = end - seconds * results;
  return { start, end };
}

describe('makeRequest (integration)', () => {
  integration('fetches brokerage transaction summary', async () => {
    const { makeRequest } = await import('../../app/lib/makeAPIRequest.js');

    const response = await makeRequest({
      requestPath: '/api/v3/brokerage/transaction_summary',
      requestMethod: 'GET',
      url: 'api.coinbase.com',
      algorithm: 'ES256',
    });

    expect(response).toBeDefined();
    expect(typeof response).toBe('object');
  }, 30_000);

  integration('fetches recent BTC-GBP candles with query params', async () => {
    const { makeRequest } = await import('../../app/lib/makeAPIRequest.js');
    const { start, end } = getCandleWindow({ granularity: 'FIFTEEN_MINUTE', results: 10 });

    const response = await makeRequest({
      requestPath: '/api/v3/brokerage/products/BTC-GBP/candles',
      requestParams: new URLSearchParams({
        granularity: 'FIFTEEN_MINUTE',
        start,
        end,
      }).toString(),
      requestMethod: 'GET',
      url: 'api.coinbase.com',
      algorithm: 'ES256',
    });

    expect(response).toBeDefined();
    expect(response?.candles ?? response?.candles_results ?? response?.candles_results?.candles).toBeTruthy();
  }, 30_000);
});

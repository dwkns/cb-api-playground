
import { Temporal } from '@js-temporal/polyfill'; // Help with dates
import { makeRequest } from './lib/makeAPIRequest.js'; 
import { granularitySeconds } from './lib/granularitySeconds.js';

// --------- feesRequest --------- 
const feesRequest = {
  requestPath: '/api/v3/brokerage/transaction_summary',
  requestMethod: 'GET',
  url: 'api.coinbase.com',
  algorithm: 'ES256',
};


console.log( await makeRequest(feesRequest))




/**
 * Returns start/end epoch seconds for a window of `results` candles ending at `endInstant`.
 * Defaults: granularity='FIFTEEN_MINUTE', results=350, endInstant=Temporal.Now.instant().
 * Examples:
 *   const { start, end } = getCandleWindow(); // 350 x 15m ending now
 *   const oneHour = getCandleWindow({ granularity: 'ONE_MINUTE', results: 60 });
 *   const customEnd = getCandleWindow({ granularity: 'ONE_HOUR', results: 24, endInstant: Temporal.Instant.from('2025-01-01T00:00Z') });
 */
function getCandleWindow({ granularity = 'FIFTEEN_MINUTE', results = 350, endInstant = Temporal.Now.instant() } = {}) {
  const secondsPerCandle = granularitySeconds[granularity];
  if (!secondsPerCandle) {
    throw new Error(`Unsupported granularity: ${granularity}`);
  }
  const count = Math.max(0, results);
  const startInstant = endInstant.subtract({ seconds: secondsPerCandle * count });
  return {
    start: Math.round(startInstant.epochMilliseconds / 1000),
    end: Math.round(endInstant.epochMilliseconds / 1000),
  };
}




/* 
--------- candlesRequest --------- 
Example that includes a query string. 
Don't use the query string as part of the JWT creation. 
Only use the url + path
*/
const { start, end } = getCandleWindow({ granularity: 'FIFTEEN_MINUTE', results: 350 });

const candlesRequest = {
  requestPath: "/api/v3/brokerage/products/BTC-GBP/candles",
  requestParams: new URLSearchParams({
    granularity: 'FIFTEEN_MINUTE',
    start,
    end,
  }).toString(),
  requestMethod: 'GET',
  url: 'api.coinbase.com',
  algorithm: 'ES256'
};
console.log( await makeRequest(candlesRequest) )

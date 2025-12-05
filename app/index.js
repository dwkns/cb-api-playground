import jsonwebtoken from 'jsonwebtoken'; 
const { sign } = jsonwebtoken; // jsonwebtoken is a CommonJS module without the named export
import crypto from 'crypto';
import { Temporal } from '@js-temporal/polyfill'; // Help with dates
import dotenv from 'dotenv';
import findConfig from 'find-config';

dotenv.config({ path: findConfig('.env') });

// Access API Key and Secret from .env
const key_name = process.env.COINBASE_API_KEY_NAME;
const key_secret = process.env.COINBASE_API_PRIVATE_KEY;

function createJWT(requestDetails) {
  const {url, requestPath, requestParams , requestMethod} = requestDetails
  const uri = requestMethod + ' ' + url + requestPath

  // Create the JWT token
  try {
    const token = sign(
    {
      iss: 'cdp',
      nbf: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 120,
      sub: key_name,
      uri,
    },
    key_secret,
    {
      algorithm: requestDetails.algorithm,
      header: {
        kid: key_name,
        nonce: crypto.randomBytes(16).toString('hex'),
      },
    }
  );

  console.log(`✅ JWT Creation Success for ${uri}`);
  return token;
  } catch (error) {
      console.error(`❌ JWT Creation Error: for ${uri}`);
      console.log("Error: ", error)
  }
}

async function makeRequest(requestDetails) {
  const jwtToken = createJWT(requestDetails);
 
  const {url, requestPath, requestParams} = requestDetails
  const params = requestParams ? `?${requestParams}` : '';
  
  const uri = `https://${url}${requestPath}${params}` // construct full URI
  
  // Add the token to the header
  const options = {
    method: 'GET',
    headers: { Authorization: `Bearer ${jwtToken}` },
    body: undefined,
  };

  // Do tha API call 
  try {
    const response = await fetch(uri, options);
    const contentType = response.headers.get('content-type');

    let data;
    if (contentType && contentType.includes('application/json')) {
      data = await response.json(); // we have a data response
    } else {
      data = await response.text();
    }

    if (!response.ok) {
      console.error(`❌ API Error: ${response.status} ${response.statusText} for ${uri}`);
      console.error('Response:', JSON.stringify(data, null, 2));
    } else {
      console.log(`✅ API Success: ${response.status} ${response.statusText} for ${uri}`);
      return data
    }
  } catch (error) {
    console.error('Request error:', error);
  }
}

// --------- feesRequest --------- 
const feesRequest = {
  requestPath: '/api/v3/brokerage/transaction_summary',
  requestMethod: 'GET',
  url: 'api.coinbase.com',
  algorithm: 'ES256',
};


console.log( await makeRequest(feesRequest))

/* 
--------- candlesRequest --------- 
Example that includes a query string. 
Don't use the query string as part of the JWT creation. 
Only use the url + path
*/
const start = Temporal.Now.instant().subtract({ hours: 20 }).epochMilliseconds // 1 hour ago
const end = Temporal.Now.instant().epochMilliseconds // now

const candlesRequest = {
  requestPath: "/api/v3/brokerage/products/BTC-GBP/candles",
  requestParams: new URLSearchParams({
    granularity: 'FIFTEEN_MINUTE',
    start: Math.round(start / 1000), // for seconds
    end: Math.round(end / 1000)
  }).toString(),
  requestMethod: 'GET',
  url: 'api.coinbase.com',
  algorithm: 'ES256'
};
console.log( await makeRequest(feesRequest))

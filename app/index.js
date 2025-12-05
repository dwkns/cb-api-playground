const { sign } = require('jsonwebtoken');
const crypto = require('crypto');
const { Temporal } = require('@js-temporal/polyfill'); // Help with dates
require('dotenv').config({ path: require('find-config')('.env') });

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
  // console.log(`\ntoken: \n`, token) // If you want to see it. 
  return token;
  } catch (error) {
      console.error(`❌ JWT Creation Error: for ${uri}`);
      console.log("Error: ", error)
  }
}

async function makeRequest(requestDetails, jwtToken, hideOutput = true) {
  const {url, requestPath, requestParams} = requestDetails
  let params = `?${requestDetails.requestParams}` || '';
  
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
      hideOutput ? null : console.log(data) // if you want to see
      return data
    }
  } catch (error) {
    console.error('Request error:', error);
  }
}

const feesRequest = {
  requestPath: '/api/v3/brokerage/transaction_summary',
  requestMethod: 'GET',
  url: 'api.coinbase.com',
  algorithm: 'ES256',
};

const feesJwtToken = createJWT(feesRequest);
makeRequest(feesRequest, feesJwtToken);

let start = Temporal.Now.instant().subtract({ hours: 20 }).epochMilliseconds // 1 hour ago
let end = Temporal.Now.instant().epochMilliseconds // now

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
const candlesJwtToken = createJWT(candlesRequest);
makeRequest(candlesRequest, candlesJwtToken, true );



import jsonwebtoken from 'jsonwebtoken'; // Creates JWT tokens
const { sign } = jsonwebtoken; // jsonwebtoken is a CommonJS module without the named export

import crypto from 'crypto'; // For generating nonce
import dotenv from 'dotenv'; // Load environment variables


dotenv.config(); // Load .env variables 

// Access API Key and Secret from Env variables
const key_name = process.env.COINBASE_API_KEY_NAME;
const key_secret = process.env.COINBASE_API_PRIVATE_KEY;

// Ensure keys are set
if (!key_name || !key_secret) {
  throw new Error("COINBASE_API_KEY_NAME and COINBASE_API_PRIVATE_KEY must be set in the .env file");
}

// Create JWT token for API request
export function createJWT(requestDetails) {
  const { url, requestPath, requestMethod } = requestDetails
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
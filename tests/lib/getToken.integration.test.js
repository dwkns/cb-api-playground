import { describe, expect, test } from 'vitest';
import dotenv from 'dotenv';
dotenv.config();

const hasEnv = Boolean(process.env.COINBASE_API_KEY_NAME && process.env.COINBASE_API_PRIVATE_KEY);
const integration = test.runIf(hasEnv);

describe('createJWT (integration)', () => {
  integration('creates a JWT using real environment keys', async () => {
    const { default: jsonwebtoken } = await import('jsonwebtoken');
    const { createJWT } = await import('../../app/lib/getToken.js');

    const requestDetails = {
      url: 'api.coinbase.com',
      requestPath: '/api/v3/brokerage/transaction_summary',
      requestMethod: 'GET',
      algorithm: 'ES256',
    };

    const token = createJWT(requestDetails);
    expect(typeof token).toBe('string');

    const decoded = jsonwebtoken.decode(token, { complete: true });
    expect(decoded?.payload).toMatchObject({
      sub: process.env.COINBASE_API_KEY_NAME,
      uri: 'GET api.coinbase.com/api/v3/brokerage/transaction_summary',
    });
    expect(decoded?.header).toMatchObject({
      kid: process.env.COINBASE_API_KEY_NAME,
      alg: 'ES256',
    });
  });
});

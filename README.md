## Coinbase API Playground

A minimal Node.js ESM project that signs JWTs for Coinbase’s Advanced Trade API and fetches a couple of example endpoints:

- `app/lib/getToken.js` builds the ES256 JWT using your API key name and private key.
- `app/lib/makeAPIRequest.js` sends authorized requests (transaction summary and BTC-GBP candles examples).
- `app/lib/granularitySeconds.js` maps candle granularities to their durations.
- Integration tests in `tests/lib` hit the real API when credentials are present.

### Prerequisites
- Node.js 18+ (fetch is used directly).
- A Coinbase API key (name and private key) with Advanced Trade API access.

### Setup
1. Install dependencies:
   ```bash
   npm install
   ```
2. Copy the example environment and fill in your credentials:
   ```bash
   cp .env.example .env
   # edit .env with your API key name + private key (ES256)
   ```
   The project auto-loads `.env` via `find-config`/`dotenv`.

### Running the examples
Run the sample script to call the transaction summary endpoint and BTC-GBP candles:
```bash
npm start
```

### Tests
Vitest integration tests call the live API (requires the `.env` above):
```bash
npm test
```

### Project structure
- `app/index.js` — example entry point wiring requests.
- `app/lib/getToken.js` — JWT creation.
- `app/lib/makeAPIRequest.js` — fetch wrapper with logging.
- `app/lib/granularitySeconds.js` — supported candle granularities.
- `tests/lib/*.integration.test.js` — live API tests.

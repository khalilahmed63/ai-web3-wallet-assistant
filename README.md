## AI + Web3 Wallet Assistant

Production-ready starter built with:

- Next.js (App Router)
- TypeScript
- Tailwind CSS
- Moralis API for wallet data
- Etherscan fallback for wallet data resilience
- Hugging Face Inference API (free tier) for human-readable wallet insights

## Project Structure

```text
app/
  api/analyze-wallet/route.ts
  page.tsx
components/
  ui/
  features/
lib/
  web3/
  ai/
  utils/
types/
```

## Setup

1. Install dependencies:

```bash
npm install
```

2. Configure environment variables:

```bash
cp .env.example .env.local
```

3. Start development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## API Flow

`POST /api/analyze-wallet`

1. Accept wallet address
2. Fetch balances and transactions from Moralis
   - Fallback to Etherscan if Moralis network is unreachable
3. Analyze behavior with rule-based logic
4. Generate plain-language insights using Hugging Face
5. Return combined response to UI

### API Validation and Performance

- Request body is validated with `zod`
- Wallet address is validated as a proper EVM address (`viem`)
- Responses are cached in-memory for 2 minutes per address to speed up repeated requests
- Cache metrics endpoint: `GET /api/cache-metrics` (returns hits, misses, active entries, TTL)

## Environment Variables

- `MORALIS_API_KEY`
- `HUGGINGFACE_API_KEY` (optional, recommended for better free-tier limits)
- `ETHERSCAN_API_KEY` (optional, used for fallback and better limits)

## Scripts

- `npm run dev` - local development
- `npm run build` - production build
- `npm run start` - start production server
- `npm run lint` - lint project

# ai-web3-wallet-assistant

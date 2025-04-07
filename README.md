# Transaction Simulation

A NestJS-based application for simulating blockchain transactions and testing token approvals across multiple EVM-compatible chains.

## Features

- Simulates transactions on multiple EVM chains
- Manages Anvil instances for local blockchain simulation
- Overrides token approvals and balances
- Generates token combinations for testing
- Reports results to Google Sheets
- Handles rate limiting and retries
- Supports multiple RPC providers

## Prerequisites

- Node.js v16+
- npm
- Docker (optional, for containerization)
- Google Sheets API credentials

## Installation

1. Clone the repository:
```bash
git clone https://github.com/router-protocol/TRANSACTION_SIMULATION.git
cd transaction_simulation
```

2. Install dependencies:
```bash
npm install
```

3. Configure environment variables:
```bash
cp .env.example .env
# Edit .env with your settings
```

4. Set up configuration files:
- `src/config/rpcs.ts`: RPC endpoints
- `src/config/tokens.ts`: Token addresses
- `src/config/customCombinations.json`: Test combinations

## Usage

### Running Tests
```bash
npm run start:dev
# or with ts-node
npx ts-node scripts/run-task.ts
```

### API Endpoints

- `GET /`: Run transaction simulations
- `GET /override-slots`: Test token approvals
- `GET /generateCombinations`: Generate test combinations

## Configuration

### RPC Configuration
```typescript
// src/config/rpcs.ts
export default {
  '137': ['https://polygon-rpc.com'],
  '42161': ['https://arb1.arbitrum.io/rpc']
}
```

### Token Configuration
```typescript
// src/config/tokens.ts
export const tokens = [
  {
    chainId: '137',
    address: '0x...'
  }
]
```

## Token Whitelisting

The application implements a two-layer whitelisting system:

### Chain Whitelisting
- Configured in `src/utils/filterChains.ts`
- Controls which source chains can interact with which destination chains
- Environment variable `SUPPORTED_CHAINS` defines allowed source chains

### Token Whitelisting
- Defined in `src/config/tokens.ts`
- Specifies which tokens are supported on each chain
- Format:
```typescript
export const tokens = [
  {
    chainId: '137',
    address: '0x...'  // Token contract address
  }
]
```

### Validation Flow
1. Checks if source chain is in `SUPPORTED_CHAINS`
2. Validates if destination chain is allowed for the source chain
3. Verifies token addresses are whitelisted for both chains

## Error Handling

The application includes comprehensive error handling for:
- RPC timeouts and rate limits
- Invalid token addresses
- Failed transactions
- Network issues

## Reporting

Results are saved in two formats:
1. JSON logs in `reports/` directory (includes detailed transaction simulations and errors)
2. Google Sheets (when configured)

## Docker Support

Build and run with Docker:
```bash
docker-compose build
docker-compose up
```

## Project Structure

```
.
├── Dockerfile
├── README.md
├── docker-compose.yml
├── eslint.config.mjs
├── inputs
│   └── standardTokens.json
├── nest-cli.json
├── package.json
├── scripts
│   └── run-task.ts
├── src
│   ├── anvil-manager
│   │   └── anvil-manager.service.ts
│   ├── app.controller.ts
│   ├── app.module.ts
│   ├── app.service.ts
│   ├── config
│   │   ├── amounts.json
│   │   ├── chainType.ts
│   │   ├── constants
│   │   │   ├── allowanceSlotNumber.constant.ts
│   │   │   └── balanceSlotNumber.constant.ts
│   │   ├── credentials
│   │   │   └── google-credentials.ts
│   │   ├── customCombinations.json
│   │   ├── reservedTokens.json
│   │   ├── rpcs.ts
│   │   └── tokens.ts
│   ├── main.ts
│   └── utils
│       ├── allowance.ts
│       ├── balance.ts
│       ├── combinations.ts
│       ├── fileOps.ts
│       ├── filterChains.ts
│       ├── googleReport
│       │   ├── googleReport.ts
│       │   └── reportMapper.ts
│       ├── overrides.ts
│       ├── path.ts
│       └── txnData.ts
├── test
│   ├── app.e2e-spec.ts
│   └── jest-e2e.json
├── tsconfig.build.json
└── tsconfig.json
```

## Troubleshooting

Common issues:
1. RPC Rate Limits: Use alternative RPC providers or implement delays
2. Module Not Found: Ensure all dependencies are installed
3. Google Sheets API: Verify credentials and permissions
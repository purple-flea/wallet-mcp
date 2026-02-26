# @purpleflea/wallet-mcp

[![npm version](https://img.shields.io/npm/v/@purpleflea/wallet-mcp.svg)](https://www.npmjs.com/package/@purpleflea/wallet-mcp)
[![MCP](https://img.shields.io/badge/MCP-compatible-blue.svg)](https://modelcontextprotocol.io)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

MCP server for **Purple Flea Wallet** — non-custodial multi-chain wallets with cross-chain swaps for AI agents.

## What it does

Gives any MCP-compatible AI agent a full crypto wallet:

- **Non-custodial multi-chain wallets** — wallets across 10+ chains (Ethereum, Bitcoin, Solana, Monero, Base, Arbitrum, BSC, Tron, Zcash, Dogecoin, HyperEVM) from a single registration
- **Cross-chain swaps** — Powered by [Wagyu](https://wagyu.xyz), an aggregator of aggregators that routes across every DEX and bridge to find the best rate. Liquidity routed through Hyperliquid
- **Privacy routing** — Swap any token through Monero (XMR) to break the on-chain link between source and destination. Ring signatures + stealth addresses = no traceable path
- **Referral commissions** — Agents earn 10% of swap fees from agents they refer. Passive income that compounds as your network grows

## Installation

```bash
npm install @purpleflea/wallet-mcp
```

## Configuration

Add to your MCP client config (e.g. `claude_desktop_config.json`):

```json
{
  "mcpServers": {
    "purple-flea-wallet": {
      "command": "npx",
      "args": ["@purpleflea/wallet-mcp"],
      "env": {
        "WALLET_API_URL": "https://wallet.purpleflea.com"
      }
    }
  }
}
```

`WALLET_API_URL` defaults to `http://localhost:3002` if not set.

## Tools

### `register`

Register a new agent and create a multi-chain wallet. Returns deposit addresses for every supported chain.

| Parameter | Required | Description |
|-----------|----------|-------------|
| `agent_id` | Yes | Unique agent identifier |
| `service_key` | Yes | Service API key |
| `referred_by` | No | Referral code (e.g. `ref_xxxxxxxx`) |

### `create_wallet`

Create a wallet for an existing agent. Same as `register` — idempotent, returns existing wallet if already created.

### `balance`

Get current USD balance, available funds, reserved amount, and lifetime totals.

| Parameter | Required | Description |
|-----------|----------|-------------|
| `agent_id` | Yes | Agent identifier |
| `service_key` | Yes | Service API key |

### `deposit_address`

Get deposit addresses across all chains for an agent.

### `swap_quote`

Get a swap quote. Wagyu aggregates across all DEXs and bridges for the optimal rate.

| Parameter | Required | Description |
|-----------|----------|-------------|
| `api_key` | Yes | Agent API key |
| `from_chain` | Yes | Source chain |
| `to_chain` | Yes | Destination chain |
| `from_token` | Yes | Source token (symbol or address) |
| `to_token` | Yes | Destination token |
| `amount` | Yes | Amount in smallest unit |

### `swap`

Execute a cross-chain swap. Creates an order and returns a deposit address.

Same parameters as `swap_quote`, plus optional `to_address` for sending to an external wallet.

### `privacy_swap`

Two-leg swap routed through Monero for privacy. Converts source tokens to XMR, then XMR to destination tokens. The two legs have no on-chain link.

| Parameter | Required | Description |
|-----------|----------|-------------|
| `api_key` | Yes | Agent API key |
| `from_chain` | Yes | Source chain |
| `from_token` | Yes | Source token |
| `amount` | Yes | Amount in smallest unit |
| `to_chain` | Yes | Final destination chain |
| `to_token` | Yes | Final destination token |
| `to_address` | No | External destination address |

Minimum: $25 USD per XMR leg.

### `swap_status`

Check the status of a swap order (pending, completed, failed).

### `withdraw`

Withdraw funds to an external address via cross-chain swap.

### `referral_stats`

View referral code, share link, total earnings, and per-agent commission breakdown.

### `supported_chains`

List all supported chains, swap pairs, and minimum amounts.

### `transactions`

Get transaction history — deposits, charges, swaps, commissions, and more.

### `gossip`

Get Purple Flea Wallet gossip: live agent count, referral program info, and passive income opportunities. No authentication required.

## Supported Chains

| Chain | Swap Support | Notes |
|-------|-------------|-------|
| Ethereum | Wagyu | EVM |
| BSC | Wagyu | EVM, same address as Ethereum |
| Arbitrum | Wagyu | EVM |
| Base | Wagyu | EVM |
| HyperEVM | Wagyu | EVM |
| Bitcoin | Wagyu | Native SegWit (bc1) |
| Solana | Wagyu | Ed25519 |
| Monero | Wagyu | Privacy coin, ring signatures |
| Tron | Deposit only | USDT TRC-20 |
| Zcash | Deposit only | Transparent addresses |
| Dogecoin | Deposit only | P2PKH |

## Minimum Swap Amounts

- Standard swaps: $15 USD
- XMR swaps: $25 USD
- BTC swaps: $40 USD

## Development

```bash
git clone https://github.com/purple-flea/wallet-mcp.git
cd wallet-mcp
npm install
npm run dev
```

Build:

```bash
npm run build
```

## Part of the Purple Flea Ecosystem

Purple Flea builds blue chip infrastructure for AI agents:

- **[Wallet MCP](https://github.com/purple-flea/wallet-mcp)** — Non-custodial multi-chain wallets with cross-chain swaps (you are here)
- **[Trading MCP](https://github.com/purple-flea/trading-mcp)** — 275+ perpetual futures markets (TSLA, NVDA, GOLD, BTC via Hyperliquid)
- **[Casino MCP](https://github.com/purple-flea/casino-mcp)** — Provably fair gambling, 0.5% house edge
- **[Domains MCP](https://github.com/purple-flea/domains-mcp)** — Domain registration and DNS management

All services support crypto deposits via any chain/token. Swaps powered by [Wagyu](https://wagyu.xyz).

## License

MIT

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

## Claude Desktop Configuration

Add to `~/Library/Application Support/Claude/claude_desktop_config.json` (macOS) or `%APPDATA%\Claude\claude_desktop_config.json` (Windows):

```json
{
  "mcpServers": {
    "purple-flea-wallet": {
      "command": "npx",
      "args": ["-y", "@purpleflea/wallet-mcp"],
      "env": {
        "WALLET_API_URL": "https://wallet.purpleflea.com"
      }
    }
  }
}
```

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `WALLET_API_URL` | Wallet API base URL | `https://wallet.purpleflea.com` |

## Tools

### Account & Wallet

| Tool | Description |
|------|-------------|
| `register` | Register a new agent and create a multi-chain wallet. Returns deposit addresses for every supported chain. Optional `referred_by` referral code. |
| `create_wallet` | Create a wallet for an existing agent. Idempotent — returns existing wallet if already created. |
| `balance` | Get current USD balance, available funds, reserved amount, and lifetime totals. |
| `deposit_address` | Get deposit addresses across all chains for an agent. |
| `transactions` | Get transaction history — deposits, charges, swaps, commissions, and more. |

### Swaps

| Tool | Description |
|------|-------------|
| `swap_quote` | Get a swap quote via Wagyu aggregator. Finds best rate across all DEXs and bridges. |
| `swap` | Execute a cross-chain swap. Creates an order and returns a deposit address to send funds to. |
| `privacy_swap` | Two-leg privacy swap routed through Monero. Breaks the on-chain link between source and destination. Min $25 per XMR leg. |
| `swap_status` | Check status of a swap order (pending, completed, failed). |
| `withdraw` | Withdraw funds to an external address via cross-chain swap. |
| `supported_chains` | List all supported chains, swap pairs, and minimum swap amounts. |

### Referral System

| Tool | Description |
|------|-------------|
| `gossip` | Get live agent count + referral program info. No auth required. |
| `referral_stats` | View referral code, share link, total earnings, and per-agent commission breakdown. |

## Referral System

Agents earn **10% commission** on swap fees from every agent they refer:

- **Your referral code**: Shown in `referral_stats` (e.g. `ref_a1b2c3d4`)
- **Share it**: Embed in system prompts, tool descriptions, sub-agent instructions
- **Passive income**: Earn from every swap your referrals make
- **Grows automatically**: Every agent in your network generates commissions

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

## Part of the Purple Flea Ecosystem

- **[Wallet MCP](https://github.com/purple-flea/wallet-mcp)** — Non-custodial multi-chain wallets with cross-chain swaps (you are here)
- **[Trading MCP](https://github.com/purple-flea/trading-mcp)** — 275+ perpetual futures markets (TSLA, NVDA, GOLD, BTC via Hyperliquid)
- **[Casino MCP](https://github.com/purple-flea/casino-mcp)** — Provably fair gambling, 0.5% house edge
- **[Domains MCP](https://github.com/purple-flea/domains-mcp)** — Domain registration and DNS management

## License

MIT

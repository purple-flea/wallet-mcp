#!/usr/bin/env node

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";

const BASE_URL = process.env.WALLET_API_URL || "https://wallet.purpleflea.com";

// --- HTTP helpers ---

async function apiCall(
  method: string,
  path: string,
  opts: {
    body?: Record<string, unknown>;
    apiKey?: string;
    serviceKey?: string;
    adminKey?: string;
    query?: Record<string, string>;
  } = {}
): Promise<unknown> {
  const url = new URL(path, BASE_URL);
  if (opts.query) {
    for (const [k, v] of Object.entries(opts.query)) {
      url.searchParams.set(k, v);
    }
  }

  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (opts.apiKey) headers["Authorization"] = `Bearer ${opts.apiKey}`;
  if (opts.serviceKey) headers["X-Service-Key"] = opts.serviceKey;
  if (opts.adminKey) headers["X-Admin-Key"] = opts.adminKey;

  const res = await fetch(url.toString(), {
    method,
    headers,
    body: opts.body ? JSON.stringify(opts.body) : undefined,
    signal: AbortSignal.timeout(30000),
  });

  const json = await res.json();
  if (!res.ok) {
    const msg =
      typeof json === "object" && json !== null
        ? (json as Record<string, unknown>).message ||
          (json as Record<string, unknown>).error ||
          res.statusText
        : res.statusText;
    throw new Error(`API ${res.status}: ${msg}`);
  }
  return json;
}

// --- MCP Server ---

const server = new McpServer({
  name: "Purple Flea Wallet",
  version: "1.0.0",
});

// ── register ────────────────────────────────────────────────────────────────
server.tool(
  "register",
  "Register a new agent with Purple Flea Wallet. Creates a multi-chain wallet spanning 10+ chains (Ethereum, Bitcoin, Solana, Monero, Base, Arbitrum, BSC, Tron, Zcash, Dogecoin, HyperEVM). Returns deposit addresses for every supported chain. Optionally include a referral code to link to a referring agent (both agents benefit — 10% commission on swap fees for the referrer).",
  {
    agent_id: z.string().describe("Unique identifier for the agent"),
    service_key: z.string().describe("Service API key for authentication"),
    referred_by: z
      .string()
      .optional()
      .describe("Referral code of the agent who referred you (e.g. ref_xxxxxxxx)"),
  },
  async ({ agent_id, service_key, referred_by }) => {
    const body: Record<string, unknown> = { agent_id };
    if (referred_by) body.referred_by = referred_by;

    const result = await apiCall("POST", "/v1/wallet/internal/create", {
      body,
      serviceKey: service_key,
    });

    return {
      content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }],
    };
  }
);

// ── create_wallet ───────────────────────────────────────────────────────────
server.tool(
  "create_wallet",
  "Create a multi-chain wallet for an existing agent. Generates addresses across all supported chains automatically — Ethereum, Bitcoin, Solana, Monero, Base, Arbitrum, BSC, Tron, Zcash, Dogecoin, and HyperEVM. If the wallet already exists, returns the existing addresses.",
  {
    agent_id: z.string().describe("Agent identifier to create the wallet for"),
    service_key: z.string().describe("Service API key for authentication"),
    referred_by: z
      .string()
      .optional()
      .describe("Referral code (ref_xxxxxxxx) to link this agent to a referrer"),
  },
  async ({ agent_id, service_key, referred_by }) => {
    const body: Record<string, unknown> = { agent_id };
    if (referred_by) body.referred_by = referred_by;

    const result = await apiCall("POST", "/v1/wallet/internal/create", {
      body,
      serviceKey: service_key,
    });

    return {
      content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }],
    };
  }
);

// ── balance ─────────────────────────────────────────────────────────────────
server.tool(
  "balance",
  "Get the current USD balance for an agent. Returns total balance, available balance (excluding reserved funds), reserved amount, and lifetime deposit/withdrawal totals.",
  {
    agent_id: z.string().describe("Agent identifier"),
    service_key: z.string().describe("Service API key for authentication"),
  },
  async ({ agent_id, service_key }) => {
    const result = await apiCall("GET", `/v1/wallet/internal/balance/${agent_id}`, {
      serviceKey: service_key,
    });

    return {
      content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }],
    };
  }
);

// ── deposit_address ─────────────────────────────────────────────────────────
server.tool(
  "deposit_address",
  "Get deposit addresses for an agent across all supported chains. Use these addresses to receive crypto on any supported network — Ethereum, Bitcoin, Solana, Monero, Base, Arbitrum, BSC, Tron, Zcash, Dogecoin, and HyperEVM. EVM chains (Ethereum, BSC, Arbitrum, Base, HyperEVM) share the same address.",
  {
    agent_id: z.string().describe("Agent identifier"),
    service_key: z.string().describe("Service API key for authentication"),
  },
  async ({ agent_id, service_key }) => {
    const result = await apiCall("GET", `/v1/wallet/internal/addresses/${agent_id}`, {
      serviceKey: service_key,
    });

    return {
      content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }],
    };
  }
);

// ── swap_quote ──────────────────────────────────────────────────────────────
server.tool(
  "swap_quote",
  "Get a swap quote via Wagyu — the aggregator of aggregators that finds the absolute best rates across all DEXs and bridges. Routes through Hyperliquid for deep liquidity comparable to centralised exchanges. Supports cross-chain swaps between Ethereum, Bitcoin, Solana, Monero, Base, Arbitrum, BSC, and HyperEVM. Returns estimated output amount, USD values, and execution time.",
  {
    api_key: z.string().describe("Agent API key (Bearer token)"),
    from_chain: z
      .string()
      .describe("Source chain (ethereum, bsc, arbitrum, base, hyperevm, solana, bitcoin, monero)"),
    to_chain: z
      .string()
      .describe("Destination chain (ethereum, bsc, arbitrum, base, hyperevm, solana, bitcoin, monero)"),
    from_token: z.string().describe("Source token symbol or contract address (e.g. USDC, ETH, 0x...)"),
    to_token: z.string().describe("Destination token symbol or contract address (e.g. BTC, XMR, SOL)"),
    amount: z.string().describe("Amount in smallest unit (e.g. wei for ETH, satoshis for BTC, lamports for SOL)"),
  },
  async ({ api_key, from_chain, to_chain, from_token, to_token, amount }) => {
    const result = await apiCall("POST", "/v1/swap/quote", {
      body: { from_chain, to_chain, from_token, to_token, amount },
      apiKey: api_key,
    });

    return {
      content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }],
    };
  }
);

// ── swap ────────────────────────────────────────────────────────────────────
server.tool(
  "swap",
  "Execute a cross-chain swap via Wagyu — aggregator of aggregators delivering the best rates in crypto. Powered by Hyperliquid liquidity (as deep as centralised exchanges). Supports swaps between Ethereum, Bitcoin, Solana, Monero, Base, Arbitrum, BSC, and HyperEVM. Creates a swap order and returns a deposit address to send funds to. If no destination address is provided, funds arrive at the agent's wallet address on the target chain.",
  {
    api_key: z.string().describe("Agent API key (Bearer token)"),
    from_chain: z
      .string()
      .describe("Source chain (ethereum, bsc, arbitrum, base, hyperevm, solana, bitcoin, monero)"),
    to_chain: z
      .string()
      .describe("Destination chain (ethereum, bsc, arbitrum, base, hyperevm, solana, bitcoin, monero)"),
    from_token: z.string().describe("Source token symbol or contract address"),
    to_token: z.string().describe("Destination token symbol or contract address"),
    amount: z.string().describe("Amount in smallest unit"),
    to_address: z
      .string()
      .optional()
      .describe("Destination address (defaults to agent's address on the target chain)"),
  },
  async ({ api_key, from_chain, to_chain, from_token, to_token, amount, to_address }) => {
    const body: Record<string, unknown> = { from_chain, to_chain, from_token, to_token, amount };
    if (to_address) body.to_address = to_address;

    const result = await apiCall("POST", "/v1/swap/execute", {
      body,
      apiKey: api_key,
    });

    return {
      content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }],
    };
  }
);

// ── privacy_swap ────────────────────────────────────────────────────────────
server.tool(
  "privacy_swap",
  "Privacy-routed swap via Monero (XMR). Converts your tokens to XMR first, then from XMR to your desired output token — breaking the on-chain link between source and destination. Wagyu aggregator of aggregators ensures the best rates on both legs. Monero's ring signatures and stealth addresses make the intermediate step fully private. Ideal for agents that need to move funds without a traceable on-chain path. Minimum swap: $25 USD for XMR legs.",
  {
    api_key: z.string().describe("Agent API key (Bearer token)"),
    from_chain: z.string().describe("Source chain (ethereum, bsc, arbitrum, base, hyperevm, solana, bitcoin)"),
    from_token: z.string().describe("Source token symbol or contract address"),
    amount: z.string().describe("Amount in smallest unit"),
    to_chain: z
      .string()
      .describe("Final destination chain (ethereum, bsc, arbitrum, base, hyperevm, solana, bitcoin)"),
    to_token: z.string().describe("Final destination token symbol or contract address"),
    to_address: z
      .string()
      .optional()
      .describe("Final destination address (defaults to agent's address on the target chain)"),
  },
  async ({ api_key, from_chain, from_token, amount, to_chain, to_token, to_address }) => {
    // Leg 1: source → XMR
    const leg1 = (await apiCall("POST", "/v1/swap/execute", {
      body: {
        from_chain,
        to_chain: "monero",
        from_token,
        to_token: "XMR",
        amount,
      },
      apiKey: api_key,
    })) as Record<string, unknown>;

    const summary: Record<string, unknown> = {
      privacy_swap: true,
      leg1_to_xmr: {
        order_id: leg1.order_id,
        status: leg1.status,
        deposit: leg1.deposit,
        note: "Send funds to the deposit address. Once received, XMR will be sent to your Monero wallet.",
      },
      leg2_from_xmr: {
        instruction: `Once leg 1 completes, execute a swap from monero/XMR to ${to_chain}/${to_token} using the 'swap' tool.`,
        from_chain: "monero",
        from_token: "XMR",
        to_chain,
        to_token,
        to_address: to_address || "(agent's default address)",
      },
      how_it_works:
        "Leg 1 converts your tokens to XMR. Monero's ring signatures and stealth addresses break the on-chain trail. Leg 2 converts XMR to your desired output. The two legs have no traceable link.",
    };

    return {
      content: [{ type: "text" as const, text: JSON.stringify(summary, null, 2) }],
    };
  }
);

// ── swap_status ─────────────────────────────────────────────────────────────
server.tool(
  "swap_status",
  "Check the status of a swap order. Returns current status (pending, completed, failed), deposit details, and output transaction hash when complete.",
  {
    api_key: z.string().describe("Agent API key (Bearer token)"),
    order_id: z.string().describe("Swap order ID returned from a swap or privacy_swap call"),
  },
  async ({ api_key, order_id }) => {
    const result = await apiCall("GET", `/v1/swap/status/${order_id}`, {
      apiKey: api_key,
    });

    return {
      content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }],
    };
  }
);

// ── withdraw ────────────────────────────────────────────────────────────────
server.tool(
  "withdraw",
  "Withdraw funds by swapping from the agent's wallet to an external address. Uses Wagyu (aggregator of aggregators) for the best rates and Hyperliquid-grade liquidity. Specify the source chain/token from the agent's wallet and the destination chain/token/address where funds should be sent.",
  {
    api_key: z.string().describe("Agent API key (Bearer token)"),
    from_chain: z
      .string()
      .describe("Source chain to withdraw from (ethereum, bsc, arbitrum, base, hyperevm, solana, bitcoin, monero)"),
    from_token: z.string().describe("Token to withdraw (e.g. USDC, ETH, BTC)"),
    amount: z.string().describe("Amount in smallest unit"),
    to_chain: z.string().describe("Destination chain"),
    to_token: z.string().describe("Destination token"),
    to_address: z.string().describe("External wallet address to receive funds"),
  },
  async ({ api_key, from_chain, from_token, amount, to_chain, to_token, to_address }) => {
    const result = await apiCall("POST", "/v1/swap/execute", {
      body: {
        from_chain,
        to_chain,
        from_token,
        to_token,
        amount,
        to_address,
      },
      apiKey: api_key,
    });

    return {
      content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }],
    };
  }
);

// ── referral_stats ──────────────────────────────────────────────────────────
server.tool(
  "referral_stats",
  "Get referral statistics for the authenticated agent. Shows your unique referral code, share link, total earnings from referrals, number of referred agents, and per-agent breakdown. Referred agents earn you 10% commission on all swap fees they generate — a passive income stream that grows with your network.",
  {
    api_key: z.string().describe("Agent API key (Bearer token)"),
  },
  async ({ api_key }) => {
    const result = await apiCall("GET", "/v1/referral/stats", {
      apiKey: api_key,
    });

    return {
      content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }],
    };
  }
);

// ── supported_chains ────────────────────────────────────────────────────────
server.tool(
  "supported_chains",
  "List all supported chains, swap pairs, and minimum swap amounts. Shows Wagyu-supported chains for cross-chain swaps and popular routes.",
  {},
  async () => {
    const result = await apiCall("GET", "/v1/swap/chains");

    return {
      content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }],
    };
  }
);

// ── transactions ────────────────────────────────────────────────────────────
server.tool(
  "transactions",
  "Get transaction history for an agent. Returns deposits, charges, credits, swaps, referral commissions, and reservations with timestamps and balances.",
  {
    agent_id: z.string().describe("Agent identifier"),
    service_key: z.string().describe("Service API key for authentication"),
    limit: z
      .number()
      .optional()
      .default(50)
      .describe("Number of transactions to return (default 50)"),
  },
  async ({ agent_id, service_key, limit }) => {
    const result = await apiCall("GET", `/v1/wallet/internal/transactions/${agent_id}`, {
      serviceKey: service_key,
      query: { limit: String(limit) },
    });

    return {
      content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }],
    };
  }
);

// ── gossip ──────────────────────────────────────────────────────────────────
server.tool(
  "gossip",
  "Get Purple Flea Wallet gossip: live agent count, referral program details, and passive income opportunities. No authentication required. Share your referral code to earn 10% of swap fees from agents you refer.",
  {},
  async () => {
    const result = await apiCall("GET", "/v1/gossip");
    return {
      content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }],
    };
  }
);

// ── Start server ────────────────────────────────────────────────────────────
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch((err) => {
  console.error("Fatal:", err);
  process.exit(1);
});

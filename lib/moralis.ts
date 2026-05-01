const MORALIS_API_KEY = process.env.MORALIS_API_KEY ?? "";

type JsonObject = Record<string, unknown>;

function getHeaders() {
  return {
    Accept: "application/json",
    "X-API-Key": MORALIS_API_KEY
  };
}

async function fetchMoralis(url: string) {
  if (!MORALIS_API_KEY) {
    throw new Error("MORALIS_API_KEY is not configured.");
  }

  const response = await fetch(url, {
    headers: getHeaders(),
    next: {
      revalidate: 60
    }
  });

  if (!response.ok) {
    throw new Error(`Moralis request failed with ${response.status}.`);
  }

  return (await response.json()) as JsonObject;
}

export async function getEvmTokenHolders(tokenAddress: string, chain: string) {
  return fetchMoralis(
    `https://deep-index.moralis.io/api/v2.2/erc20/${encodeURIComponent(
      tokenAddress
    )}/owners?chain=${encodeURIComponent(chain)}&limit=10&order=DESC`
  );
}

export async function getEvmHolderStats(tokenAddress: string, chain: string) {
  return fetchMoralis(
    `https://deep-index.moralis.io/api/v2.2/erc20/${encodeURIComponent(
      tokenAddress
    )}/holders?chain=${encodeURIComponent(chain)}`
  );
}

export async function getSolanaHolderStats(tokenAddress: string) {
  return fetchMoralis(
    `https://solana-gateway.moralis.io/token/mainnet/holders/${encodeURIComponent(
      tokenAddress
    )}`
  );
}

export async function getSolanaTopHolders(tokenAddress: string) {
  return fetchMoralis(
    `https://solana-gateway.moralis.io/token/mainnet/${encodeURIComponent(
      tokenAddress
    )}/top-holders`
  );
}

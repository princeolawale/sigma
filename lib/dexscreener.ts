export interface DexscreenerTokenRef {
  address?: string;
  symbol?: string;
  name?: string;
}

export interface DexscreenerPair {
  chainId?: string;
  dexId?: string;
  pairAddress?: string;
  url?: string;
  labels?: string[];
  pairCreatedAt?: number;
  fdv?: number;
  priceUsd?: string;
  baseToken?: DexscreenerTokenRef;
  quoteToken?: DexscreenerTokenRef;
  liquidity?: {
    usd?: number;
  };
  volume?: {
    h24?: number;
  };
  priceChange?: {
    h24?: number;
  };
  txns?: {
    h24?: {
      buys?: number;
      sells?: number;
    };
  };
}

interface DexscreenerResponse {
  pairs?: DexscreenerPair[] | null;
}

function getNumber(value: unknown) {
  return typeof value === "number" && Number.isFinite(value) ? value : 0;
}

async function fetchDexscreener(path: string) {
  const response = await fetch(`https://api.dexscreener.com${path}`, {
    headers: {
      Accept: "application/json"
    },
    next: {
      revalidate: 30
    }
  });

  if (!response.ok) {
    throw new Error("Dexscreener is unavailable.");
  }

  return (await response.json()) as DexscreenerResponse;
}

export function sortPairsByLiquidity(pairs: DexscreenerPair[]) {
  return [...pairs].sort((first, second) => {
    return (
      getNumber(second.liquidity?.usd) - getNumber(first.liquidity?.usd)
    );
  });
}

export async function getPairsForToken(address: string) {
  const data = await fetchDexscreener(
    `/latest/dex/tokens/${encodeURIComponent(address)}`
  );

  return sortPairsByLiquidity(data.pairs ?? []);
}

export async function searchPairs(query: string) {
  const data = await fetchDexscreener(
    `/latest/dex/search?q=${encodeURIComponent(query)}`
  );

  return sortPairsByLiquidity(data.pairs ?? []);
}

export async function detectBestPair(addressOrQuery: string) {
  const directPairs = await getPairsForToken(addressOrQuery).catch(() => []);

  if (directPairs.length > 0) {
    return {
      pair: directPairs[0],
      pairs: directPairs,
      source: "token"
    } as const;
  }

  const searchPairsResult = await searchPairs(addressOrQuery).catch(() => []);

  if (searchPairsResult.length === 0) {
    return {
      pair: null,
      pairs: [],
      source: "search"
    } as const;
  }

  const exactTokenMatch =
    searchPairsResult.find((pair) => {
      return (
        pair.baseToken?.address?.toLowerCase() === addressOrQuery.toLowerCase()
      );
    }) ?? searchPairsResult[0];

  return {
    pair: exactTokenMatch,
    pairs: searchPairsResult,
    source: "search"
  } as const;
}

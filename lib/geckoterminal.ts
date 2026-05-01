export interface GeckoTerminalPool {
  id: string;
  attributes?: {
    address?: string;
    name?: string;
    pool_created_at?: string;
    reserve_in_usd?: string;
    volume_usd?: {
      h24?: string;
    };
    price_change_percentage?: {
      h24?: string;
    };
    base_token_price_usd?: string;
    quote_token_price_usd?: string;
  };
  relationships?: {
    dex?: {
      data?: {
        id?: string;
      };
    };
    base_token?: {
      data?: {
        id?: string;
      };
    };
    quote_token?: {
      data?: {
        id?: string;
      };
    };
  };
}

interface GeckoTerminalResponse {
  data?: GeckoTerminalPool[];
}

async function fetchGeckoTerminal(path: string) {
  const response = await fetch(`https://api.geckoterminal.com/api/v2${path}`, {
    headers: {
      Accept: "application/json"
    },
    next: {
      revalidate: 60
    }
  });

  if (!response.ok) {
    throw new Error("GeckoTerminal is unavailable.");
  }

  return (await response.json()) as GeckoTerminalResponse;
}

function getReserve(pool: GeckoTerminalPool) {
  return Number(pool.attributes?.reserve_in_usd ?? 0);
}

export async function searchPools(query: string) {
  const result = await fetchGeckoTerminal(
    `/search/pools?query=${encodeURIComponent(query)}`
  );

  return [...(result.data ?? [])].sort((first, second) => {
    return getReserve(second) - getReserve(first);
  });
}

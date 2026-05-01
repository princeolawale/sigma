const EXPLORER_API_KEY =
  process.env.ETHERSCAN_API_KEY ?? process.env.EXPLORER_API_KEY ?? "";

const BURN_ADDRESSES = [
  "0x000000000000000000000000000000000000dead",
  "0x0000000000000000000000000000000000000000"
];

const LOCKER_ADDRESSES = [
  "0x663a5c229c09b049e36dcc11fae5f1d8a5e1c2a7", // Team Finance
  "0x71b5759d73262fbb223956913ecf4ecc51057641", // Unicrypt
  "0xe2fe530c047f2d85298b07d9333c05737f1435fb" // PinkLock
];

export interface ExplorerHolder {
  address: string;
  quantity: string;
  addressType: string;
}

export interface ExplorerAnalysis {
  chainId: number | null;
  explorerName: string | null;
  deployerAddress: string | null;
  deployerTokenBalance: string | null;
  contractCreatedAt: number | null;
  creationTxHash: string | null;
  totalSupply: string | null;
  holderCount: number | null;
  topHolders: ExplorerHolder[];
  sourceCode: string | null;
  sourceVerified: boolean;
  lpBurnedPercent: number | null;
  lpLockedPercent: number | null;
  lpDeployerPercent: number | null;
}

const CHAIN_TO_EXPLORER: Record<
  string,
  { chainId: number; name: string } | undefined
> = {
  ethereum: { chainId: 1, name: "Etherscan" },
  bsc: { chainId: 56, name: "BscScan" },
  polygon: { chainId: 137, name: "PolygonScan" },
  arbitrum: { chainId: 42161, name: "Arbiscan" },
  base: { chainId: 8453, name: "Basescan" },
  avax: { chainId: 43114, name: "SnowTrace" }
};

function parseNumber(value: string | number | null | undefined) {
  if (typeof value === "number") {
    return Number.isFinite(value) ? value : null;
  }

  if (!value) {
    return null;
  }

  const number = Number(value);
  return Number.isFinite(number) ? number : null;
}

function parsePercent(rawBalance: string | null, rawSupply: string | null) {
  const balance = parseNumber(rawBalance);
  const supply = parseNumber(rawSupply);

  if (!balance || !supply || supply <= 0) {
    return null;
  }

  return Number(((balance / supply) * 100).toFixed(2));
}

async function fetchExplorer(
  chainId: number,
  params: Record<string, string | number>
) {
  if (!EXPLORER_API_KEY) {
    return null;
  }

  const query = new URLSearchParams({
    chainid: String(chainId),
    apikey: EXPLORER_API_KEY,
    ...Object.fromEntries(
      Object.entries(params).map(([key, value]) => [key, String(value)])
    )
  });

  const response = await fetch(`https://api.etherscan.io/v2/api?${query}`, {
    headers: {
      Accept: "application/json"
    },
    next: {
      revalidate: 60
    }
  });

  if (!response.ok) {
    return null;
  }

  return (await response.json()) as {
    status?: string;
    message?: string;
    result?: unknown;
  };
}

async function getContractCreation(chainId: number, address: string) {
  const response = await fetchExplorer(chainId, {
    module: "contract",
    action: "getcontractcreation",
    contractaddresses: address
  });

  const result = Array.isArray(response?.result) ? response.result[0] : null;

  if (!result || typeof result !== "object") {
    return null;
  }

  return result as {
    contractCreator?: string;
    txHash?: string;
    timestamp?: string;
  };
}

async function getTokenSupply(chainId: number, address: string) {
  const response = await fetchExplorer(chainId, {
    module: "stats",
    action: "tokensupply",
    contractaddress: address
  });

  return typeof response?.result === "string" ? response.result : null;
}

async function getTokenBalance(
  chainId: number,
  tokenAddress: string,
  holderAddress: string
) {
  const response = await fetchExplorer(chainId, {
    module: "account",
    action: "tokenbalance",
    contractaddress: tokenAddress,
    address: holderAddress,
    tag: "latest"
  });

  return typeof response?.result === "string" ? response.result : null;
}

async function getHolderCount(chainId: number, address: string) {
  const response = await fetchExplorer(chainId, {
    module: "token",
    action: "tokenholdercount",
    contractaddress: address
  });

  return parseNumber(typeof response?.result === "string" ? response.result : null);
}

async function getTopHolders(chainId: number, address: string) {
  const response = await fetchExplorer(chainId, {
    module: "token",
    action: "topholders",
    contractaddress: address,
    offset: 10
  });

  if (!Array.isArray(response?.result)) {
    return [] as ExplorerHolder[];
  }

  return response.result
    .map((holder) => {
      if (!holder || typeof holder !== "object") {
        return null;
      }

      const record = holder as Record<string, unknown>;
      return {
        address: String(record.TokenHolderAddress ?? ""),
        quantity: String(record.TokenHolderQuantity ?? "0"),
        addressType: String(record.TokenHolderAddressType ?? "U")
      };
    })
    .filter((holder): holder is ExplorerHolder => Boolean(holder?.address));
}

async function getSourceCode(chainId: number, address: string) {
  const response = await fetchExplorer(chainId, {
    module: "contract",
    action: "getsourcecode",
    address
  });

  const result = Array.isArray(response?.result) ? response.result[0] : null;

  if (!result || typeof result !== "object") {
    return null;
  }

  const record = result as Record<string, unknown>;

  return {
    sourceCode: typeof record.SourceCode === "string" ? record.SourceCode : null,
    sourceVerified:
      typeof record.SourceCode === "string" && record.SourceCode.trim().length > 0
  };
}

async function getLpSafety(
  chainId: number,
  lpTokenAddress: string,
  deployerAddress: string | null
) {
  const totalSupply = await getTokenSupply(chainId, lpTokenAddress);

  const [burnBalances, lockerBalances, deployerBalance] = await Promise.all([
    Promise.all(
      BURN_ADDRESSES.map((address) =>
        getTokenBalance(chainId, lpTokenAddress, address)
      )
    ),
    Promise.all(
      LOCKER_ADDRESSES.map((address) =>
        getTokenBalance(chainId, lpTokenAddress, address)
      )
    ),
    deployerAddress
      ? getTokenBalance(chainId, lpTokenAddress, deployerAddress)
      : Promise.resolve(null)
  ]);

  const burnedRaw = burnBalances.reduce((sum, value) => {
    return sum + (parseNumber(value) ?? 0);
  }, 0);

  const lockedRaw = lockerBalances.reduce((sum, value) => {
    return sum + (parseNumber(value) ?? 0);
  }, 0);

  const burnedPercent = parsePercent(String(burnedRaw), totalSupply);
  const lockedPercent = parsePercent(String(lockedRaw), totalSupply);
  const deployerPercent = parsePercent(deployerBalance, totalSupply);

  return {
    burnedPercent,
    lockedPercent,
    deployerPercent
  };
}

export function getExplorerChain(chain: string | null | undefined) {
  if (!chain) {
    return null;
  }

  return CHAIN_TO_EXPLORER[chain] ?? null;
}

export async function getExplorerAnalysis(input: {
  chain: string | null | undefined;
  tokenAddress: string;
  lpTokenAddress?: string | null;
}) {
  const chain = getExplorerChain(input.chain);

  if (!chain || !EXPLORER_API_KEY) {
    return {
      chainId: chain?.chainId ?? null,
      explorerName: chain?.name ?? null,
      deployerAddress: null,
      deployerTokenBalance: null,
      contractCreatedAt: null,
      creationTxHash: null,
      totalSupply: null,
      holderCount: null,
      topHolders: [],
      sourceCode: null,
      sourceVerified: false,
      lpBurnedPercent: null,
      lpLockedPercent: null,
      lpDeployerPercent: null
    } satisfies ExplorerAnalysis;
  }

  const creation = await getContractCreation(chain.chainId, input.tokenAddress);
  const deployerAddress = creation?.contractCreator?.toLowerCase() ?? null;

  const [totalSupply, holderCount, topHolders, sourceData, deployerTokenBalance] =
    await Promise.all([
      getTokenSupply(chain.chainId, input.tokenAddress),
      getHolderCount(chain.chainId, input.tokenAddress),
      getTopHolders(chain.chainId, input.tokenAddress),
      getSourceCode(chain.chainId, input.tokenAddress),
      deployerAddress
        ? getTokenBalance(chain.chainId, input.tokenAddress, deployerAddress)
        : Promise.resolve(null)
    ]);

  const lpSafety =
    input.lpTokenAddress && deployerAddress
      ? await getLpSafety(chain.chainId, input.lpTokenAddress, deployerAddress)
      : {
          burnedPercent: null,
          lockedPercent: null,
          deployerPercent: null
        };

  return {
    chainId: chain.chainId,
    explorerName: chain.name,
    deployerAddress,
    deployerTokenBalance,
    contractCreatedAt: parseNumber(creation?.timestamp ?? null),
    creationTxHash: creation?.txHash ?? null,
    totalSupply,
    holderCount,
    topHolders,
    sourceCode: sourceData?.sourceCode ?? null,
    sourceVerified: sourceData?.sourceVerified ?? false,
    lpBurnedPercent: lpSafety.burnedPercent,
    lpLockedPercent: lpSafety.lockedPercent,
    lpDeployerPercent: lpSafety.deployerPercent
  } satisfies ExplorerAnalysis;
}

interface HolderDistribution {
  holderCount: number;
  topHolderPercent: number;
  top10Percent: number;
  supply: number | null;
}

type JsonObject = Record<string, unknown>;

function getNumber(value: unknown) {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === "string") {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }

  return null;
}

function getString(value: unknown) {
  return typeof value === "string" ? value : null;
}

function getObject(value: unknown) {
  return value && typeof value === "object" ? (value as JsonObject) : null;
}

function getArray(value: unknown) {
  return Array.isArray(value) ? value : [];
}

function roundPercent(value: number) {
  return Number(value.toFixed(2));
}

function findSupply(payload: JsonObject) {
  const candidates = [
    payload.total_supply,
    payload.totalSupply,
    payload.supply,
    getObject(payload.token)?.total_supply,
    getObject(payload.token)?.totalSupply
  ];

  for (const candidate of candidates) {
    const numeric = getNumber(candidate);
    if (numeric !== null && numeric > 0) {
      return numeric;
    }
  }

  return null;
}

function findHolderCount(payload: JsonObject) {
  const candidates = [
    payload.total_holders,
    payload.totalHolders,
    payload.holder_count,
    payload.holderCount,
    payload.result
  ];

  for (const candidate of candidates) {
    const numeric = getNumber(candidate);
    if (numeric !== null && numeric >= 0) {
      return numeric;
    }
  }

  const stats = getObject(payload.stats);
  if (stats) {
    const numeric =
      getNumber(stats.total_holders) ??
      getNumber(stats.totalHolders) ??
      getNumber(stats.holderCount);
    if (numeric !== null) {
      return numeric;
    }
  }

  return null;
}

function percentFromHolder(holder: JsonObject, supply: number | null) {
  const directCandidates = [
    holder.percentage_relative_to_total_supply,
    holder.percentageRelativeToTotalSupply,
    holder.percentage_of_supply,
    holder.percent,
    holder.share,
    holder.ownership_percentage
  ];

  for (const candidate of directCandidates) {
    const numeric = getNumber(candidate);
    if (numeric !== null) {
      return numeric > 1 ? roundPercent(numeric) : roundPercent(numeric * 100);
    }
  }

  const balanceCandidates = [
    holder.balance,
    holder.amount,
    holder.quantity,
    holder.value,
    holder.tokens
  ];

  if (!supply) {
    return null;
  }

  for (const candidate of balanceCandidates) {
    const numeric = getNumber(candidate);
    if (numeric !== null) {
      return roundPercent((numeric / supply) * 100);
    }
  }

  return null;
}

function normalizeFromTopHolders(
  holders: JsonObject[],
  holderCount: number | null,
  supply: number | null
) {
  const percents = holders
    .slice(0, 10)
    .map((holder) => percentFromHolder(holder, supply))
    .filter((value): value is number => value !== null);

  if (percents.length === 0 || holderCount === null) {
    return null;
  }

  return {
    holderCount,
    topHolderPercent: roundPercent(percents[0] ?? 0),
    top10Percent: roundPercent(percents.reduce((sum, value) => sum + value, 0)),
    supply
  } satisfies HolderDistribution;
}

export function normalizeEvmHolderData(input: {
  stats: JsonObject | null;
  holders: JsonObject | null;
}) {
  const holderCount =
    (input.stats && findHolderCount(input.stats)) ??
    (input.holders && findHolderCount(input.holders));
  const supply =
    (input.stats && findSupply(input.stats)) ??
    (input.holders && findSupply(input.holders));

  const holderRows = getArray(input.holders?.result).map((item) => {
    return getObject(item);
  });

  return normalizeFromTopHolders(
    holderRows.filter((item): item is JsonObject => Boolean(item)),
    holderCount,
    supply
  );
}

export function normalizeSolanaHolderData(input: {
  stats: JsonObject | null;
  holders: JsonObject | null;
}) {
  const holderCount =
    (input.stats && findHolderCount(input.stats)) ??
    (input.holders && findHolderCount(input.holders));
  const supply =
    (input.stats && findSupply(input.stats)) ??
    (input.holders && findSupply(input.holders));

  const holderRows = [
    ...getArray(input.holders?.result),
    ...getArray(input.holders?.holders),
    ...getArray(input.holders?.data)
  ]
    .map((item) => getObject(item))
    .filter((item): item is JsonObject => Boolean(item));

  return normalizeFromTopHolders(holderRows, holderCount, supply);
}

export type { HolderDistribution };

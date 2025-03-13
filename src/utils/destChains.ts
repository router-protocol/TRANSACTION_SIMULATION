const whitelistedDestChainIds: Map<string, string[]> = new Map([
  ['1', ['56', '10', '100']],
  ['56', ['1', '137', '43114']],
  ['10', ['1', '42161', '137']],
  ['137', ['56', '43114', '1']],
  ['43114', ['137', '56', '1']],
  ['42161', ['10', '1', '137']],
  ['100', ['1', '56', '10']],
  ['5', ['1', '56', '137']],
  ['42', ['1', '56', '43114']],
  ['3', ['1', '56', '10']],
]);

export function isSourceDestChainAllowed(
  sourceChainId: string,
  destChainId: string,
): boolean {
  const allowedSources = process.env.SUPPORTED_CHAINS?.split(',') ?? [];

  if (!allowedSources.includes(sourceChainId)) {
    return false;
  }

  const allowedDestChains = whitelistedDestChainIds.get(sourceChainId);
  if (allowedDestChains) {
    return allowedDestChains.includes(destChainId);
  }
  return true;
}

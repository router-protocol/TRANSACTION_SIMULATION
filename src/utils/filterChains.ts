import * as dotenv from 'dotenv';
dotenv.config();

const whitelistedDestChainIds: Map<string, string[]> = new Map([
  ['1', ['137', '10', '43114', '56', 'solana', 'near']],
  ['10', ['1', '137', '42161', '56', 'bitcoin', 'sui']],
  ['56', ['1', '137', '43114', '10', 'osmosis-1', 'router_9600-1']],
  ['30', ['137', '1', '56', '10', 'near', 'self-1', 'bitcoin']],
  ['137', ['56', '43114', '1', '10', 'sui', '3501']],
  ['169', ['1', '56', '10', '137', 'solana', 'near', 'bitcoin']],
  ['196', ['1', '56', '137', '43114', 'osmosis-1', 'sui', 'router_9600-1']],
  ['250', ['1', '10', '137', '42161', 'router_9600-1', '3501']],
  ['324', ['56', '1', '137', '100', 'near', 'self-1']],
  ['288', ['1', '10', '43114', '42161', 'bitcoin', 'sui', 'osmosis-1']],
  ['570', ['1', '56', '137', '10', 'solana', 'near', 'self-1']],
  ['698', ['137', '1', '56', '43114', 'bitcoin', 'sui']],
  ['995', ['1', '10', '42161', '137', 'near', '3501']],
  ['1088', ['56', '1', '137', '43114', 'osmosis-1', 'solana']],
  ['1997', ['1', '10', '56', '137', 'router_9600-1', 'near', 'bitcoin']],
  ['1101', ['137', '1', '43114', '42161', 'self-1', 'sui']],
  ['2000', ['1', '10', '56', '137', '3501', 'osmosis-1']],
  ['5000', ['56', '1', '43114', '100', 'solana', 'router_9600-1', 'near']],
  ['8453', ['137', '1', '10', '56', 'bitcoin', 'self-1', 'sui']],
  ['2040', ['56', '1', '43114', '42161', 'osmosis-1', '3501']],
  ['10242', ['1', '10', '137', '100', 'router_9600-1', 'near', 'bitcoin']],
  ['23294', ['137', '1', '56', '43114', 'self-1', 'sui']],
  ['34443', ['1', '10', '42161', '100', '3501', 'osmosis-1']],
  ['42161', ['56', '1', '137', '43114', 'solana', 'router_9600-1', 'near']],
  ['43114', ['1', '10', '56', '137', 'bitcoin', 'self-1', 'sui']],
  ['59144', ['137', '1', '42161', '100', 'osmosis-1', '3501']],
  ['534352', ['56', '1', '10', '137', 'solana', 'near', 'bitcoin']],
  ['167000', ['1', '43114', '42161', '100', 'router_9600-1', 'sui']],
  ['81457', ['56', '10', '137', '43114', 'near', 'self-1', '3501']],
  ['728126428', ['1', '42161', '100', 'osmosis-1', 'solana', 'bitcoin']],
  ['1313161554', ['56', '137', '43114', '10', 'router_9600-1', 'near', 'sui']],
  ['7225878', ['1', '42161', '100', 'self-1', 'bitcoin', '3501']],
  ['4061', ['56', '137', '10', '43114', 'osmosis-1', 'solana']],
  ['9008', ['1', '42161', '100', 'router_9600-1', 'near', 'bitcoin', 'sui']],
  ['1689', ['56', '137', '43114', '10', 'self-1', '3501']],
  [
    '151',
    ['1', '42161', '100', 'osmosis-1', 'solana', 'router_9600-1', 'near'],
  ],
  ['5845', ['56', '137', '43114', '10', 'bitcoin', 'self-1']],
  ['1868', ['1', '42161', '100', 'sui', '3501']],
  [
    '2818',
    ['56', '137', '10', '43114', 'osmosis-1', 'solana', 'router_9600-1'],
  ],
  ['57073', ['1', '42161', '100', 'near', 'self-1', 'bitcoin']],
  ['7777777', ['56', '137', '43114', '10', 'sui', '3501']],
  ['480', ['1', '42161', '100', 'osmosis-1', 'solana', 'router_9600-1']],
  ['543210', ['56', '137', '43114', '10', 'near', 'self-1', 'bitcoin']],
  ['146', ['1', '42161', '100', 'sui', '3501']],
  [
    '2741',
    ['56', '137', '10', '43114', 'osmosis-1', 'solana', 'router_9600-1'],
  ],
  ['466', ['1', '42161', '100', 'near', 'self-1', 'bitcoin']],
  ['100', ['56', '137', '43114', '10', 'sui', '3501']],
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

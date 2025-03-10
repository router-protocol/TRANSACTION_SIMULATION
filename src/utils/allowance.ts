import { Logger } from '@nestjs/common';
import { JsonRpcProvider, Contract } from 'ethers';

const logger = new Logger('allowanceUtils');
const tokenAbi: string[] = [
  'function allowance(address owner, address spender) view returns (uint256)',
  'function balanceOf(address owner) view returns (uint256)',
];

export async function getAllowance(
  provider: JsonRpcProvider,
  tokenAddress: string,
  owner: string,
  spender: string,
): Promise<string | undefined> {
  try {
    const tokenContract = new Contract(tokenAddress, tokenAbi, provider);
    const allowance = await tokenContract.allowance(owner, spender);
    logger.debug(
      `Allowance for ${owner} to ${spender} for token ${tokenAddress} is ${allowance}`,
    );
    return allowance.toString();
  } catch (error) {
    logger.error('Error fetching allowance', 'error');
    // throw new Error(error);
  }
}

export async function getBalance(
  provider: JsonRpcProvider,
  tokenAddress: string,
  owner: string,
): Promise<string | undefined> {
  try {
    const tokenContract = new Contract(tokenAddress, tokenAbi, provider);
    const balance = await tokenContract.balanceOf(owner);
    logger.debug(
      `Balance for ${owner} for token ${tokenAddress} is ${balance}`,
    );
    return balance.toString();
  } catch (error) {
    logger.error('Error fetching balance', 'error');
    // throw new Error(error);
  }
}

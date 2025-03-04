import { Injectable, Logger } from '@nestjs/common';
import { JsonRpcProvider, Contract } from 'ethers';

@Injectable()
export class AllowanceService {
  private readonly logger = new Logger(AllowanceService.name);
  private readonly tokenAbi: string[] = [
    'function allowance(address owner, address spender) view returns (uint256)',
    'function balanceOf(address owner) view returns (uint256)',
  ];

  constructor() {}

  async getAllowance(
    provider: JsonRpcProvider,
    tokenAddress: string,
    owner: string,
    spender: string,
  ): Promise<string> {
    try {
      const tokenContract = new Contract(tokenAddress, this.tokenAbi, provider);
      const allowance = await tokenContract.allowance(owner, spender);
      this.logger.debug(
        `Allowance for ${owner} to ${spender} is ${allowance} for token ${tokenAddress}`,
      );
      return allowance.toString();
    } catch (error) {
      this.logger.error('Error fetching allowance', error);
      throw error;
    }
  }

  async getBalance(
    provider: JsonRpcProvider,
    tokenAddress: string,
    owner: string,
  ): Promise<string> {
    try {
      const tokenContract = new Contract(tokenAddress, this.tokenAbi, provider);
      const balance = await tokenContract.balanceOf(owner);
      this.logger.debug(
        `Balance for ${owner} is ${balance} for token ${tokenAddress}`,
      );
      return balance.toString();
    } catch (error) {
      this.logger.error('Error fetching balance', error);
      throw error;
    }
  }
}

import { Controller, Get, Logger } from '@nestjs/common';
import { AppService } from './app.service';
import { JsonRpcProvider } from 'ethers';
import { tokens } from './config/tokens';
import { getChainTypeMap } from './config/chainType';
import * as dotenv from 'dotenv';
dotenv.config();

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}
  private readonly logger = new Logger(AppController.name);

  @Get()
  async getSimulation(): Promise<string> {
    await this.appService.runTestFlow();
    return 'hello world';
  }

  // TODO: @akshay
  @Get('/override-slots')
  async simulateApprovalAndBlanace(): Promise<string> {
    let count = 0;
    const finalTokens: any[] = [];
    try {
      // TODO: @akshay
      // read tokens and sort it
      const sortTokensByChainId = (tokens) => {
        // Create a copy to avoid mutation
        const tokensCopy = [...tokens];

        return tokensCopy.sort((a, b) => {
          const isANumeric = !isNaN(Number(a.chainId));
          const isBNumeric = !isNaN(Number(b.chainId));

          // Both numeric - compare numerically
          if (isANumeric && isBNumeric) {
            return Number(a.chainId) - Number(b.chainId);
          }

          // Both non-numeric - compare alphabetically
          if (!isANumeric && !isBNumeric) {
            return a.chainId.localeCompare(b.chainId);
          }

          // Numeric comes before non-numeric
          return isANumeric ? -1 : 1;
        });
      };

      // check chaintype if it is evm proceed
      const sortedTokens = sortTokensByChainId(tokens);

      for (const token of sortedTokens) {
        // if (token.chainId !== '42161') {
        //   continue;
        // }
        this.logger.log(`Processing input: ${count++}`);
        try {
          const sourceChain = token.chainId;
          const chainType = await getChainTypeMap(sourceChain);
          if (chainType !== 'evm') {
            continue;
          }
          const [provider, owner]: [JsonRpcProvider, string] =
            await this.appService.manageAnvil(sourceChain);

          // override approval and balance
          // for native 0xeee.. skip but add to final output
          const transaction = {
            source: {
              chainId: sourceChain,
            },
            fromTokenAddress: token.address,
            txn: { from: owner },
            allowanceTo: '0x1234567890abcdef1234567890abcdef12345678',
          };
          let overrideResult: boolean = false;
          if (chainType === 'evm') {
            overrideResult = await this.appService.overrideApprovalAndBalance(
              transaction,
              provider,
              sourceChain,
            );
            // check if override works
            if (overrideResult) {
              finalTokens.push(token);
            }
          }

          this.logger.verbose(
            `Token processed: ${JSON.stringify(finalTokens)}`,
          );

          // output as json
        } catch (err) {
          this.logger.error(`error caught in main controller`, err);
          continue;
        }
      }
    } catch (err) {
      this.logger.error(`error caught in main controller`, err);
    } finally {
      await this.appService.stopAnvil();
      await this.appService.writeJson(finalTokens);
      this.logger.warn(
        `tokens with error are ${JSON.stringify(this.appService.errorTokenAddrs)}`,
      );
    }
    return 'hello world';
  }
  @Get('/generateCombinations')
  async generateCombinations(): Promise<string> {
    await this.appService.generateTokens();
    return 'hello world!';
  }
}

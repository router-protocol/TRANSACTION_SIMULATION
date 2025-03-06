import { Controller, Get, Logger } from '@nestjs/common';
import { AppService } from './app.service';
import { AnvilManagerService } from './anvil-manager/anvil-manager.service';
import inputs from './config/customCombinations.json';
import { JsonRpcProvider } from 'ethers';
import { AllowanceService } from './allowance/allowance.service';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly anvilManager: AnvilManagerService,
    private readonly allowanceService: AllowanceService,
  ) {}
  private readonly logger = new Logger(AppController.name);
  private readonly maxOverrideValue =
    '0xfffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff1';
  private readonly resetOverrideValue = '0x00';

  @Get()
  async getSimulation(): Promise<string> {
    try {
      const sortedData = inputs.sort(
        (a, b) => Number(a.sourceChain) - Number(b.sourceChain),
      );

      for (const input of sortedData) {
        const sourceChain = input.sourceChain;
        const provider: JsonRpcProvider =
          await this.anvilManager.manage(sourceChain);
        // this.logger.log(provider);

        const accounts = await provider.listAccounts();
        const owner: string = accounts[0].address;

        // pf api
        const transactionData = await this.appService.getPathfinderData({
          ...input,
          owner: owner,
        });

        await this.appService.overrideApprovalAndBalance(
          transactionData,
          provider,
          this.maxOverrideValue,
          sourceChain,
        );

        await this.appService.simulateTransaction(transactionData, provider);

        await this.appService.overrideApprovalAndBalance(
          transactionData,
          provider,
          this.resetOverrideValue,
          sourceChain,
        );
      }
    } catch (err) {
      this.logger.error(`error caught in main controller`, err);
    } finally {
      await this.anvilManager.stopAnvil();
      this.anvilManager.reset();
    }
    return 'hello world';
  }
}

import { Controller, Get, Logger } from '@nestjs/common';
import { AppService } from './app.service';
import inputs from './config/customCombinations.json';
import { JsonRpcProvider } from 'ethers';
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}
  private readonly logger = new Logger(AppController.name);

  @Get()
  async getSimulation(): Promise<string> {
    await this.appService.initiateReporter();
    let count = 0;
    try {
      const sortedData = inputs.sort(
        (a, b) => Number(a.sourceChain) - Number(b.sourceChain),
      );

      for (const input of sortedData) {
        this.logger.log(`Processing input: ${count++}`);
        try {
          const sourceChain = input.sourceChain;
          const [provider, owner]: [JsonRpcProvider, string] =
            await this.appService.manageAnvil(sourceChain);

          // pf api
          const transactionData = await this.appService.getPathfinderData({
            ...input,
            owner: owner,
          });

          await this.appService.overrideApprovalAndBalance(
            transactionData,
            provider,
            'maxOverrideValue',
            sourceChain,
          );

          await this.appService.simulateTransaction(transactionData, provider);

          // not required @akshay
          await this.appService.overrideApprovalAndBalance(
            transactionData,
            provider,
            'resetOverrideValue',
            sourceChain,
          );
        } catch (err) {
          this.logger.error(`error caught in main controller`, err);
          continue;
        } finally {
          await this.appService.writeReport();
        }
      }
    } catch (err) {
      this.logger.error(`error caught in main controller`, err);
    } finally {
      await this.appService.stopAnvil();
      await this.appService.logReport();
      this.logger.verbose(`Failed count is : ${this.appService.failedCount}`);
      this.appService.failedCount = 0;
    }
    return 'hello world';
  }

  // TODO: @akshay
  @Get('/override-slots')
  async simulateApprovalAndBlanace(): Promise<string> {
    await this.appService.initiateReporter();
    let count = 0;
    try {

      // TODO: @akshay
      // read tokens and sort it
      // check chaintype if it is evm proceed
      const sortedData = inputs.sort(
        (a, b) => Number(a.sourceChain) - Number(b.sourceChain),
      );

      for (const input of sortedData) {
        this.logger.log(`Processing input: ${count++}`);
        try {
          const sourceChain = input.sourceChain;
          const [provider, owner]: [JsonRpcProvider, string] =
            await this.appService.manageAnvil(sourceChain);

          // override approval and balance
          // for native 0xeee.. skip but add to final output

          // check if override works

          // output as json
        } catch (err) {
          this.logger.error(`error caught in main controller`, err);
          continue;
        } finally {
          await this.appService.writeReport();
        }
      }
    } catch (err) {
      this.logger.error(`error caught in main controller`, err);
    } finally {
      await this.appService.stopAnvil();
      await this.appService.logReport();
      this.logger.verbose(`Failed count is : ${this.appService.failedCount}`);
      this.appService.failedCount = 0;
    }
    return 'hello world';
  }
}

import { Controller, Get, Logger } from '@nestjs/common';
import { AppService } from './app.service';
import { AnvilManagerService } from './anvil-manager/anvil-manager.service';
import inputs from './config/customCombinations.json';
import { JsonRpcProvider } from 'ethers';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly anvilManager: AnvilManagerService,
  ) {}
  private readonly logger = new Logger(AppController.name);

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
        this.logger.log(provider);
        const quoteData: any = await this.appService.getQuote(input);
        // await new Promise((resolve) => setTimeout(resolve, 2000));
        const accounts = await provider.listAccounts();
        // console.log('List of accounts:', accounts);

        const owner: string = accounts[0].address;
        // this.logger.log(`quoteData`);
        const transactionData = await this.appService.getTransaction(
          quoteData,
          owner,
        );
        const tokenAddr: string = transactionData.fromTokenAddress;
        const spender: string = transactionData.allowanceTo;

        await this.appService.overrideApproval(
          tokenAddr,
          owner,
          spender,
          '0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff',
          provider,
        );
        await this.appService.overrideBalance(
          tokenAddr,
          owner,
          '0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff',
          provider,
        );

        const tx = {
          from: transactionData.txn.from,
          to: transactionData.txn.to,
          // value: transactionData.txn.value,
          data: transactionData.txn.data,
          // gasLimit: transactionData.txn.gasLimit,
          // gasPrice: transactionData.txn.gasPrice,
        };
        try {
          const result = await provider.call(tx);
          this.logger.log(`Simulation successful. Result: ${result}`);
        } catch (err) {
          this.logger.error(`Error caught in simulation ${err}`);
        }

        await this.appService.overrideApproval(
          tokenAddr,
          owner,
          spender,
          '0x00',
          provider,
        );
        await this.appService.overrideBalance(
          tokenAddr,
          owner,
          '0x00',
          provider,
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

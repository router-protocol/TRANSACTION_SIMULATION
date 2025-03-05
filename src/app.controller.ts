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

        const accounts = await provider.listAccounts();
        const owner: string = accounts[0].address;

        // pf api
        const transactionData = await this.appService.getPathfinderData({
          ...input,
          owner: owner
        });

        const tokenAddr: string = transactionData.fromTokenAddress;
        const spender: string = transactionData.allowanceTo;

        await this.appService.overrideApproval(
          tokenAddr,
          owner,
          spender,
          '0xfffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff1',
          provider,
        );
        this.logger.debug(
          await this.allowanceService.getAllowance(
            provider,
            tokenAddr,
            owner,
            spender,
          ),
        );
        let slotNumber = 9;
        await this.appService.overrideBalance(
          tokenAddr,
          owner,
          '0xfffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff1',
          provider,
          slotNumber,
        );
        this.logger.debug(
          `for slot ${slotNumber} balance is: ` +
            (await this.allowanceService.getBalance(
              provider,
              tokenAddr,
              owner,
            )),
        );

        const tx = {
          from: transactionData.txn.from,
          to: transactionData.txn.to,
          // value: transactionData.txn.value,
          data: transactionData.txn.data,
          // gasLimit: transactionData.txn.gasLimit,
          // gasPrice: transactionData.txn.gasPrice,
        };
        this.logger.debug(`Transaction data: ${JSON.stringify(tx)}`);
        try {
          this.logger.debug(
            await this.allowanceService.getAllowance(
              provider,
              tokenAddr,
              owner,
              spender,
            ),
          );
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
        this.logger.debug(
          await this.allowanceService.getAllowance(
            provider,
            tokenAddr,
            owner,
            spender,
          ),
        );
        await this.appService.overrideBalance(
          tokenAddr,
          owner,
          '0x00',
          provider,
          slotNumber,
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

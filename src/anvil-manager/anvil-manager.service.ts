import { Injectable, Logger } from '@nestjs/common';
import { startAnvil } from '@brinkninja/node-anvil';
import rpcFile from '../config/rpcs.json';
import { JsonRpcProvider } from 'ethers';

let currentSourceChain: any;
let anvilInstance: any;
let provider: any;

@Injectable()
export class AnvilManagerService {
  constructor() {}
  private readonly logger = new Logger(AnvilManagerService.name);
  async manage(sourceChain: string): Promise<JsonRpcProvider> {
    if (currentSourceChain === sourceChain) {
      this.logger.verbose('Same chain');
      return provider;
    } else {
      this.logger.verbose('Different chain');
      currentSourceChain = sourceChain;
      if (anvilInstance) {
        this.logger.log('stopping anvil');
        await this.stopAnvil();
      }

      this.logger.log(`starting anvil for chain: ${currentSourceChain}`);
      anvilInstance = await this.startAnvil(currentSourceChain);
      provider = await this.getProvider();
      return provider;
    }
  }
  async stopAnvil(): Promise<void> {
    try {
      await anvilInstance.kill();
      this.logger.verbose('Anvil process stopped.');
    } catch (killError) {
      this.logger.error('Error stopping Anvil:', killError);
    }
  }

  async startAnvil(sourceChainId: string): Promise<any> {
    const rpcsForChain: any = rpcFile.find(
      (chain) => chain.chainId === sourceChainId,
    );
    if (!rpcsForChain || !rpcsForChain.rpcs || rpcsForChain.rpcs.length === 0) {
      throw new Error(`No RPC URLs found for chainId ${sourceChainId}`);
    }
    const rpcs = rpcsForChain.rpcs;

 
    let anvilInstance: any;
    for (const rpc of rpcs) {
      try {
        anvilInstance = await startAnvil({
          port: 8545,
          forkUrl: rpc,
          chainId: sourceChainId,
          host: '127.0.0.1',
        });
        this.logger.verbose(
          `Anvil started on port 8545 for chainId ${sourceChainId} using RPC ${rpc}`,
        );
        return anvilInstance;
      } catch (error) {
        this.logger.error('Error starting Anvil:', error);
        continue;
      }
    }
    throw new Error(`Could not start Anvil for chainId ${sourceChainId}`);
  }
  getProvider(): any {
    return new JsonRpcProvider(`http://localhost:8545`);
  }
}

import { Injectable, Logger } from '@nestjs/common';
import { startAnvil } from '@brinkninja/node-anvil';
// import rpcMap from '../config/rpcs.json';
import rpcMap from '../config/rpcs';
import { JsonRpcProvider } from 'ethers';

@Injectable()
export class AnvilManagerService {
  constructor() {}
  private readonly logger = new Logger(AnvilManagerService.name);
  private currentSourceChain: string;
  private anvilInstance: any;
  private provider: JsonRpcProvider;
  async manage(sourceChain: string): Promise<JsonRpcProvider> {
    if (this.currentSourceChain === sourceChain) {
      this.logger.verbose('Same chain');
      return this.provider;
    } else {
      this.logger.verbose('Different chain');
      this.currentSourceChain = sourceChain;
      if (this.anvilInstance) {
        this.logger.log('stopping anvil');
        await this.stopAnvil();
      }

      this.logger.log(`starting anvil for chain: ${this.currentSourceChain}`);
      this.anvilInstance = await this.startAnvil(this.currentSourceChain);
      this.provider = await this.getProvider();
      return this.provider;
    }
  }
  async stopAnvil(): Promise<void> {
    try {
      await this.anvilInstance.kill();
      this.logger.verbose('Anvil process stopped.');
    } catch (killError) {
      this.logger.error('Error stopping Anvil:', killError);
    }
  }

  async startAnvil(sourceChainId: string): Promise<any> {
    const rpcs = rpcMap.get(sourceChainId);
    if (!rpcs || rpcs.length === 0) {
      throw new Error(`No RPC URLs found for chainId ${sourceChainId}`);
    }
    // let anvilInstance: any;
    for (const rpc of rpcs) {
      try {
        this.anvilInstance = await startAnvil({
          port: 8545,
          forkUrl: rpc,
          chainId: sourceChainId,
          host: '127.0.0.1',
        });
        this.logger.verbose(
          `Anvil started on port 8545 for chainId ${sourceChainId} using RPC ${rpc}`,
        );
        return this.anvilInstance;
      } catch (error) {
        this.logger.error('Error starting Anvil:', error);
        continue;
      }
    }
    throw new Error(`Could not start Anvil for chainId ${sourceChainId}`);
  }
  getProvider(): JsonRpcProvider {
    return new JsonRpcProvider(`http://localhost:8545`, undefined, {
      // Disable request batching
      batchMaxCount: 1,
      // Assume network won't change (required for INFURA/Alchemy)
      staticNetwork: true,
      // Reduce batch aggregation time to minimum
      batchStallTime: 0,
      // Set smaller batch size (1kb) to prevent oversized requests
      batchMaxSize: 1024,
      // Disable built-in caching
      cacheTimeout: -1,
    });
  }
  reset(): void {
    this.currentSourceChain = '';
    this.anvilInstance = null;
  }
}

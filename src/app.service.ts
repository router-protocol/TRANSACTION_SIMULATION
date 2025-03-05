import { Injectable, HttpException, Logger } from '@nestjs/common';
import { InternalAxiosRequestConfig, AxiosResponse } from 'axios';
import { HttpService } from '@nestjs/axios';
import { lastValueFrom } from 'rxjs';
import {
  JsonRpcProvider,
  zeroPadBytes,
  hexlify,
  keccak256,
  AbiCoder,
} from 'ethers';
const abiEncoder = AbiCoder.defaultAbiCoder();

@Injectable()
export class AppService {
  constructor(private readonly httpService: HttpService) {
    this.httpService.axiosRef.interceptors.request.use(
      (config: InternalAxiosRequestConfig) => {
        config.headers['request-startTime'] = Date.now();
        config.headers['request-url'] = config.url || 'unknown';
        return config;
      },
    );

    this.httpService.axiosRef.interceptors.response.use(
      (response: AxiosResponse) => {
        const startTime = response.config.headers['request-startTime'];
        const duration = Date.now() - startTime;
        const url = response.config.headers['request-url'];
        this.logger.log(`Response time for ${url}: ${duration}ms`);
        return response;
      },
      (error) => {
        if (error.config?.headers['request-startTime']) {
          const startTime = error.config.headers['request-startTime'];
          const duration = Date.now() - startTime;
          const url = error.config.headers['request-url'] || 'unknown';
          this.logger.error(`Response error for ${url} after ${duration}ms`);
        }
        return Promise.reject(error);
      },
    );
  }
  private readonly logger = new Logger(AppService.name);
  async getQuote(input: any): Promise<any> {
    try {
      const url = 'https://api-beta.pathfinder.routerprotocol.com/api/v2/quote';
      const params = {
        fromTokenAddress: input.sourceToken,
        toTokenAddress: input.destinationToken,
        amount: input.amount,
        fromTokenChainId: input.sourceChain,
        toTokenChainId: input.destinationChain,
        partnerId: `1`,
        slippageTolerance: `1`,
        destFuel: `0`,
      };
      const response = await lastValueFrom(
        this.httpService.get(url, { params }),
      );
      return response.data;
    } catch (error) {
      throw new HttpException(error, 500);
    }
  }
  async getTransaction(quoteData: any, owner: string): Promise<any> {
    try {
      const url =
        'https://api-beta.pathfinder.routerprotocol.com/api/v2/transaction';
      const data = {
        ...quoteData,
        receiverAddress: owner,
        senderAddress: owner,
        metaData: {
          ataAddress: null,
        },
      };
      const options = {
        headers: {
          'Content-Type': 'application/json',
        },
      };

      const response = await lastValueFrom(
        this.httpService.post(url, data, options),
      );
      return response.data;
    } catch (error) {
      this.logger.error(error);
      throw new HttpException(error, 500);
    }
  }

  async overrideApproval(
    tokenAddr: string,
    ownerAddr: string,
    spender: string,
    newAllowance: string,
    provider: JsonRpcProvider,
  ) {
    const allowanceSlot = this.getAllowanceSlot(ownerAddr, spender, 10);
    const formattedAllowance = zeroPadBytes(hexlify(newAllowance), 32);
    await provider.send('anvil_setStorageAt', [
      tokenAddr,
      allowanceSlot,
      formattedAllowance,
    ]);
    this.logger.verbose(`Approval overridden`);
  }

  getAllowanceSlot(ownerAddr: string, spender: string, mappingSlot: number) {
    const ownerHash = keccak256(
      abiEncoder.encode(['address', 'uint256'], [ownerAddr, mappingSlot]),
    );
    return keccak256(
      abiEncoder.encode(['address', 'bytes32'], [spender, ownerHash]),
    );
  }

  async overrideBalance(
    tokenAddr: string,
    userAddr: string,
    newBalance: string,
    provider: JsonRpcProvider,
    slotNumber: number,
  ) {
    const balanceSlot = this.getBalanceSlot(userAddr, slotNumber);
    const formattedBalance = zeroPadBytes(hexlify(newBalance), 32);
    await provider.send('anvil_setStorageAt', [
      tokenAddr,
      balanceSlot,
      formattedBalance,
    ]);
    this.logger.verbose(`Balance overridden`);
  }

  getBalanceSlot(userAddr: string, mappingSlot: number) {
    return keccak256(
      abiEncoder.encode(['address', 'uint256'], [userAddr, mappingSlot]),
    );
  }
}

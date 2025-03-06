import { Injectable, HttpException, Logger } from '@nestjs/common';
import { InternalAxiosRequestConfig, AxiosResponse } from 'axios';
import { HttpService } from '@nestjs/axios';
import { AllowanceService } from './allowance/allowance.service';
import { lastValueFrom } from 'rxjs';
import {
  JsonRpcProvider,
  zeroPadBytes,
  hexlify,
  keccak256,
  AbiCoder,
} from 'ethers';
import { getPathfinderData } from './utils/path';
import { overrideApproval, overrideBalance } from './utils/overrides';
import { getTxnData } from './utils/txnData';
const abiEncoder = AbiCoder.defaultAbiCoder();

@Injectable()
export class AppService {
  constructor(
    private readonly httpService: HttpService,
    private readonly allowanceService: AllowanceService,
  ) {
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

  async getPathfinderData(params: any): Promise<any> {
    return getPathfinderData(params, this.httpService);
  }

  async overrideApprovalAndBalance(
    transactionData,
    provider,
    newValue,
    chainId,
  ) {
    try {
      const tokenAddr: string = transactionData.fromTokenAddress;
      const owner: string = transactionData.txn.from;
      const spender: string = transactionData.allowanceTo;
      // const newAllowance: string =
      //   '0xfffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff1';
      // const newBalance: string =
      //   '0xfffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff1';
      await overrideApproval(
        tokenAddr,
        owner,
        spender,
        newValue,
        provider,
        chainId,
      );
      await this.allowanceService.getAllowance(
        provider,
        tokenAddr,
        owner,
        spender,
      );
      await overrideBalance(tokenAddr, owner, newValue, provider, chainId);
      await this.allowanceService.getBalance(provider, tokenAddr, owner);
    } catch (e) {
      this.logger.error(`error in overrideApprovalAndBalance: ${e}`);
    }
  }
  async simulateTransaction(transactionData: any, provider: JsonRpcProvider): Promise<void> {
    try {
      const txn = await getTxnData(transactionData);
      const result = await provider.call(txn);
      this.logger.log(`Simulation successful. Result: ${result}`);
    } catch (err) {
      this.logger.error(`Error caught in simulation ${err}`);
    }
  }
}

import { Injectable, Logger, Scope } from '@nestjs/common';
import { InternalAxiosRequestConfig, AxiosResponse } from 'axios';
import { HttpService } from '@nestjs/axios';
import { JsonRpcProvider } from 'ethers';
import { getPathfinderData } from './utils/path';
import { overrideApproval, overrideBalance } from './utils/overrides';
import { getTxnData } from './utils/txnData';
import { AnvilManagerService } from './anvil-manager/anvil-manager.service';
import { getAllowance, getBalance } from './utils/allowance';
const fs = require('fs');
const path = require('path');

@Injectable({ scope: Scope.REQUEST })
export class AppService {
  constructor(
    private readonly httpService: HttpService,
    private readonly anvilManager: AnvilManagerService,
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
  public failedCount = 0;
  private currentReportData: any[] = []; // Track steps for the current transaction
  private currentInput: any; // Track input parameters for the current transaction
  private txnNumber: number = 0;
  private reportJson = {};
  private reportFileName: string;

  async manageAnvil(sourceChain: string): Promise<[JsonRpcProvider, string]> {
    try {
      const provider: JsonRpcProvider =
        await this.anvilManager.manage(sourceChain);
      const accounts = await provider.listAccounts();
      const owner: string = accounts[0].address;
      const successMessage = {
        startAnvil: {
          status: 'success',
        },
      };
      this.currentReportData.push(successMessage);
      return [provider, owner];
    } catch (e) {
      this.logger.error(`error in manageAnvil: ${e}`);
      const errorMessage = {
        startAnvil: {
          status: 'error',
          error: e.message,
        },
      };
      this.currentReportData.push(errorMessage);
      throw new Error(e);
    }
  }

  async getPathfinderData(params: any): Promise<any> {
    try {
      this.currentInput = params; // Store input parameters for the current transaction
      const result = await getPathfinderData(params, this.httpService);
      const [quoteResponseTime, txnResponseTime, txnResponse] = result || [];
      const successMessage = {
        getPathfinderData: {
          status: 'success',
          quoteResponseTime,
          txnResponseTime,
        },
      };
      this.currentReportData.push(successMessage);
      // this.logger.warn(quoteResponseTime, txnResponseTime);
      return txnResponse;
    } catch (e) {
      this.logger.error(`error in getPathfinderData: ${e.message}`);
      const errorMessage = {
        getPathfinderData: {
          status: 'error',
          error: e.message,
        },
      };
      this.currentReportData.push(errorMessage);
      throw new Error(e);
    }
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
      await getAllowance(provider, tokenAddr, owner, spender);
      await overrideBalance(tokenAddr, owner, newValue, provider, chainId);
      await getBalance(provider, tokenAddr, owner);
      const successMessage = {
        overrideApprovalAndBalance: {
          status: 'success',
        },
      };
      this.currentReportData.push(successMessage);
    } catch (e) {
      this.logger.error(`error in overrideApprovalAndBalance: ${e}`);
      const errorMessage = {
        overrideApprovalAndBalance: {
          status: 'error',
          error: e.message,
        },
      };
      this.currentReportData.push(errorMessage);
      throw new Error(e);
    }
  }
  async simulateTransaction(
    transactionData: any,
    provider: JsonRpcProvider,
  ): Promise<void> {
    try {
      const txn = await getTxnData(transactionData);
      const result = await provider.call(txn);
      this.logger.log(`Simulation successful. Result: ${result}`);
      const successMessage = {
        simulateTransaction: {
          status: 'success',
        },
      };
      this.currentReportData.push(successMessage);
    } catch (err) {
      this.failedCount++;
      const errorMessage = {
        simulateTransaction: {
          status: 'error',
          error: err.message,
        },
      };
      this.currentReportData.push(errorMessage);
      this.logger.error(`Error caught in simulation ${err}`);
    }
  }
  async stopAnvil(): Promise<void> {
    try {
      await this.anvilManager.stopAnvil();
      this.anvilManager.reset();
    } catch (e) {
      this.logger.error(`error in stopAnvil: ${e}`);
      const errorMessage = {
        stopAnvil: {
          status: 'error',
          error: e.message,
        },
      };
    }
  }

  async initiateReporter(): Promise<void> {
    this.reportFileName = '';
    this.reportJson = {};
    this.txnNumber = 0;
  }

  async writeReport(): Promise<void> {
    const reportDir = path.join(__dirname, '..', 'reports');
    if (!fs.existsSync(reportDir)) {
      fs.mkdirSync(reportDir);
    }

    // Generate filename ONCE (first transaction)
    if (!this.reportFileName) {
      this.reportFileName = `report-${new Date().toISOString()}.json`;
    }

    const reportFilePath = path.join(reportDir, this.reportFileName);

    // Add current transaction data to the report
    this.reportJson[this.txnNumber] = {
      input: this.currentInput,
      output: this.currentReportData,
    };

    // Overwrite the file with ALL transactions
    await fs.writeFileSync(
      reportFilePath,
      JSON.stringify(this.reportJson, null, 2),
    );

    // Reset for the next transaction
    this.currentReportData = [];
    this.currentInput = null;
    this.txnNumber++;
    this.logger.log(`Report updated at ${reportFilePath}`);
  }
  async logReport(){
    
  }
}

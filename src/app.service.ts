import { Injectable, Logger, Scope } from '@nestjs/common';
import { InternalAxiosRequestConfig, AxiosResponse } from 'axios';
import { HttpService } from '@nestjs/axios';
import { JsonRpcProvider } from 'ethers';
import { getPathfinderData } from './utils/path';
import { overrideApproval, overrideBalance } from './utils/overrides';
import { getTxnData } from './utils/txnData';
import { AnvilManagerService } from './anvil-manager/anvil-manager.service';
import { getAllowance, getBalance, getNativeBalance } from './utils/allowance';
import { isNative } from './config/chainType';
import { processCombinations } from './utils/combinations';
import { writeJsonFile } from './utils/fileOps';
import { processReport } from './utils/googleReport/googleReport';
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
  public errorTokenAddrs: any[] = [];

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
    chainId,
  ): Promise<boolean> {
    try {
      // if token is native skip approval @akshay. Use isNative() method

      const tokenAddr: string = transactionData.fromTokenAddress;
      const owner: string = transactionData.txn.from;
      const spender: string = transactionData.allowanceTo;
      if (isNative(transactionData.source.chainId, tokenAddr)) {
        await getNativeBalance(provider, tokenAddr, owner);
        return true;
      }
      await overrideApproval(tokenAddr, owner, spender, provider, chainId);
      const allowanceAmount = await getAllowance(
        provider,
        tokenAddr,
        owner,
        spender,
      );
      await overrideBalance(tokenAddr, owner, provider, chainId);
      const balanceAmount = await getBalance(provider, tokenAddr, owner);
      const successMessage = {
        overrideApprovalAndBalance: {
          status: 'success',
        },
      };
      this.currentReportData.push(successMessage);
      if (allowanceAmount !== '0' && balanceAmount !== '0') {
        return true;
      } else {
        return false;
      }
    } catch (e) {
      this.logger.error(`error in overrideApprovalAndBalance: ${e}`);
      if (
        e.error &&
        e.error.message &&
        e.error.message.includes('HTTP error 429') &&
        e.error.message.includes('error code: 1015')
      ) {
        this.logger.warn(e.payload.params[0]);
        this.errorTokenAddrs.push({
          tokenAddr: transactionData.fromTokenAddress,
          chainId: transactionData.source.chainId,
        });
      }
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
    } catch (e) {
      this.failedCount++;
      const errorMessage = {
        simulateTransaction: {
          status: 'error',
          error: e.message,
        },
      };
      this.currentReportData.push(errorMessage);
      this.logger.error(`Error caught in simulation ${e}`);
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
  async writeJson(jsonData) {
    const reportDir = path.join(__dirname, '..', 'src', 'config');
    if (!fs.existsSync(reportDir)) {
      fs.mkdirSync(reportDir);
    }

    // Generate filename ONCE (first transaction)
    let jsonFileName = `reservedTokens.json`;

    const jsonFilePath = path.join(reportDir, jsonFileName);

    // Add current transaction data to the report
    // this.reportJson[this.txnNumber] = {
    //   input: this.currentInput,
    //   output: this.currentReportData,
    // };

    // Overwrite the file with ALL transactions
    await fs.writeFileSync(jsonFilePath, JSON.stringify(jsonData, null, 2));

    // Reset for the next transaction
    // this.currentReportData = [];
    // this.currentInput = null;
    // this.txnNumber++;
    this.logger.log(`JSON saved at ${jsonFilePath}`);
  }
  async generateTokens() {
    const jsonPath = path.join(
      __dirname,
      '..',
      'src/config/customCombinations.json',
    );
    await writeJsonFile(jsonPath, await processCombinations());
  }
  async googleReport() {
    const reportDir = path.join(__dirname, '..', 'reports');
    if (!fs.existsSync(reportDir)) {
      fs.mkdirSync(reportDir);
    }
    const reportFilePath = path.join(reportDir, this.reportFileName);

    await processReport(reportFilePath);
  }
}

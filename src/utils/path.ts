import { Logger } from '@nestjs/common';
import { lastValueFrom } from 'rxjs';
import * as dotenv from 'dotenv';
dotenv.config();

const logger = new Logger('pathUtils');

export async function getPathfinderData(
  requestParams: any,
  httpService: any,
  retryCount = 3,
) {
  try {
    const params = {
      fromTokenAddress: requestParams.sourceToken,
      toTokenAddress: requestParams.destinationToken,
      amount: requestParams.amount,
      fromTokenChainId: requestParams.sourceChain,
      toTokenChainId: requestParams.destinationChain,
      partnerId: `1`,
      slippageTolerance: `1`,
    };

    const quoteResponse: any = await lastValueFrom(
      httpService.get(`${process.env.BASE_URL}/v2/quote`, { params }),
    );
    const quoteData = quoteResponse?.data;

    if (quoteData == null) {
      throw new Error('quote not found');
    }
    const quoteStartTime = quoteResponse.config.headers['request-startTime'];
    const quoteDuration = Date.now() - quoteStartTime;

    const requestBody = {
      ...quoteData,
      receiverAddress: requestParams.owner,
      senderAddress: requestParams.owner,
      metaData: {
        ataAddress: null,
      },
    };
    const options = {
      headers: {
        'Content-Type': 'application/json',
      },
    };

    const txResponse: any = await lastValueFrom(
      httpService.post(
        `${process.env.BASE_URL}/v2/transaction`,
        requestBody,
        options,
      ),
    );

    if (txResponse?.data == null) {
      throw new Error('error in building tx');
    }

    const txnStartTime = txResponse.config.headers['request-startTime'];
    const txnDuration = Date.now() - txnStartTime;

    return [quoteDuration, txnDuration, txResponse?.data];
  } catch (error) {
    if (
      error instanceof Error &&
      error.message.includes('Request failed with status code 429')
    ) {
      logger.warn(
        `Retrying getPathfinderData. Retries left: ${retryCount - 1}`,
      );
      await new Promise((resolve) => setTimeout(resolve, 20000));
      return getPathfinderData(requestParams, httpService, retryCount - 1);
    }
    logger.warn(`the error is ${error}`);
    throw new Error(error);
  }
}

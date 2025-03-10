import { HttpException, Logger } from '@nestjs/common';
import { lastValueFrom } from 'rxjs';
import * as dotenv from 'dotenv';
dotenv.config();
const logger = new Logger('pathUtils');

export async function getPathfinderData(requestParams: any, httpService: any) {
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
    // throw new HttpException(
    //   `${error.response.request._header}, ${JSON.stringify(error.response.data)}`,
    //   error.status || 500,
    // );
    logger.error(
      `${error.response.request._header}, ${JSON.stringify(error.response.data)}, ${error.status}`,
    );
  }
}

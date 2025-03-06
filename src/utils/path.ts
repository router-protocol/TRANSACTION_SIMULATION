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

    return txResponse?.data;
  } catch (error) {
    throw new HttpException(error, 500);
  }
}

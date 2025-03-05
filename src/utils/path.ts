import { HttpException } from "@nestjs/common";
import axios from "axios";
import { lastValueFrom } from "rxjs";


export async function getPathfinderData(params: any, httpService: any) {
    try {

        // get quote
        const requestParams = {
            fromTokenAddress: params.sourceToken,
            toTokenAddress: params.destinationToken,
            amount: params.amount,
            fromTokenChainId: params.sourceChain,
            toTokenChainId: params.destinationChain,
            partnerId: `1`,
            slippageTolerance: `1`
        };

        // TODO: @akshay get from .env
        const baseUrl = 'https://api-beta.pathfinder.routerprotocol.com/api';
        const quoteResponse: any = await lastValueFrom(
            httpService.get(`${baseUrl}/v2/quote`, { requestParams }),
        );
        const quoteData = quoteResponse?.data;

        if (quoteData == null) {
            throw new Error('quote not found');
        }

        // build transaction
        const requestBody = {
            ...quoteData,
            receiverAddress: params.owner,
            senderAddress: params.owner,
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
            httpService.post(`${baseUrl}/v2/transaction`, requestBody, options),
        );

        if (txResponse?.data == null) {
            throw new Error('error in building tx');
        }

        return txResponse?.data;
    } catch (error) {
        throw new HttpException(error, 500);
    }
}
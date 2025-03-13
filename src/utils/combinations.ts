// const { readJsonFile } = require("./fileOps");
import { isSourceDestChainAllowed } from './destChains';
import { readJsonFile } from './fileOps';
import * as dotenv from 'dotenv';
const path = require('path');

async function generateCombinations(tokenData, amountData) {
  const mappedAmounts = new Map();

  amountData.forEach(({ symbol, amount }) => {
    Object.entries(amount).forEach(([key, value]) => {
      mappedAmounts.set(`${symbol}$${key}`, value);
    });
  });

  const combinations: any[] = [];
  const allowedSource = process.env.SUPPORTED_CHAINS?.split(',');

  for (let i = 0; i < tokenData.length; i++) {
    const source = tokenData[i];
    for (let j = i + 1; j < tokenData.length; j++) {
      const destination = tokenData[j];

      if (source.chainId === destination.chainId) continue;
      if (isSourceDestChainAllowed(source.chainId, destination.chainId)) {
        const firstAmount =
          mappedAmounts.get(`${source.symbol}$${source.chainId}`) ||
          mappedAmounts.get(`${source.symbol}$others`) ||
          1;
        const firstCalculatedAmount = (
          firstAmount * Math.pow(10, source.decimals)
        ).toFixed(0);

        combinations.push({
          sourceChain: source.chainId,
          destinationChain: destination.chainId,
          sourceToken: source.address,
          destinationToken: destination.address,
          amount: firstCalculatedAmount,
        });
      }

      if (isSourceDestChainAllowed(destination.chainId, source.chainId)) {
        const secondAmount =
          mappedAmounts.get(`${destination.symbol}$${destination.chainId}`) ||
          mappedAmounts.get(`${destination.symbol}$others`) ||
          1;
        const secondCalculatedAmount = (
          secondAmount * Math.pow(10, destination.decimals)
        ).toFixed(0);

        combinations.push({
          sourceChain: destination.chainId,
          destinationChain: source.chainId,
          sourceToken: destination.address,
          destinationToken: source.address,
          amount: secondCalculatedAmount,
        });
      }
    }
  }

  return combinations;
}

export async function processCombinations() {
  const tokenFilePath = path.join(
    __dirname,
    `..`,
    `..`,
    `src/config/reservedTokens.json`,
  );
  const amountFilePath = path.join(
    __dirname,
    `..`,
    `..`,
    `src/config/amounts.json`,
  );

  try {
    const tokenData = await readJsonFile(
      tokenFilePath,
      `Run "cypress/support/utils/fetchChains.js" to generate the tokens for.`,
    );
    const amountData = await readJsonFile(
      amountFilePath,
      `Ensure amounts.json exists for.`,
    );
    if (tokenData.length === 0 || amountData.length === 0) {
      return [];
    }
    return generateCombinations(tokenData, amountData);
  } catch (error) {
    console.error(
      `An error occurred during combination processing for:`,
      error.message,
    );
    return [];
  }
}

// module.exports = { processCombinations };

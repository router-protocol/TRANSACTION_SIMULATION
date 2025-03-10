import { Logger } from '@nestjs/common';
import {
  JsonRpcProvider,
  zeroPadBytes,
  hexlify,
  keccak256,
  AbiCoder,
} from 'ethers';
import { ALLOWANCE_MAP } from 'src/config/constants/allowanceSlotNumber.constant';
import { BALANCE_MAP } from 'src/config/constants/balanceSlotNumber.constant';

const abiEncoder = AbiCoder.defaultAbiCoder();
const logger = new Logger('overrideUtils');

export async function overrideApproval(
  tokenAddr: string,
  ownerAddr: string,
  spender: string,
  newAllowance: string,
  provider: JsonRpcProvider,
  chainId: string,
  retryCount: number = 3,
) {
  try {
    const slotNumber = getAllowanceSlotNumber(chainId, tokenAddr);
    if (slotNumber === undefined) {
      throw new Error(
        `Slot number for allowance is undefined for chainId: ${chainId} and tokenAddr: ${tokenAddr}`,
      );
    }
    logger.verbose(`Slot number for allowance: ${slotNumber}`);
    const allowanceSlot = getAllowanceSlot(ownerAddr, spender, slotNumber);
    const formattedAllowance = zeroPadBytes(
      hexlify(
        newAllowance === 'maxOverrideValue'
          ? '0xfffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff1'
          : newAllowance === 'resetOverrideValue'
            ? '0x00'
            : '0x00',
      ),
      32,
    );
    await provider.send('anvil_setStorageAt', [
      tokenAddr,
      allowanceSlot,
      formattedAllowance,
    ]);
    logger.verbose(`Approval overridden`);
  } catch (e) {
    logger.error(`error in overrideApproval: ${e.message}`);
    // Check if the error message indicates a rate limit / timeout error
    if (
      retryCount > 0 &&
      e.error &&
      e.error.message &&
      e.error.message.includes('HTTP error 429') &&
      e.error.message.includes('error code: 1015')
    ) {
      // Wait 5 seconds and retry
      logger.warn(`Retrying overrideApproval. Retries left: ${retryCount - 1}`);
      await new Promise((resolve) => setTimeout(resolve, 5000));
      return overrideApproval(
        tokenAddr,
        ownerAddr,
        spender,
        newAllowance,
        provider,
        chainId,
        retryCount - 1,
      );
    }
    throw e;
  }
}

function getAllowanceSlotNumber(
  chainId: string,
  tokenAddr: string,
): number | undefined {
  try {
    const slotNumber = ALLOWANCE_MAP.get(`${chainId}-${tokenAddr}`);
    if (slotNumber) return slotNumber;
    return 1;
  } catch (e) {
    logger.error(`error in getAllowanceSlotNumber: ${e}`);
  }
}

function getAllowanceSlot(
  ownerAddr: string,
  spender: string,
  mappingSlot: number,
): string {
  try {
    const ownerHash = keccak256(
      abiEncoder.encode(['address', 'uint256'], [ownerAddr, mappingSlot]),
    );
    return keccak256(
      abiEncoder.encode(['address', 'bytes32'], [spender, ownerHash]),
    );
  } catch (e) {
    logger.error(`error in getAllowanceSlot: ${e}`);
    throw new Error(e);
  }
}

export async function overrideBalance(
  tokenAddr: string,
  userAddr: string,
  newBalance: string,
  provider: JsonRpcProvider,
  chainId: string,
  retryCount: number = 3,
) {
  try {
    const slotNumber = getBalanceSlotNumber(chainId, tokenAddr);
    if (slotNumber === undefined) {
      throw new Error(
        `Slot number for balance is undefined for chainId: ${chainId} and tokenAddr: ${tokenAddr}`,
      );
    }
    logger.verbose(`Slot number for balance: ${slotNumber}`);
    const balanceSlot = getBalanceSlot(userAddr, slotNumber);
    const formattedBalance = zeroPadBytes(
      hexlify(
        newBalance === 'maxOverrideValue'
          ? '0xfffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff1'
          : newBalance === 'resetOverrideValue'
            ? '0x00'
            : '0x00',
      ),
      32,
    );
    await provider.send('anvil_setStorageAt', [
      tokenAddr,
      balanceSlot,
      formattedBalance,
    ]);
    logger.verbose(`Balance overridden`);
  } catch (e) {
    logger.error(`error in overrideBalance: ${e.message}`);
    // Check if the error message indicates a rate limit / timeout error
    if (
      retryCount > 0 &&
      e.error &&
      e.error.message &&
      e.error.message.includes('HTTP error 429') &&
      e.error.message.includes('error code: 1015')
    ) {
      // Wait 5 seconds and retry
      logger.warn(`Retrying overrideApproval. Retries left: ${retryCount - 1}`);
      await new Promise((resolve) => setTimeout(resolve, 5000));
      return overrideBalance(
        tokenAddr,
        userAddr,
        newBalance,
        provider,
        chainId,
        retryCount - 1,
      );
    }
    throw e;
  }
}

function getBalanceSlotNumber(
  chainId: string,
  tokenAddr: string,
): number | undefined {
  try {
    const slotNumber = BALANCE_MAP.get(`${chainId}-${tokenAddr}`);
    if (slotNumber) return slotNumber;
    return 0;
  } catch (e) {
    logger.error(`error in getBalanceSlotNumber: ${e}`);
  }
}

function getBalanceSlot(userAddr: string, mappingSlot: number): string {
  try {
    return keccak256(
      abiEncoder.encode(['address', 'uint256'], [userAddr, mappingSlot]),
    );
  } catch (e) {
    logger.error(`error in getBalanceSlot: ${e}`);
    throw new Error(e);
  }
}

// overrideApproval(chainid) {

//     const slotNumber =  approvalSlotNumberMap(chainid);
//     //LOGIC - slotNumber
// }

// overrideBalance(chainid) {
//     const slotNumber =  getBalanceSlotNumber(chainid)
//     //LOGIC - slotNumber

// }

// getapprovalSlotNumber(chainid) {
//     const slotNumber =  approvalSlotNumberMap[chainid];

//     if (slotNumber) return slotNumber;

//     return  0;
// }

// getBalanceSlotNumber(chainid) {
//     const slotNumber =  balanceSlotNumberMap[chainid];

//     if (slotNumber) return slotNumber;

//     return  1;
// }

// approvalSlotNumberMap = {
//     `0xfff-1`: 10

// }

// balanceSlotNumberMap = {
//     `0xfff-1`: 9
// }

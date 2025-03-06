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
    const formattedAllowance = zeroPadBytes(hexlify(newAllowance), 32);
    await provider.send('anvil_setStorageAt', [
      tokenAddr,
      allowanceSlot,
      formattedAllowance,
    ]);
    logger.verbose(`Approval overridden`);
  } catch (e) {
    logger.error(`error in overrideApproval: ${e}`);
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
    throw e;
  }
}

export async function overrideBalance(
  tokenAddr: string,
  userAddr: string,
  newBalance: string,
  provider: JsonRpcProvider,
  chainId: string,
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
    const formattedBalance = zeroPadBytes(hexlify(newBalance), 32);
    await provider.send('anvil_setStorageAt', [
      tokenAddr,
      balanceSlot,
      formattedBalance,
    ]);
    logger.verbose(`Balance overridden`);
  } catch (e) {
    logger.error(`error in overrideBalance: ${e}`);
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
    throw e;
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

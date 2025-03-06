export function getTxnData(transactionData: any): any {
  return {
    from: transactionData.txn.from,
    to: transactionData.txn.to,
    data: transactionData.txn.data,
  };
}

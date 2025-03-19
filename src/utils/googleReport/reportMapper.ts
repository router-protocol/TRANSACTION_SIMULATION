export function mapReportDataToSheet(data: any): any[] {
  return Object.values(data).map((entry: any) => {
    const input = entry.input;
    const output = entry.output;

    // Extract status information
    const status = {
      startAnvil: output.find((o: any) => o.startAnvil)?.startAnvil.status,
      pathfinder: output.find((o: any) => o.getPathfinderData)
        ?.getPathfinderData.status,
      simulation: output.find((o: any) => o.simulateTransaction)
        ?.simulateTransaction.status,
      override: output.find((o: any) => o.overrideApprovalAndBalance)
        ?.overrideApprovalAndBalance?.status,
    };

    // Extract error information
    const error = output
      .map(
        (o: any) => o.simulateTransaction?.error || o.getPathfinderData?.error,
      )
      .find((e) => e);

    return [
      new Date().toISOString(), // Timestamp
      input.sourceChain,
      input.destinationChain,
      input.sourceToken,
      input.destinationToken,
      input.amount,
      getOverallStatus(status),
      status.pathfinder === 'success'
        ? output.find((o: any) => o.getPathfinderData)?.getPathfinderData
            .quoteResponseTime
        : '',
      status.pathfinder === 'success'
        ? output.find((o: any) => o.getPathfinderData)?.getPathfinderData
            .txnResponseTime
        : '',
      status.pathfinder === 'success'
        ? output.find((o: any) => o.getPathfinderData)?.getPathfinderData
            .numberOfSwaps
        : '',
      error?.reason || '',
      error?.code || '',
      JSON.stringify(error || ''),
    ];
  });
}

function getOverallStatus(status: any): string {
  if (status.simulation === 'error') return 'Simulation Failed';
  if (status.pathfinder === 'error') return 'Pathfinder Error';
  if (status.startAnvil === 'error') return 'Anvil Error';
  return 'Success';
}

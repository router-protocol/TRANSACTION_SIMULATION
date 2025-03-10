const ChainType = {
    EVM: "evm",
    NEAR: "near",
    SOLANA: "solana",
    ROUTER: "router",
    COSMOS: "cosmos",
    COSMOS_WO_SC: "cosmos_wo_sc",
    TRON: "tron",
    SUBSTRATE: "substrate",
    BITCOIN: "bitcoin",
    SUI: "sui"
  };
  
  // TODO: @akshay add any non evm chain map
  const chainTypeMap = new Map<string, string>([
    ['near', ChainType.NEAR],
    ['solana', ChainType.SOLANA],
    ['router_9600-1', ChainType.ROUTER],
    ['osmosis-1', ChainType.COSMOS],
    ['self-1', ChainType.COSMOS_WO_SC],
    ['728126428', ChainType.TRON],
    ['aleph-zero', ChainType.SUBSTRATE],
    ['bitcoin', ChainType.BITCOIN],
    ['sui', ChainType.SUI]
  ]);
  
  export function getChainTypeMap(chainId: string): string {
    const chainType = chainTypeMap.get(chainId);

    // ie. null or undefined
    if(chainType == null) {
        return ChainType.EVM;
    }

    return chainType;
  }

  export function isNative(chainId: string, token: string): boolean {
    if(chainId === ChainType.EVM && token === '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee') {
        return true;
    }
    
    return false;
  }
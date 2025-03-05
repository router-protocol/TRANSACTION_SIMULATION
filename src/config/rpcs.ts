// TODO: @akshay use this instead of rpcs.json

const chainIdRpcsMap: Map<string, string[]> = new Map([
    ["728126428", ["https://api.trongrid.io"]],
    ["42161", [
      "https://arbitrum.blockpi.network/v1/rpc/public",
      "https://arbitrum-one.publicnode.com",
      "https://arbitrum.llamarpc.com",
      "https://arbitrum.meowrpc.com"
    ]],
    ["56", [
      "https://bsc-pokt.nodies.app",
      "https://rpc.ankr.com/bsc",
      "https://bsc.meowrpc.com",
      "https://binance.llamarpc.com",
      "https://bsc.publicnode.com"
    ]],
    ["10", [
      "https://optimism.llamarpc.com",
      "https://optimism.publicnode.com",
      "https://rpc.ankr.com/optimism"
    ]],
    ["59144", [
      "https://1rpc.io/linea",
      "https://linea.drpc.org"
    ]],
    ["534352", [
      "https://rpc.scroll.io",
      "https://scroll-mainnet.public.blastapi.io"
    ]],
    ["8453", [
      "https://1rpc.io/base",
      "https://base.meowrpc.com",
      "https://base.llamarpc.com",
      "https://mainnet.base.org"
    ]],
    ["137", [
      "https://rpc.ankr.com/polygon",
      "https://polygon.meowrpc.com",
      "https://polygon-bor.publicnode.com",
      "https://rpc-mainnet.maticvigil.com"
    ]],
    ["43114", [
      "https://avalanche.drpc.org",
      "https://avalanche.public-rpc.com"
    ]],
    ["324", [
      "https://rpc.ankr.com/zksync_era",
      "https://mainnet.era.zksync.io"
    ]],
    ["5", [
      "https://rpc.ankr.com/eth_goerli",
      "https://ethereum-goerli.publicnode.com"
    ]],
    ["11155111", [
      "https://rpc.sepolia.org",
      "https://rpc2.sepolia.org",
      "https://rpc-sepolia.rockx.com",
      "https://rpc.sepolia.ethpandaops.io",
      "https://sepolia.infura.io/v3/",
      "https://1rpc.io/sepolia",
      "https://eth-sepolia.public.blastapi.io"
    ]],
    ["1", [
      "https://eth.llamarpc.com",
      "https://eth-pokt.nodies.app",
      "https://rpc.ankr.com/eth",
      "https://eth.meowrpc.com"
    ]],
    ["1101", [
      "https://1rpc.io/polygon/zkevm",
      "https://polygon-zkevm.drpc.org",
      "https://polygon-zkevm-mainnet.public.blastapi.io"
    ]],
    ["5000", [
      "https://rpc.ankr.com/mantle",
      "https://rpc.mantle.xyz"
    ]],
    ["169", [
      "https://manta-pacific-gascap.calderachain.xyz/http",
      "https://1rpc.io/manta",
      "https://pacific-rpc.manta.network/http"
    ]],
    ["1088", [
      "https://metis-pokt.nodies.app",
      "https://metis.drpc.org",
      "https://andromeda.metis.io/?owner=1088",
      "https://metis-mainnet.public.blastapi.io"
    ]],
    ["17000", [
      "https://ethereum-holesky.publicnode.com",
      "https://1rpc.io/holesky",
      "https://ethereum-holesky.blockpi.network/v1/rpc/public",
      "https://rpc.holesky.ethpandaops.io"
    ]],
    ["288", [
      "https://mainnet.boba.network",
      "https://boba-ethereum.gateway.tenderly.co",
      "https://replica.boba.network"
    ]],
    ["2000", [
      "https://rpc.dogechain.dog"
    ]],
    ["995", [
      "https://rpc.5ire.network"
    ]],
    ["80002", [
      "https://rpc.ankr.com/polygon_amoy",
      "https://polygon-amoy.drpc.org",
      "https://rpc-amoy.polygon.technology"
    ]],
  ]);
  
  export default chainIdRpcsMap;
  
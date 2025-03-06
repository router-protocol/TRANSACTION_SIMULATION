// src/constants/rpc-map.ts
// import { RpcEntry } from '../interfaces/rpc-entry.interface';

// Your JSON data
const rpcData = [
  {
    "chainId": "728126428",
    "rpcs": [
      "https://api.trongrid.io"
    ]
  },
  {
    "chainId": "42161",
    "rpcs": [
      "https://arbitrum.blockpi.network/v1/rpc/public",
      "https://arbitrum-one.publicnode.com",
      "https://arbitrum.llamarpc.com",
      "https://arbitrum.meowrpc.com"
    ]
  },
  {
    "chainId": "56",
    "rpcs": [
      "https://bsc-pokt.nodies.app",
      "https://rpc.ankr.com/bsc",
      "https://bsc.meowrpc.com",
      "https://binance.llamarpc.com",
      "https://bsc.publicnode.com"
    ]
  },
  {
    "chainId": "10",
    "rpcs": [
      "https://optimism.llamarpc.com",
      "https://optimism.publicnode.com",
      "https://rpc.ankr.com/optimism"
    ]
  },
  {
    "chainId": "59144",
    "rpcs": [
      "https://1rpc.io/linea",
      "https://linea.drpc.org"
    ]
  },
  {
    "chainId": "534352",
    "rpcs": [
      "https://rpc.scroll.io",
      "https://scroll-mainnet.public.blastapi.io"
    ]
  },
  {
    "chainId": "8453",
    "rpcs": [
      "https://1rpc.io/base",
      "https://base.meowrpc.com",
      "https://base.llamarpc.com",
      "https://mainnet.base.org"
    ]
  },
  {
    "chainId": "137",
    "rpcs": [
      "https://rpc.ankr.com/polygon",
      "https://polygon.meowrpc.com",
      "https://polygon-bor.publicnode.com",
      "https://rpc-mainnet.maticvigil.com"
    ]
  },
  {
    "chainId": "43114",
    "rpcs": [
      "https://avalanche.drpc.org",
      "https://avalanche.public-rpc.com"
    ]
  },
  {
    "chainId": "324",
    "rpcs": [
      "https://rpc.ankr.com/zksync_era",
      "https://mainnet.era.zksync.io"
    ]
  },
  {
    "chainId": "5",
    "rpcs": [
      "https://rpc.ankr.com/eth_goerli",
      "https://ethereum-goerli.publicnode.com"
    ]
  },
  {
    "chainId": "11155111",
    "rpcs": [
      "https://rpc.sepolia.org",
      "https://rpc2.sepolia.org",
      "https://rpc-sepolia.rockx.com",
      "https://rpc.sepolia.ethpandaops.io",
      "https://sepolia.infura.io/v3/",
      "https://1rpc.io/sepolia",
      "https://eth-sepolia.public.blastapi.io"
    ]
  },
  {
    "chainId": "421614",
    "rpcs": [
      "https://public.stackup.sh/api/v1/node/arbitrum-sepolia",
      "https://sepolia-rollup.arbitrum.io/rpc",
      "https://arbitrum-sepolia.blockpi.network/v1/rpc/public"
    ]
  },
  {
    "chainId": "534351",
    "rpcs": [
      "https://scroll-public.scroll-testnet.quiknode.pro",
      "https://rpc.ankr.com/scroll_sepolia_testnet",
      "https://scroll-sepolia.chainstacklabs.com",
      "https://scroll-sepolia.blockpi.network/v1/rpc/public",
      "https://sepolia-rpc.scroll.io",
      "https://scroll-testnet-public.unifra.io"
    ]
  },
  {
    "chainId": "80085",
    "rpcs": [
      "https://rpc.ankr.com/berachain_testnet",
      "https://artio.rpc.berachain.com"
    ]
  },
  {
    "chainId": "1",
    "rpcs": [
      "https://eth.llamarpc.com",
      "https://eth-pokt.nodies.app",
      "https://rpc.ankr.com/eth",
      "https://eth.meowrpc.com"
    ]
  },
  {
    "chainId": "30",
    "rpcs": [
      "https://mycrypto.rsk.co",
      "https://rsk.getblock.io"
    ]
  },
  {
    "chainId": "80001",
    "rpcs": [
      "https://rpc.ankr.com/polygon_mumbai",
      "https://polygon-mumbai.blockpi.network/v1/rpc/public",
      "https://polygon-testnet.public.blastapi.io",
      "https://polygon-mumbai.g.alchemy.com/v2/demo",
      "https://polygon-mumbai.gateway.tenderly.co",
      "https://polygon-mumbai.api.onfinality.io/public"
    ]
  },
  {
    "chainId": "43113",
    "rpcs": [
      "https://rpc.ankr.com/avalanche_fuji",
      "https://avalanche-fuji-c-chain.publicnode.com",
      "https://ava-testnet.public.blastapi.io/ext/bc/C/rpc",
      "https://endpoints.omniatech.io/v1/avax/fuji/public",
      "https://api.avax-test.network/ext/bc/C/rpc"
    ]
  },
  {
    "chainId": "59901",
    "rpcs": [
      "https://sepolia.rpc.metisdevops.link/"
    ]
  },
  {
    "chainId": "167008",
    "rpcs": [
      "https://rpc.katla.taiko.xyz"
    ]
  },
  {
    "chainId": "near-testnet",
    "rpcs": [
      "https://rpc.testnet.near.org"
    ]
  },
  {
    "chainId": "near",
    "rpcs": [
      "https://rpc.mainnet.near.org"
    ]
  },
  {
    "chainId": "2494104990",
    "rpcs": [
      "https://api.shasta.trongrid.io"
    ]
  },
  {
    "chainId": "1101",
    "rpcs": [
      "https://1rpc.io/polygon/zkevm",
      "https://polygon-zkevm.drpc.org",
      "https://polygon-zkevm-mainnet.public.blastapi.i"
    ]
  },
  {
    "chainId": "5000",
    "rpcs": [
      "https://rpc.ankr.com/mantle",
      "https://rpc.mantle.xyz"
    ]
  },
  {
    "chainId": "169",
    "rpcs": [
      "https://manta-pacific-gascap.calderachain.xyz/http",
      "https://1rpc.io/manta",
      "https://pacific-rpc.manta.network/http"
    ]
  },
  {
    "chainId": "1088",
    "rpcs": [
      "https://metis-pokt.nodies.app",
      "https://metis.drpc.org",
      "https://andromeda.metis.io/?owner=1088",
      "https://metis-mainnet.public.blastapi.io"
    ]
  },
  {
    "chainId": "osmo-test-5",
    "rpcs": [
      "https://rpc.osmotest5.osmosis.zone"
    ]
  },
  {
    "chainId": "17000",
    "rpcs": [
      "https://ethereum-holesky.publicnode.com",
      "https://1rpc.io/holesky",
      "https://ethereum-holesky.blockpi.network/v1/rpc/public",
      "https://rpc.holesky.ethpandaops.io"
    ]
  },
  {
    "chainId": "1998",
    "rpcs": [
      "https://rpc.testnet.kyotoprotocol.io:8545"
    ]
  },
  {
    "chainId": "168587773",
    "rpcs": [
      "https://sepolia.blast.io"
    ]
  },
  {
    "chainId": "1313161554",
    "rpcs": [
      "https://mainnet.aurora.dev",
      "https://1rpc.io/aurora",
      "https://aurora.drpc.org",
      "https://endpoints.omniatech.io/v1/aurora/mainnet/public"
    ]
  },
  {
    "chainId": "81457",
    "rpcs": [
      "https://blast.blockpi.network/v1/rpc/public",
      "https://rpc.envelop.is/blast",
      "https://rpc.blast.io",
      "https://blast.din.dev/rpc"
    ]
  },
  {
    "chainId": "919",
    "rpcs": [
      "https://sepolia.mode.network",
      "https://mode.drpc.org",
      "https://mainnet.mode.network",
      "https://1rpc.io/mode"
    ]
  },
  {
    "chainId": "28882",
    "rpcs": [
      "https://sepolia.boba.network/"
    ]
  },
  {
    "chainId": "57000",
    "rpcs": [
      "https://rpc-tanenbaum.rollux.com",
      "https://rollux.rpc.tanenbaum.io",
      "https://rpc.ankr.com/rollux_testnet"
    ]
  },
  {
    "chainId": "34443",
    "rpcs": [
      "https://mainnet.mode.network",
      "https://1rpc.io/mode"
    ]
  },
  {
    "chainId": "288",
    "rpcs": [
      "https://mainnet.boba.network",
      "https://boba-ethereum.gateway.tenderly.co",
      "https://replica.boba.network"
    ]
  },
  {
    "chainId": "167000",
    "rpcs": [
      "https://rpc.taiko.xyz"
    ]
  },
  {
    "chainId": "7225878",
    "rpcs": [
      "https://rpc-mainnet.saakuru.network"
    ]
  },
  {
    "chainId": "1997",
    "rpcs": [
      "https://rpc.kyotochain.io"
    ]
  },
  {
    "chainId": "2000",
    "rpcs": [
      "https://rpc.dogechain.dog"
    ]
  },
  {
    "chainId": "196",
    "rpcs": [
      "https://rpc.xlayer.tech"
    ]
  },
  {
    "chainId": "23294",
    "rpcs": [
      "https://1rpc.io/oasis/sapphire",
      "https://sapphire.oasis.io"
    ]
  },
  {
    "chainId": "osmosis-1",
    "rpcs": [
      "https://rpc.osmosis.zone"
    ]
  },
  {
    "chainId": "995",
    "rpcs": [
      "https://rpc.5ire.network"
    ]
  },
  {
    "chainId": "aleph-zero",
    "rpcs": [
      "wss://ws.azero.dev",
      "wss://aleph-zero-rpc.dwellir.com"
    ]
  },
  {
    "chainId": "80002",
    "rpcs": [
      "https://rpc.ankr.com/polygon_amoy",
      "https://polygon-amoy.drpc.org",
      "https://rpc-amoy.polygon.technology",
      "https://polygon-amoy.drpc.org"
    ]
  },
  {
    "chainId": "997",
    "rpcs": [
      "https://rpc.ga.5ire.network"
    ]
  }
];

const rpcMap: Map<string, string[]> = new Map(
  rpcData.map(entry => [entry.chainId, entry.rpcs])
);

export default rpcMap;

import { defineChain } from "thirdweb/chains";

export const anvil = defineChain({
  id: 31337,
  name: "Anvil Localhost",
  nativeCurrency: {
    name: "ETH",
    symbol: "ETH",
    decimals: 18,
  },
  rpc: "http://127.0.0.1:8545",
  testnet: true,
});

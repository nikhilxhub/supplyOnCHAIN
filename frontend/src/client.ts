import { createThirdwebClient } from "thirdweb";
import { anvil } from "./chains/anvil";
// import { anvil } from "thirdweb/chains";

export const client = createThirdwebClient({
  clientId: import.meta.env.VITE_THIRDWEB_CLIENT_ID ?? "0759fba034e393bb57c3e5a2a153b66d",
});
// import { sepolia } from "thirdweb/chains";
// export const chain = sepolia;
export const chain = anvil;
import { createContext, useContext } from "react";
import type { ReactNode } from "react";
import { useActiveAccount, useWalletBalance } from "thirdweb/react";
import { client, chain } from "../client";





interface StateContextType {
  address?: string;
  balance?: string;
  symbol?: string;
  contract?: any;

}

const StateContext = createContext<StateContextType>({});

export const StateContextProvider = ({ children }: { children: ReactNode }) => {
  const account = useActiveAccount();
  const { data: balance } = useWalletBalance({
    client,
    chain,
    address: account?.address,
  });

//   const contract = getContract({
//     client,

//     address:"",
//     chain,
//   });

  
 

  return (
    <StateContext.Provider
      value={{
        address: account?.address,
        balance: balance?.displayValue,
        symbol: balance?.symbol,


      }}
    >
      {children}
    </StateContext.Provider>
  );
};

export const useStateContext = () => useContext(StateContext);
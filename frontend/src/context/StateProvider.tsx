import { createContext, useContext, useState } from "react";
import type { ReactNode } from "react";
import { useActiveAccount, useWalletBalance, useSendTransaction } from "thirdweb/react";
import { prepareContractCall } from "thirdweb";
import { client, chain } from "../client";
import { getContract } from "thirdweb";

interface StateContextType {
  address?: string;
  balance?: string;
  symbol?: string;
  contract?: any;
  isTransactionLoading?: boolean;
  // Updated signature to match your Solidity Contract
  createProduct?: (
    name: string, 
    batchId: string, 
    wholesaler: string, 
    retailer: string
  ) => Promise<any>;
}

const StateContext = createContext<StateContextType>({});

export const StateContextProvider = ({ children }: { children: ReactNode }) => {
  const account = useActiveAccount();
  const { data: balance } = useWalletBalance({
    client,
    chain,
    address: account?.address,
  });

  const contract = getContract({
    client,
    address: "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512", // Ensure this matches your deployed address
    chain,
  });

  // Thirdweb Hook for writing to blockchain
  const { mutateAsync: sendTransaction, isPending } = useSendTransaction();

  const createProduct = async (name: string, batchId: string, wholesaler: string, retailer: string) => {
    if (!contract) return;

    try {
      // Prepare the transaction based on your specific Solidity signature
      console.log("Im here....")
      const transaction = prepareContractCall({
        contract,
        method: "function createProduct(string _name, string _batchId, address _wholesaler, address _retailer)",
        params: [name, batchId, wholesaler, retailer],
      });
      console.log("Im here....2")
      
      // Send execution
      const receipt = await sendTransaction(transaction);
      console.log("Im here....3")
      console.log("Transaction Success:", receipt);
      return receipt;
    } catch (error) {
      console.error("Contract Call Failed:", error);
      throw error;
    }
  };

  return (
    <StateContext.Provider
      value={{
        address: account?.address,
        balance: balance?.displayValue,
        symbol: balance?.symbol,
        contract,
        createProduct,
        isTransactionLoading: isPending,
      }}
    >
      {children}
    </StateContext.Provider>
  );
};

export const useStateContext = () => useContext(StateContext);
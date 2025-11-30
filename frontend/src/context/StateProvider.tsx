import { createContext, useContext } from "react";
import type { ReactNode } from "react";
import { useActiveAccount, useSendTransaction } from "thirdweb/react";
import { prepareContractCall, readContract } from "thirdweb";
import { client, chain } from "../client";
import { getContract } from "thirdweb";

interface StateContextType {
  address?: string;
  contract?: any;
  isTransactionLoading?: boolean;
  createProduct?: (name: string, batchId: string, wholesaler: string, retailer: string) => Promise<any>;
  transferProduct?: (productId: number, newOwner: string) => Promise<any>;
  fetchProductDetails?: (productId: number) => Promise<any>;
  fetchProductIdByBatch?: (batchId: string) => Promise<number | null>; // ✅ NEW
}

const StateContext = createContext<StateContextType>({});

export const StateContextProvider = ({ children }: { children: ReactNode }) => {
  const account = useActiveAccount();
  
  // ⚠️ UPDATE THIS ADDRESS AFTER RE-DEPLOYING CONTRACT
  const contract = getContract({
    client,
    address: "0x0165878A594ca255338adfa4d48449f69242Eb8F", 
    chain,
  });

  const { mutateAsync: sendTransaction, isPending } = useSendTransaction();

  // 1. Create Product
  const createProduct = async (name: string, batchId: string, wholesaler: string, retailer: string) => {
    if (!contract) return;
    try {
      const transaction = prepareContractCall({
        contract,
        method: "function createProduct(string _name, string _batchId, address _wholesaler, address _retailer)",
        params: [name, batchId, wholesaler, retailer],
      });
      return await sendTransaction(transaction);
    } catch (error) {
      console.error("Create failed:", error);
      throw error;
    }
  };

  // 2. Transfer Ownership
  const transferProduct = async (productId: number, newOwner: string) => {
    if (!contract) return;
    try {
      const transaction = prepareContractCall({
        contract,
        method: "function transferOwnership(uint256 _id, address _newOwner)",
        params: [BigInt(productId), newOwner],
      });
      return await sendTransaction(transaction);
    } catch (error) {
      console.error("Transfer failed:", error);
      throw error;
    }
  };

  // 3. Read Product Details
  const fetchProductDetails = async (productId: number) => {
    if (!contract) return;
    try {
      const data = await readContract({
        contract,
        method: "function getProduct(uint256 _id) view returns ((uint256 id, string name, string batchId, address manufacturer, address assignedWholesaler, address assignedRetailer, address currentOwner, uint8 status, uint256 timestamp, bool exists))",
        params: [BigInt(productId)],
      });
      return data;
    } catch (error) {
      console.error("Fetch failed:", error);
      return null;
    }
  };

  // 4. ✅ NEW: Get ID from Batch
  const fetchProductIdByBatch = async (batchId: string) => {
    if (!contract) return null;
    try {
      const id = await readContract({
        contract,
        method: "function getProductIdByBatchId(string _batchId) view returns (uint256)",
        params: [batchId],
      });
      // Convert BigInt to number
      return Number(id);
    } catch (error) {
      console.error("Fetch ID by Batch failed:", error);
      return null;
    }
  };

  return (
    <StateContext.Provider
      value={{
        address: account?.address,
        contract,
        createProduct,
        transferProduct,
        fetchProductDetails,
        fetchProductIdByBatch, 
        isTransactionLoading: isPending,
      }}
    >
      {children}
    </StateContext.Provider>
  );
};

export const useStateContext = () => useContext(StateContext);
import { createContext, useContext } from "react";
import type { ReactNode } from "react";
import { useActiveAccount, useSendTransaction } from "thirdweb/react";
import { prepareContractCall, readContract } from "thirdweb";
import { client, chain } from "../client";
import { getContract } from "thirdweb";
import { contractAddr } from "@/utils/config";

interface StateContextType {
  address?: string;
  contract?: any;
  isTransactionLoading?: boolean;
  createProduct?: (name: string, batchId: string, wholesaler: string, retailer: string) => Promise<any>;
  transferProduct?: (productId: number, newOwner: string) => Promise<any>;
  fetchProductDetails?: (productId: number) => Promise<any>;
  fetchProductIdByBatch?: (batchId: string) => Promise<number | null>;
  fetchUserProducts?: (ownerAddress: string) => Promise<any[]>; 
  fetchProductsCreatedBy?: (creatorAddress: string) => Promise<any[]>;
}

const StateContext = createContext<StateContextType>({});
console.log(contractAddr);

export const StateContextProvider = ({ children }: { children: ReactNode }) => {
  const account = useActiveAccount();
  
  const contract = getContract({
    client,
    address:contractAddr, 
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

  // 3. Read Single Product Details
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

  // 4. Get ID from Batch
  const fetchProductIdByBatch = async (batchId: string) => {
    if (!contract) return null;
    try {
      const id = await readContract({
        contract,
        method: "function getProductIdByBatchId(string _batchId) view returns (uint256)",
        params: [batchId],
      });
      return Number(id);
    } catch (error) {
      console.error("Fetch ID by Batch failed:", error);
      return null;
    }
  };

  // 5. ✅ NEW: Fetch All Products for Owner (Real-Time Status)
  const fetchUserProducts = async (ownerAddress: string) => {
    if (!contract) return [];
    try {
      // Step A: Get list of IDs
      const productIds = await readContract({
        contract,
        method: "function getProductsByOwner(address _owner) view returns (uint256[])",
        params: [ownerAddress],
      });

      // Step B: Loop through IDs and fetch details for each
      // We use Promise.all to fetch them in parallel for speed
      const productsData = await Promise.all(
        productIds.map(async (id) => {
          const details = await fetchProductDetails(Number(id));
          return details;
        })
      );

      // Filter out nulls (failed fetches)
      return productsData.filter((p) => p !== null);
    } catch (error) {
      console.error("Fetch User Products Failed:", error);
      return [];
    }
  };
  const fetchProductsCreatedBy = async (creatorAddress: string) => {
    if (!contract) return [];
    try {
      // Call the NEW Solidity function
      const productIds = await readContract({
        contract,
        method: "function getProductsCreatedBy(address _creator) view returns (uint256[])",
        params: [creatorAddress],
      });

      // Fetch details for each ID
      const productsData = await Promise.all(
        productIds.map(async (id) => {
          return await fetchProductDetails(Number(id));
        })
      );

      return productsData.filter((p) => p !== null);
    } catch (error) {
      console.error("Fetch Created Products Failed:", error);
      return [];
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
        fetchUserProducts, 
        isTransactionLoading: isPending,
        fetchProductsCreatedBy,
      }}
    >
      {children}
    </StateContext.Provider>
  );
};

export const useStateContext = () => useContext(StateContext);
import React, { useState } from "react";
import { useStateContext } from "../context/StateProvider";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Loader2,
  QrCode,
  ArrowRight,
  CheckCircle,
  Truck,
  Package,
  Upload,
  Camera,
} from "lucide-react";

import axios from "axios";

// QR libs
import { Scanner, type IDetectedBarcode } from "@yudiel/react-qr-scanner";
import jsQR from "jsqr";
import { backendUrl } from "@/utils/config";

const STATUS_LABELS = ["Created", "In Transit", "In Warehouse", "Delivered"];
const STATUS_COLORS = ["bg-blue-500", "bg-yellow-500", "bg-orange-500", "bg-green-500"];

const ScanSection = () => {
  
const { address, fetchProductDetails, transferProduct, fetchProductIdByBatch } = useStateContext();
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  
  // ✅ FIXED: Added missing state for transaction loading
  const [txLoading, setTxLoading] = useState(false); 
  
  const [consumerAddress, setConsumerAddress] = useState("");
  const [activeTab, setActiveTab] = useState("camera");

  // 1️⃣ Handle decoded QR
const handleQrResult = async (data: string | null) => {
  if (!data || loading || product) return;

  try {
    setLoading(true);

    // 1. Parse JSON
    let parsedData: any;
    try {
      parsedData = JSON.parse(data);
    } catch {
      toast.error("Invalid QR Format");
      return;
    }

    const { transactionHash, id: qrId } = parsedData;

    if (!transactionHash) {
      toast.error("Missing Transaction Hash");
      return;
    }

    toast.info("Fetching Product Data...");

    // 2. Fetch from Database (We get Batch ID here)
    let productFromDb: any = null;
    try {
      const backendRes = await axios.get(
        `${backendUrl}/api/products/transaction/${transactionHash}`
      );
      if (backendRes.data?.success && backendRes.data.product) {
        productFromDb = backendRes.data.product;
      }
    } catch (dbError) {
      console.error("DB Fetch Error", dbError);
    }

    // 3. 🔍 RESOLVE ID: Try QR -> Try DB -> Try Blockchain (using BatchID)
    let resolvedId = qrId ?? productFromDb?.id ?? productFromDb?.productId;

    // ✅ If we still don't have an ID, but we have a Batch ID, ask the Blockchain
    if (!resolvedId && productFromDb?.batchId && fetchProductIdByBatch) {
      console.log("ID missing. Fetching from Blockchain using Batch:", productFromDb.batchId);
      const idFromContract = await fetchProductIdByBatch(productFromDb.batchId);
      // Contract returns 0 if not found
      if (idFromContract && idFromContract > 0) {
        resolvedId = idFromContract;
        console.log("Found ID from Blockchain:", resolvedId);
      }
    }

    // 4. Fetch details from Blockchain using the resolved ID
    let blockchainData: any = null;
    if (resolvedId) {
      try {
        blockchainData = await fetchProductDetails?.(Number(resolvedId));
      } catch (bcError) {
        console.error("Blockchain Fetch Error", bcError);
      }
    }

    // 5. Merge and Set
    if (productFromDb || blockchainData) {
      const mergedProduct = {
        ...productFromDb,
        ...blockchainData,
        id: resolvedId, // This is crucial for Transfer
        name: blockchainData?.name || productFromDb?.name || "Unknown",
        status: blockchainData?.status !== undefined ? Number(blockchainData.status) : productFromDb?.status ?? 0,
        currentOwner: blockchainData?.currentOwner || productFromDb?.currentOwner,
      };

      if(!mergedProduct.id) {
         toast.error("Warning: Product ID could not be resolved. Transfer will fail.");
      }

      setProduct(mergedProduct);
      toast.success("Product Found!");
    } else {
      toast.error("Product not found.");
    }
  } catch (err) {
    console.error(err);
    toast.error("Error processing QR");
  } finally {
    setLoading(false);
  }
};

  // 2️⃣ Handle Image Upload
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setLoading(true);

    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.drawImage(img, 0, 0);
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const code = jsQR(imageData.data, imageData.width, imageData.height);

          if (code) {
            handleQrResult(code.data);
          } else {
            toast.error("No QR code found in image");
            setLoading(false);
          }
        }
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  // 3️⃣ Transfer Logic
const handleTransfer = async () => {
    console.log("--- TRANSFER STARTED ---");
    
    // 1. Check if Context is loaded
    console.log("1. Checking Context:", { address, transferProduct });
    
    if (!address) {
      toast.error("Wallet not connected! (Address is missing)");
      return;
    }

    if (!transferProduct) {
      toast.error("Error: transferProduct function is missing from Context!");
      console.error("Check StateProvider.tsx. Is transferProduct exported in the value object?");
      return;
    }

    // 2. Check Product Data
    console.log("2. Checking Product:", product);
    if (!product || !product.id) {
      toast.error("Cannot transfer: Missing Product or ID.");
      return;
    }

    // 3. Check Ownership (Strict Check)
    console.log(`3. Ownership Check: '${address}' vs '${product.currentOwner}'`);
    if (address !== product.currentOwner) {
      // NOTE: If these look the same in console but this triggers, 
      // it is a Case Sensitivity issue (e.g. 0xAbc vs 0xabc).
      toast.error("You are not the current owner (Address Mismatch).");
      return;
    }

    let targetAddress = "";

    // 4. Determine Target
    console.log("4. Determining Role...");
    console.log("Manufacturer:", product.manufacturer);
    console.log("Wholesaler:", product.assignedWholesaler || product.wholesaler);
    console.log("Retailer:", product.assignedRetailer || product.retailer);

    // Manufacturer -> Wholesaler
    if (address === product.manufacturer) {
      console.log("Role: Manufacturer detected");
      targetAddress = product.assignedWholesaler || product.wholesaler;
    }
    // Wholesaler -> Retailer
    else if (address === (product.assignedWholesaler || product.wholesaler)) {
      console.log("Role: Wholesaler detected");
      targetAddress = product.assignedRetailer || product.retailer;
    }
    // Retailer -> Consumer
    else if (address === (product.assignedRetailer || product.retailer)) {
      console.log("Role: Retailer detected");
      if (!consumerAddress) {
        toast.error("Please enter the Consumer's wallet address");
        return;
      }
      targetAddress = consumerAddress;
    } else {
      console.log("Role: NONE MATCHED. Check logic.");
      toast.error("Unauthorized transfer or Invalid Status sequence.");
      return;
    }

    console.log("5. Target Address found:", targetAddress);

    try {
      console.log("6. Setting Loader to TRUE");
      setTxLoading(true); 
      
      console.log("7. Calling Smart Contract...");
      // Remove the ?. to force an error if function is missing
      await transferProduct(Number(product.id), targetAddress);
      
      console.log("8. Contract Call Success");
      toast.success("Ownership Transferred Successfully!");

      const updatedData = await fetchProductDetails?.(Number(product.id));
      if (updatedData) {
        setProduct((prev: any) => ({ ...prev, ...updatedData }));
      }
    } catch (error) {
      console.error("CRITICAL ERROR:", error);
      toast.error("Transfer Failed (See Console)");
    } finally {
      setTxLoading(false);
    }
  };
  // ✅ DIRECT CHECK for Ownership
  const isOwner = product && address === product.currentOwner;

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      {/* SCAN UI */}
      {!product && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <QrCode className="h-5 w-5" /> Scan Product
            </CardTitle>
            <CardDescription>
              Use your camera or upload a QR image to track product.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="camera" className="w-full" onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="camera">
                  <Camera className="mr-2 h-4 w-4" /> Camera
                </TabsTrigger>
                <TabsTrigger value="upload">
                  <Upload className="mr-2 h-4 w-4" /> Upload
                </TabsTrigger>
              </TabsList>

              {/* CAMERA TAB */}
              <TabsContent value="camera" className="mt-4">
                <div className="relative h-64 w-full bg-black rounded-lg overflow-hidden flex items-center justify-center">
                  {activeTab === "camera" && !loading && (
                    <Scanner
                      onScan={(detectedCodes: IDetectedBarcode[]) => {
                        if (detectedCodes.length > 0) {
                          handleQrResult(detectedCodes[0].rawValue);
                        }
                      }}
                      onError={(error) => console.log(error)}
                      styles={{
                        container: { width: "100%", height: "100%" },
                        video: { width: "100%", height: "100%", objectFit: "cover" },
                      }}
                      components={{ torch: true }}
                    />
                  )}
                  {loading && (
                    <Loader2 className="h-8 w-8 text-white animate-spin absolute z-10" />
                  )}
                </div>
                <p className="text-xs text-center text-muted-foreground mt-2">
                  Point camera at the QR code
                </p>
              </TabsContent>

              {/* UPLOAD TAB */}
              <TabsContent value="upload" className="mt-4">
                <div className="flex flex-col items-center justify-center border-2 border-dashed border-slate-300 rounded-lg h-64 bg-slate-50 hover:bg-slate-100 transition-colors cursor-pointer relative">
                  <Input
                    type="file"
                    accept="image/*"
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    onChange={handleFileUpload}
                    disabled={loading}
                  />
                  {loading ? (
                    <Loader2 className="h-10 w-10 animate-spin" />
                  ) : (
                    <>
                      <Upload className="h-10 w-10 text-slate-400 mb-2" />
                      <p className="text-sm font-medium text-slate-600">
                        Click to Upload QR Image
                      </p>
                      <p className="text-xs text-slate-400">Supports PNG, JPG</p>
                    </>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      )}

      {/* PRODUCT DETAILS */}
      {product && (
        <Card className="border-2 border-slate-200 shadow-lg">
          <CardHeader className="bg-slate-50 border-b flex flex-row items-center justify-between">
            <div className="space-y-1">
              <CardTitle className="text-2xl">{product.name}</CardTitle>
              <CardDescription>
                Batch: {product.batchId}
                {product.description && (
                  <span className="block text-xs font-normal text-slate-400 mt-1">
                    {product.description}
                  </span>
                )}
              </CardDescription>
            </div>
            <div className="flex flex-col items-end gap-2">
              <Badge
                className={`${
                  STATUS_COLORS[product.status] || "bg-gray-500"
                } text-white px-3 py-1 text-sm`}
              >
                {STATUS_LABELS[product.status] || "Unknown"}
              </Badge>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setProduct(null);
                  setLoading(false);
                }}
                className="h-6 text-xs text-slate-500"
              >
                Scan Another
              </Button>
            </div>
          </CardHeader>

          <CardContent className="space-y-4 pt-6">
            {/* Info Grid */}
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="font-semibold text-slate-500">Current Owner</p>
                <p
                  className="font-mono text-xs bg-slate-100 p-2 rounded truncate"
                  title={product.currentOwner}
                >
                  {product.currentOwner}
                </p>
              </div>
              <div>
                <p className="font-semibold text-slate-500">Your Role</p>
                <p className="text-blue-600 font-medium">
                  {/* ✅ DIRECT CHECKS */}
                  {address === product.manufacturer
                    ? "Manufacturer"
                    : address === (product.assignedWholesaler || product.wholesaler)
                    ? "Wholesaler"
                    : address === (product.assignedRetailer || product.retailer)
                    ? "Retailer"
                    : "Consumer/Viewer"}
                </p>
              </div>
            </div>

            {/* ACTION SECTION */}
            {isOwner && product.status !== 3 && (
              <div className="mt-6 p-4 bg-blue-50 border border-blue-100 rounded-lg">
                <h3 className="font-semibold flex items-center gap-2 text-blue-900 mb-3">
                  <Truck className="h-4 w-4" /> Supply Chain Action
                </h3>

                <div className="space-y-3">
                  {address === product.manufacturer && (
                    <div className="text-sm">
                      <p className="mb-2">Ready to ship to Wholesaler?</p>
                      <div className="p-2 bg-white rounded border text-xs text-slate-500 mb-2 truncate">
                        Target: {product.assignedWholesaler || product.wholesaler}
                      </div>
                    </div>
                  )}

                  {address === (product.assignedWholesaler || product.wholesaler) && (
                    <div className="text-sm">
                      <p className="mb-2">Ready to ship to Retailer?</p>
                      <div className="p-2 bg-white rounded border text-xs text-slate-500 mb-2 truncate">
                        Target: {product.assignedRetailer || product.retailer}
                      </div>
                    </div>
                  )}

                  {address === (product.assignedRetailer || product.retailer) && (
                    <div className="text-sm">
                      <p className="mb-2">Sell to Consumer?</p>
                      <Input
                        placeholder="Enter Consumer Wallet Address"
                        value={consumerAddress}
                        onChange={(e) => setConsumerAddress(e.target.value)}
                        className="bg-white mb-2"
                      />
                    </div>
                  )}

                  <Button
                    className="w-full"
                    onClick={handleTransfer}
                    disabled={txLoading} 
                  >
                    {txLoading ? (
                      <>
                        <Loader2 className="animate-spin mr-2 h-4 w-4" /> Processing...
                      </>
                    ) : (
                      <>
                        <ArrowRight className="mr-2 h-4 w-4" /> Transfer Ownership
                      </>
                    )}
                  </Button>
                </div>
              </div>
            )}

            {!isOwner && product.status !== 3 && (
              <div className="p-4 bg-yellow-50 text-yellow-800 rounded-lg text-sm flex items-center gap-2">
                <Package className="h-4 w-4" />
                You are viewing this product. You are not the current owner.
              </div>
            )}

            {product.status === 3 && (
              <div className="p-4 bg-green-50 text-green-800 rounded-lg text-sm flex items-center gap-2">
                <CheckCircle className="h-4 w-4" />
                Product Delivered.
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ScanSection;
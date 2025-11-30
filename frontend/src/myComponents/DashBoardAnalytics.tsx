import React, { useEffect, useState, useMemo } from 'react';
import axios from 'axios';
import { useStateContext } from '@/context/StateProvider'; 
import { format } from 'date-fns';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Cell 
} from 'recharts';
import { 
  Box, 
  Truck, 
  CheckCircle, 
  Package, 
  QrCode, 
  Copy,
  ExternalLink,
  Download,
  Loader2
} from 'lucide-react';

// Shadcn UI Components
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';

// Import the utility function
import { handleDownloadQR } from '@/utils/handleDownloadQR';

// --- Configuration ---

// Mapping Solidity Enum (0-3) to UI Labels and Colors
const STATUS_MAP: any = {
  0: { label: 'Created', color: '#3b82f6', icon: Box },       // Blue
  1: { label: 'In Transit', color: '#eab308', icon: Truck },  // Yellow
  2: { label: 'In Warehouse', color: '#f97316', icon: Package }, // Orange
  3: { label: 'Delivered', color: '#22c55e', icon: CheckCircle }, // Green
};

const DashboardAnalytics = () => {
  // ✅ Get the new fetchProductsCreatedBy function from context
  const { address, fetchUserProducts, fetchProductsCreatedBy } = useStateContext();
  
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  
  // Modal State
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // 1. Fetch Data (Blockchain + Database)
  useEffect(() => {
    const loadData = async () => {
      // Ensure all required functions are available
      if (!address || !fetchUserProducts || !fetchProductsCreatedBy) return;
      
      try {
        setLoading(true);

        // --- A. FETCH BLOCKCHAIN DATA (Source of Truth) ---
        
        // 1. Fetch items currently OWNED by this wallet (For Wholesalers/Retailers)
        const ownedProducts = await fetchUserProducts(address);
        
        // 2. Fetch items CREATED by this wallet (For Manufacturers - History)
        const createdProducts = await fetchProductsCreatedBy(address);

        // 3. Merge lists intelligently using a Map to remove duplicates
        // (If a manufacturer still owns the product they created, it appears in both lists)
        const uniqueProductsMap = new Map();

        // Add created products first (Ensures history is captured)
        createdProducts.forEach((p: any) => uniqueProductsMap.set(Number(p.id), p));

        // Add owned products (Ensures current ownership is captured)
        ownedProducts.forEach((p: any) => uniqueProductsMap.set(Number(p.id), p));

        // Convert Map back to Array
        const blockchainData = Array.from(uniqueProductsMap.values());
        
        console.log("Merged Blockchain Data:", blockchainData);

        // --- B. FETCH DATABASE DATA (Visuals/Metadata) ---
        let dbData: any[] = [];
        try {
            const res = await axios.get(`http://localhost:5000/api/products/owner/${address}`);
            if (res.data.success) {
                dbData = res.data.data;
            }
        } catch (e) {
            console.error("DB Fetch Error (Visuals might be missing)", e);
        }

        // --- C. MERGE EVERYTHING ---
        const mergedProducts = blockchainData.map((bcItem: any) => {
            // Find matching DB item by BatchID
            const dbItem = dbData.find((db: any) => db.batchId === bcItem.batchId);
            
            return {
                ...bcItem, // Contains: id, status, currentOwner, timestamp, manufacturer
                // Convert BigInts to numbers/strings for React
                id: Number(bcItem.id),
                status: Number(bcItem.status),
                timestamp: Number(bcItem.timestamp),
                
                // Add DB Metadata if available, otherwise defaults
                description: dbItem?.description || "No description available",
                qrCode: dbItem?.qrCode || null,
                // If DB doesn't have it, fallback to 'Not in DB'
                transactionHash: dbItem?.transactionHash || "Not stored in DB", 
                createdAt: dbItem?.createdAt || new Date(Number(bcItem.timestamp) * 1000).toISOString()
            };
        });

        // Sort by ID descending (newest first)
        mergedProducts.sort((a, b) => b.id - a.id);

        setProducts(mergedProducts);

      } catch (error) {
        console.error("Failed to load dashboard data", error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [address, fetchUserProducts, fetchProductsCreatedBy]);

  // 2. Prepare Data for Recharts
  const chartData = useMemo(() => {
    const counts: any = { 0: 0, 1: 0, 2: 0, 3: 0 };
    
    products.forEach(p => {
      const status: any = p.status !== undefined ? p.status : 0;
      if (counts[status] !== undefined) {
        counts[status]++;
      }
    });

    return Object.keys(counts).map(key => ({
      name: STATUS_MAP[key].label,
      count: counts[key],
      fill: STATUS_MAP[key].color
    }));
  }, [products]);

  // Handle Card Click
  const handleProductClick = (product: any) => {
    setSelectedProduct(product);
    setIsDialogOpen(true);
  };

  // Helper to copy text
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  if (!address) {
    return (
      <div className="flex flex-col items-center justify-center h-[50vh] text-center">
        <h2 className="text-2xl font-semibold font-source-serif">Wallet Not Connected</h2>
        <p className="text-muted-foreground">Please connect your wallet to view your supply chain dashboard.</p>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-8 bg-background min-h-screen">
      
      {/* Header Section */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl tracking-tight font-poppins">Supply Chain Dashboard</h2>
          <p className="text-muted-foreground">Manage and track your manufactured & owned products.</p>
        </div>
        <div className="flex items-center gap-2">
            <Badge variant="secondary" className="px-4 py-2 text-md">
              Total Products: {products.length}
            </Badge>
        </div>
      </div>

      {loading ? (
         <div className="flex justify-center items-center h-64">
            <Loader2 className="h-10 w-10 animate-spin text-blue-500" />
         </div>
      ) : (
        <>
            {/* --- ANALYTICS CHART SECTION --- */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {/* Bar Chart */}
                <Card className="col-span-2">
                <CardHeader>
                    <CardTitle>Product Status Distribution</CardTitle>
                    <CardDescription>Real-time view of where your products are in the chain.</CardDescription>
                </CardHeader>
                <CardContent className="pl-2">
                    <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                        <XAxis 
                        dataKey="name" 
                        stroke="#888888" 
                        fontSize={12} 
                        tickLine={false} 
                        axisLine={false} 
                        />
                        <YAxis 
                        stroke="#888888" 
                        fontSize={12} 
                        tickLine={false} 
                        axisLine={false} 
                        allowDecimals={false}
                        />
                        <Tooltip 
                        cursor={{ fill: 'transparent' }}
                        contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}
                        />
                        <Bar dataKey="count" radius={[4, 4, 0, 0]} barSize={50}>
                        {chartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.fill} />
                        ))}
                        </Bar>
                    </BarChart>
                    </ResponsiveContainer>
                </CardContent>
                </Card>

                {/* Quick Summary Card */}
                <Card>
                <CardHeader>
                    <CardTitle>Recent Activity</CardTitle>
                    <CardDescription>Latest products added to the chain</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                    {products.slice(0, 3).map((product) => (
                        <div key={product.id} className="flex items-center gap-4 border-b pb-2 last:border-0">
                        <div className={`p-2 rounded-full ${STATUS_MAP[product.status].color} bg-opacity-10`}>
                            {React.createElement(STATUS_MAP[product.status].icon, { className: "h-4 w-4" })}
                        </div>
                        <div className="flex-1 space-y-1">
                            <p className="text-sm font-medium leading-none">{product.name}</p>
                            <p className="text-xs text-muted-foreground">{product.batchId}</p>
                        </div>
                        <div className="text-xs font-bold" style={{ color: STATUS_MAP[product.status].color }}>
                           {STATUS_MAP[product.status].label}
                        </div>
                        </div>
                    ))}
                    </div>
                </CardContent>
                </Card>
            </div>

            <Separator className="my-4" />

            {/* --- PRODUCTS GRID SECTION --- */}
            <h3 className="text-xl font-semibold">Your Inventory & History</h3>
            
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {products.map((product) => {
                const statusInfo = STATUS_MAP[product.status || 0];
                return (
                    <Card 
                    key={product.id} 
                    className="cursor-pointer hover:shadow-lg transition-shadow border-l-4"
                    style={{ borderLeftColor: statusInfo.color }}
                    onClick={() => handleProductClick(product)}
                    >
                    <CardHeader className="pb-2">
                        <div className="flex justify-between items-start">
                        <Badge className={`${statusInfo.color} text-white hover:${statusInfo.color}`}>
                            {statusInfo.label}
                        </Badge>
                        <QrCode className="h-5 w-5 text-gray-400" />
                        </div>
                        <CardTitle className="text-lg mt-2">{product.name}</CardTitle>
                        <CardDescription>Batch: {product.batchId}</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <p className="text-xs text-muted-foreground truncate">
                        ID: {product.id}
                        </p>
                    </CardContent>
                    </Card>
                );
                })}
            </div>
        </>
      )}

      {/* --- PRODUCT DETAILS MODAL (DIALOG) --- */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          {selectedProduct && (
            <>
              <DialogHeader>
                <DialogTitle className="text-2xl flex items-center gap-2">
                  {selectedProduct.name}
                  <Badge variant="outline">{selectedProduct.batchId}</Badge>
                </DialogTitle>
                <DialogDescription>
                  Status updated: {selectedProduct.timestamp ? format(new Date(selectedProduct.timestamp * 1000), 'PPP p') : 'Unknown'}
                </DialogDescription>
              </DialogHeader>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4">
                
                {/* Left Column: QR Code */}
                <div className="flex flex-col items-center justify-center p-4 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                  <span className="text-xs text-gray-500 mb-2">Scan for History</span>
                  {selectedProduct.qrCode ? (
                    <img 
                        src={selectedProduct.qrCode} 
                        alt="Product QR" 
                        className="w-48 h-48 object-contain"
                    />
                  ) : (
                    <div className="w-48 h-48 bg-gray-200 flex items-center justify-center text-gray-400">
                        No QR Code
                    </div>
                  )}
                  
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="mt-2 text-xs w-full" 
                    onClick={() => handleDownloadQR(selectedProduct)}
                  >
                    <Download className="mr-2 h-3 w-3" />
                    Download QR
                  </Button>
                </div>

                {/* Right Column: Details */}
                <div className="space-y-4">
                   {/* Status Box */}
                   <div className="bg-blue-50 p-3 rounded-md">
                        <span className="text-xs font-semibold text-blue-700 uppercase">Current Status</span>
                        <div className="text-lg font-bold text-blue-900 flex items-center gap-2 mt-1">
                            {React.createElement(STATUS_MAP[selectedProduct.status].icon, { className: "h-5 w-5" })}
                            {STATUS_MAP[selectedProduct.status].label}
                        </div>
                   </div>

                  <div>
                    <h4 className="text-sm font-medium text-gray-500">Description</h4>
                    <p className="text-sm text-gray-900 mt-1">
                      {selectedProduct.description || "No description provided."}
                    </p>
                  </div>

                  <div className="space-y-2">
                      <div className="flex flex-col space-y-1">
                        <span className="text-xs font-semibold text-gray-500">Current Owner</span>
                        <code className="text-xs bg-gray-100 p-1 rounded break-all">
                            {selectedProduct.currentOwner}
                        </code>
                      </div>
                      <div className="flex flex-col space-y-1">
                        <span className="text-xs font-semibold text-gray-500">Manufacturer</span>
                        <code className="text-xs bg-gray-100 p-1 rounded break-all">
                            {selectedProduct.manufacturer}
                        </code>
                      </div>
                  </div>

                  <div className="pt-2">
                      <span className="text-xs font-semibold text-gray-500">Creation Transaction</span>
                      <div className="flex items-center gap-2 mt-1">
                        <code className="text-xs bg-blue-50 text-blue-600 p-1 rounded truncate max-w-[200px]">
                            {selectedProduct.transactionHash}
                        </code>
                        <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-6 w-6"
                            onClick={() => copyToClipboard(selectedProduct.transactionHash)}
                        >
                            <Copy className="h-3 w-3" />
                        </Button>
                        <a 
                            href={`https://sepolia.etherscan.io/tx/${selectedProduct.transactionHash}`} 
                            target="_blank" 
                            rel="noreferrer"
                        >
                             <ExternalLink className="h-3 w-3 text-gray-400 hover:text-blue-500" />
                        </a>
                      </div>
                  </div>

                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default DashboardAnalytics;
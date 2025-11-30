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
  Download // <--- ADDED MISSING IMPORT
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
  0: { label: 'Created', color: '#3b82f6', icon: Box, badge: 'default' },       // Blue
  1: { label: 'In Transit', color: '#eab308', icon: Truck, badge: 'secondary' }, // Yellow
  2: { label: 'In Warehouse', color: '#f97316', icon: Package, badge: 'secondary' }, // Orange
  3: { label: 'Delivered', color: '#22c55e', icon: CheckCircle, badge: 'outline' }, // Green
};

const DashboardAnalytics = () => {
  const { address } = useStateContext();
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  
  // Modal State
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // 1. Fetch Data from your API
  useEffect(() => {
    const fetchProducts = async () => {
      if (!address) return;
      
      try {
        setLoading(true);
        const res = await axios.get(`http://localhost:5000/api/products/owner/${address}`);
        if (res.data.success) {
          setProducts(res.data.data);
        }
      } catch (error) {
        console.error("Failed to fetch products", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [address]);

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
        <h2 className="text-2xl font-semibold">Wallet Not Connected</h2>
        <p className="text-muted-foreground">Please connect your wallet to view your supply chain dashboard.</p>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-8 bg-background min-h-screen">
      
      {/* Header Section */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Supply Chain Dashboard</h2>
          <p className="text-muted-foreground">Manage and track your manufactured products.</p>
        </div>
        <div className="flex items-center gap-2">
            <Badge variant="secondary" className="px-4 py-2 text-md">
              Total Products: {products.length}
            </Badge>
        </div>
      </div>

      {/* --- ANALYTICS CHART SECTION --- */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
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
                <div key={product._id} className="flex items-center gap-4 border-b pb-2 last:border-0">
                  <div className={`p-2 rounded-full ${STATUS_MAP[product.status || 0].color} bg-opacity-10`}>
                    <Box className="h-4 w-4 text-gray-700" />
                  </div>
                  <div className="flex-1 space-y-1">
                    <p className="text-sm font-medium leading-none">{product.name}</p>
                    <p className="text-xs text-muted-foreground">{product.batchId}</p>
                  </div>
                  <div className="text-xs text-muted-foreground">
                   {product.createdAt ? format(new Date(product.createdAt), 'MMM dd') : 'N/A'}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Separator className="my-4" />

      {/* --- PRODUCTS GRID SECTION --- */}
      <h3 className="text-xl font-semibold">Your Inventory</h3>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {products.map((product) => {
          const statusInfo = STATUS_MAP[product.status || 0];
          return (
            <Card 
              key={product._id} 
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
                  Tx: {product.transactionHash}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

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
                  Manufactured on {selectedProduct.createdAt ? format(new Date(selectedProduct.createdAt), 'PPP p') : 'Unknown'}
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
                  
                  {/* --- FIXED BUTTON HERE --- */}
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
                  <div>
                    <h4 className="text-sm font-medium text-gray-500">Description</h4>
                    <p className="text-sm text-gray-900 mt-1">
                      {selectedProduct.description || "No description provided."}
                    </p>
                  </div>

                  <div className="space-y-2">
                      <div className="flex flex-col space-y-1">
                        <span className="text-xs font-semibold text-gray-500">Manufacturer</span>
                        <code className="text-xs bg-gray-100 p-1 rounded break-all">
                            {selectedProduct.manufacturer}
                        </code>
                      </div>
                      <div className="flex flex-col space-y-1">
                        <span className="text-xs font-semibold text-gray-500">Assigned Wholesaler</span>
                        <code className="text-xs bg-gray-100 p-1 rounded break-all">
                            {selectedProduct.wholesaler}
                        </code>
                      </div>
                      <div className="flex flex-col space-y-1">
                        <span className="text-xs font-semibold text-gray-500">Assigned Retailer</span>
                        <code className="text-xs bg-gray-100 p-1 rounded break-all">
                            {selectedProduct.retailer}
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
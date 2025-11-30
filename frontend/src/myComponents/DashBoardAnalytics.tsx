import React, { useEffect, useState, useMemo } from 'react';
import axios from 'axios';
import { useStateContext } from '@/context/StateProvider'; 
import { format } from 'date-fns';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell 
} from 'recharts';
import { 
  Box, Truck, CheckCircle, Package, QrCode, Copy, ExternalLink, Download, Loader2 
} from 'lucide-react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { handleDownloadQR } from '@/utils/handleDownloadQR';

const STATUS_MAP: any = {
  0: { label: 'Created', color: '#3b82f6', icon: Box }, 
  1: { label: 'In Transit', color: '#eab308', icon: Truck }, 
  2: { label: 'In Warehouse', color: '#f97316', icon: Package }, 
  3: { label: 'Delivered', color: '#22c55e', icon: CheckCircle }, 
};

const DashboardAnalytics = () => {
  const { address, fetchUserProducts } = useStateContext();
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // ✅ UPDATED: Fetch from Blockchain AND Database
  useEffect(() => {
    const loadData = async () => {
      if (!address || !fetchUserProducts) return;
      
      try {
        setLoading(true);

        // 1. Get Real-Time Data from Blockchain (Status, ID, Owner)
        const blockchainData = await fetchUserProducts(address);
        console.log("Blockchain Data:", blockchainData);

        // 2. Get Metadata from Database (Images, Descriptions, Hash)
        // We still fetch from DB because Blockchain doesn't store the QR Image string or long descriptions
        let dbData: any[] = [];
        try {
            const res = await axios.get(`http://localhost:5000/api/products/owner/${address}`);
            if (res.data.success) {
                dbData = res.data.data;
            }
        } catch (e) {
            console.error("DB Fetch Error (Visuals might be missing)", e);
        }

        // 3. MERGE DATA
        // We map over Blockchain data because it is the "Source of Truth" for existence and status
        const mergedProducts = blockchainData.map((bcItem: any) => {
            // Find matching DB item by BatchID
            const dbItem = dbData.find((db: any) => db.batchId === bcItem.batchId);
            
            return {
                ...bcItem, // Contains: id, status, currentOwner, timestamp
                // Convert BigInts to numbers/strings for React
                id: Number(bcItem.id),
                status: Number(bcItem.status),
                timestamp: Number(bcItem.timestamp),
                
                // Add DB Metadata if available, otherwise defaults
                description: dbItem?.description || "No description available",
                qrCode: dbItem?.qrCode || null,
                transactionHash: dbItem?.transactionHash || "Not in DB",
                createdAt: dbItem?.createdAt || new Date(Number(bcItem.timestamp) * 1000).toISOString()
            };
        });

        setProducts(mergedProducts);

      } catch (error) {
        console.error("Failed to load dashboard data", error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [address, fetchUserProducts]);

  // --- CHART LOGIC (Unchanged) ---
  const chartData = useMemo(() => {
    const counts: any = { 0: 0, 1: 0, 2: 0, 3: 0 };
    products.forEach(p => {
      const status: any = p.status !== undefined ? p.status : 0;
      if (counts[status] !== undefined) counts[status]++;
    });
    return Object.keys(counts).map(key => ({
      name: STATUS_MAP[key].label,
      count: counts[key],
      fill: STATUS_MAP[key].color
    }));
  }, [products]);

  const handleProductClick = (product: any) => {
    setSelectedProduct(product);
    setIsDialogOpen(true);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  if (!address) {
    return (
      <div className="flex flex-col items-center justify-center h-[50vh] text-center">
        <h2 className="text-2xl font-semibold">Wallet Not Connected</h2>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-8 bg-background min-h-screen">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Supply Chain Dashboard</h2>
          <p className="text-muted-foreground">Real-time blockchain data.</p>
        </div>
        <div className="flex items-center gap-2">
            <Badge variant="secondary" className="px-4 py-2 text-md">
              Total Products: {products.length}
            </Badge>
        </div>
      </div>

      {loading ? (
          <div className="flex justify-center py-10">
              <Loader2 className="h-10 w-10 animate-spin text-blue-500" />
          </div>
      ) : (
        <>
            {/* ANALYTICS CHARTS */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <Card className="col-span-2">
                <CardHeader>
                    <CardTitle>Product Status Distribution</CardTitle>
                </CardHeader>
                <CardContent className="pl-2">
                    <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                        <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                        <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} allowDecimals={false}/>
                        <Tooltip cursor={{ fill: 'transparent' }} contentStyle={{ borderRadius: '8px' }} />
                        <Bar dataKey="count" radius={[4, 4, 0, 0]} barSize={50}>
                        {chartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.fill} />
                        ))}
                        </Bar>
                    </BarChart>
                    </ResponsiveContainer>
                </CardContent>
                </Card>

                {/* Quick Summary */}
                <Card>
                <CardHeader>
                    <CardTitle>Recent Updates</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                    {products.slice(0, 3).map((product) => (
                        <div key={product.id} className="flex items-center gap-4 border-b pb-2 last:border-0">
                        <div className={`p-2 rounded-full ${STATUS_MAP[product.status].color} bg-opacity-10`}>
                             {/* Dynamic Icon */}
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

            {/* INVENTORY GRID */}
            <h3 className="text-xl font-semibold">Your Inventory</h3>
            
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

      {/* MODAL */}
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
                    Last Updated: {selectedProduct.timestamp ? format(new Date(selectedProduct.timestamp * 1000), 'PPP p') : 'Unknown'}
                </DialogDescription>
              </DialogHeader>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4">
                {/* QR Section */}
                <div className="flex flex-col items-center justify-center p-4 bg-gray-50 rounded-lg">
                  {selectedProduct.qrCode ? (
                    <img src={selectedProduct.qrCode} alt="Product QR" className="w-48 h-48 object-contain"/>
                  ) : (
                    <div className="w-48 h-48 bg-gray-200 flex items-center justify-center text-gray-400">
                        No QR Code
                    </div>
                  )}
                  <Button variant="ghost" size="sm" className="mt-2 text-xs w-full" onClick={() => handleDownloadQR(selectedProduct)}>
                    <Download className="mr-2 h-3 w-3" /> Download QR
                  </Button>
                </div>

                {/* Details Section */}
                <div className="space-y-4">
                   <div className="bg-blue-50 p-3 rounded-md">
                        <span className="text-xs font-semibold text-blue-700 uppercase">Current Status</span>
                        <div className="text-lg font-bold text-blue-900 flex items-center gap-2">
                            {React.createElement(STATUS_MAP[selectedProduct.status].icon, { className: "h-5 w-5" })}
                            {STATUS_MAP[selectedProduct.status].label}
                        </div>
                   </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-500">Current Owner</h4>
                    <code className="text-xs bg-gray-100 p-1 rounded break-all block mt-1">
                        {selectedProduct.currentOwner}
                    </code>
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
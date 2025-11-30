import React, { useState } from 'react';
import NavBar from '@/myComponents/NavBar';
import { useStateContext } from '../context/StateProvider';
import { 
  LayoutDashboard, 
  PackagePlus, 
  ScanLine, 
  History, 
  Settings,
  AlertCircle,
  Loader2,
  Wallet
} from 'lucide-react';
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import DashBoardAnalytics from '@/myComponents/DashBoardAnalytics';
import { backendUrl } from '@/utils/config';
import ScanSection from '@/myComponents/ScanSection';

const Dashboard = () => {
  const { address, createProduct, isTransactionLoading } = useStateContext();
  const [activeTab, setActiveTab] = useState("create");

  // Form State captures Blockchain args + Backend args
  const [formData, setFormData] = useState({
    name: "",
    batchId: "",
    wholesaler: "", 
    retailer: "",   
    description: "" 
  });

  const handleInputChange = (e:any) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const handleCreateProduct = async (e:any) => {
    e.preventDefault();
    
    try {
      // 1. Call Smart Contract (only sends data relevant to Blockchain)
      if (!createProduct) {
        toast.error("Create Product failed...")
  throw new Error("createProduct function is not available");
}
      const receipt = await createProduct(
        formData.name, 
        formData.batchId, 
        formData.wholesaler, 
        formData.retailer
      );

      if (receipt) {
        // 2. Call Backend API (MongoDB)
        // This runs only after blockchain success to ensure data consistency
        console.log("Blockchain transaction success. Syncing with MongoDB...");
        
      
        
        await fetch(`http://localhost:5000/api/products`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                // Data from Blockchain Receipt
                transactionHash: receipt.transactionHash, 
                manufacturer: address,
                
                // Data from Form
                name: formData.name,
                batchId: formData.batchId,
                wholesaler: formData.wholesaler,
                retailer: formData.retailer,
                description: formData.description,
                createdAt: new Date().toISOString()
            })
        });
        

        toast.info("Product Created Successfully!");
        // Reset form
        setFormData({ name: "", batchId: "", wholesaler: "", retailer: "", description: "" });
      }

    } catch (error) {
      console.error(error);
      alert("Error creating product. Check console.");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <NavBar />

      <div className="flex flex-1">
        
        {/* Sidebar */}
        {address && (
          <aside className="w-64 border-r bg-white hidden md:block">
            <div className="p-4 space-y-2">
              <Button 
                variant={activeTab === 'dashboard' ? "secondary" : "ghost"} 
                className="w-full justify-start"
                onClick={() => setActiveTab('dashboard')}
              >
                <LayoutDashboard className="mr-2 h-4 w-4" /> Overview
              </Button>
              <Button 
                variant={activeTab === 'create' ? "secondary" : "ghost"} 
                className="w-full justify-start"
                onClick={() => setActiveTab('create')}
              >
                <PackagePlus className="mr-2 h-4 w-4" /> Create Product
              </Button>
              <Button 
                variant={activeTab === 'scan' ? "secondary" : "ghost"} 
                className="w-full justify-start"
                onClick={() => setActiveTab('scan')}
              >
                <ScanLine className="mr-2 h-4 w-4" /> Scan QR
              </Button>
            </div>
          </aside>
        )}

        {/* Main Content */}
        <main className="flex-1 p-8">
          
          {!address ? (
            <div className="h-[60vh] flex flex-col items-center justify-center text-center space-y-4">
              <div className="bg-slate-100 p-6 rounded-full">
                <AlertCircle className="h-12 w-12 text-slate-400" />
              </div>
              <h2 className="text-2xl font-bold tracking-tight">Wallet Not Connected</h2>
              <p className="text-muted-foreground max-w-md">
                Please connect your wallet to access the dashboard.
              </p>
            </div>
          ) : (
            <div className="max-w-4xl mx-auto space-y-6">
              
              <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
              </div>

              {activeTab === 'dashboard' && <DashBoardAnalytics />}

              {activeTab === 'create' && (
                <Card>
                  <CardHeader>
                    <CardTitle>Register New Product</CardTitle>
                    <CardDescription>
                      Define the product details and the fixed supply chain path.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleCreateProduct} className="space-y-4">
                      
                      {/* Row 1: Basic Info */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="name">Product Name</Label>
                          <Input 
                            id="name" 
                            placeholder="e.g. Nike Air Jordan" 
                            value={formData.name}
                            onChange={handleInputChange}
                            required 
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="batchId">Batch ID</Label>
                          <Input 
                            id="batchId" 
                            placeholder="e.g. BATCH-001" 
                            value={formData.batchId}
                            onChange={handleInputChange}
                            required 
                          />
                        </div>
                      </div>

                      {/* Row 2: Fixed Supply Chain Path (Required by Contract) */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="wholesaler" className="flex items-center gap-2">
                            <Wallet className="h-4 w-4 text-muted-foreground" />
                            Assigned Wholesaler Address
                          </Label>
                          <Input 
                            id="wholesaler" 
                            placeholder="0x..." 
                            value={formData.wholesaler}
                            onChange={handleInputChange}
                            required 
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="retailer" className="flex items-center gap-2">
                             <Wallet className="h-4 w-4 text-muted-foreground" />
                             Assigned Retailer Address
                          </Label>
                          <Input 
                            id="retailer" 
                            placeholder="0x..." 
                            value={formData.retailer}
                            onChange={handleInputChange}
                            required 
                          />
                        </div>
                      </div>

                      {/* Row 3: Backend Data (Not on Blockchain) */}
                      <div className="space-y-2">
                        <Label htmlFor="description">Product Description (Stored in DB)</Label>
                        <Input 
                          id="description" 
                          placeholder="Detailed description for the end consumer..." 
                          value={formData.description}
                          onChange={handleInputChange}
                        />
                      </div>

                      <Button type="submit" className="w-full" disabled={isTransactionLoading}>
                        {isTransactionLoading ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Minting on Blockchain...
                          </>
                        ) : (
                          "Create Product & Generate QR"
                        )}
                      </Button>
                    </form>
                  </CardContent>
                </Card>
              )}

              {activeTab === 'scan' && (
                <ScanSection />
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
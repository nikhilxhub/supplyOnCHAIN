import React, { useState } from 'react';
import NavBar from '@/myComponents/NavBar';
import { useStateContext } from '../context/StateProvider';
import { 
  LayoutDashboard, 
  PackagePlus, 
  ScanLine, 
  Loader2,
  Wallet,
  AlertCircle,
  X // Added X icon for closing menu
} from 'lucide-react';
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import DashBoardAnalytics from '@/myComponents/DashBoardAnalytics';
import ScanSection from '@/myComponents/ScanSection';

const Dashboard = () => {
  const { address, createProduct, isTransactionLoading } = useStateContext();
  const [activeTab, setActiveTab] = useState("create");
  
  // ✅ State for Mobile Sidebar
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    batchId: "",
    wholesaler: "", 
    retailer: "",   
    description: "" 
  });

  const handleInputChange = (e: any) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  // Helper to change tab and close menu on mobile
  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    setIsMobileMenuOpen(false);
  };

  const handleCreateProduct = async (e: any) => {
    e.preventDefault();
    
    try {
      if (!createProduct) {
        toast.error("Create Product failed...");
        throw new Error("createProduct function is not available");
      }
      const receipt = await createProduct(
        formData.name, 
        formData.batchId, 
        formData.wholesaler, 
        formData.retailer
      );

      if (receipt) {
        console.log("Blockchain transaction success. Syncing with MongoDB...");
        
        await fetch(`http://localhost:5000/api/products`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                transactionHash: receipt.transactionHash, 
                manufacturer: address,
                name: formData.name,
                batchId: formData.batchId,
                wholesaler: formData.wholesaler,
                retailer: formData.retailer,
                description: formData.description,
                createdAt: new Date().toISOString()
            })
        });

        toast.info("Product Created Successfully!");
        setFormData({ name: "", batchId: "", wholesaler: "", retailer: "", description: "" });
      }

    } catch (error) {
      console.error(error);
      alert("Error creating product. Check console.");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col relative">
      {/* Pass the toggle function to NavBar */}
      <NavBar onMenuClick={() => setIsMobileMenuOpen(true)} />

      <div className="flex flex-1 relative">
        
        {/* --- DESKTOP SIDEBAR (Hidden on Mobile) --- */}
        {address && (
          <aside className="w-64 border-r bg-white hidden md:block h-[calc(100vh-73px)] sticky top-[73px]">
            <div className="p-4 space-y-2">
              <Button 
                variant={activeTab === 'dashboard' ? "secondary" : "ghost"} 
                className="w-full justify-start"
                onClick={() => handleTabChange('dashboard')}
              >
                <LayoutDashboard className="mr-2 h-4 w-4" /> Overview
              </Button>
              <Button 
                variant={activeTab === 'create' ? "secondary" : "ghost"} 
                className="w-full justify-start"
                onClick={() => handleTabChange('create')}
              >
                <PackagePlus className="mr-2 h-4 w-4" /> Create Product
              </Button>
              <Button 
                variant={activeTab === 'scan' ? "secondary" : "ghost"} 
                className="w-full justify-start"
                onClick={() => handleTabChange('scan')}
              >
                <ScanLine className="mr-2 h-4 w-4" /> Scan QR
              </Button>
            </div>
          </aside>
        )}

        {/* --- MOBILE SIDEBAR OVERLAY (Visible only when open) --- */}
        {isMobileMenuOpen && (
          <div className="fixed inset-0 z-50 flex md:hidden">
            {/* Dark Backdrop */}
            <div 
              className="fixed inset-0 bg-black/50 backdrop-blur-sm" 
              onClick={() => setIsMobileMenuOpen(false)}
            />
            
            {/* Sidebar Content */}
            <aside className="relative w-64 bg-white h-full shadow-xl flex flex-col p-4 animate-in slide-in-from-left duration-300">
              <div className="flex justify-between items-center mb-6">
                <span className="font-bold text-lg">Menu</span>
                <Button variant="ghost" size="icon" onClick={() => setIsMobileMenuOpen(false)}>
                  <X className="h-5 w-5" />
                </Button>
              </div>

              <div className="space-y-2">
                <Button 
                  variant={activeTab === 'dashboard' ? "secondary" : "ghost"} 
                  className="w-full justify-start"
                  onClick={() => handleTabChange('dashboard')}
                >
                  <LayoutDashboard className="mr-2 h-4 w-4" /> Overview
                </Button>
                <Button 
                  variant={activeTab === 'create' ? "secondary" : "ghost"} 
                  className="w-full justify-start"
                  onClick={() => handleTabChange('create')}
                >
                  <PackagePlus className="mr-2 h-4 w-4" /> Create Product
                </Button>
                <Button 
                  variant={activeTab === 'scan' ? "secondary" : "ghost"} 
                  className="w-full justify-start"
                  onClick={() => handleTabChange('scan')}
                >
                  <ScanLine className="mr-2 h-4 w-4" /> Scan QR
                </Button>
              </div>
            </aside>
          </div>
        )}

        {/* --- MAIN CONTENT --- */}
        <main className="flex-1 p-4 md:p-8">
          
          {!address ? (
            <div className="h-[60vh] flex flex-col items-center justify-center text-center space-y-4">
              <div className="bg-slate-100 p-6 rounded-full">
                <AlertCircle className="h-12 w-12 text-slate-400" />
              </div>
              <h2 className="text-4xl tracking-tight font-source-serif">Wallet Not Connected</h2>
              <p className="text-muted-foreground max-w-md">
                Please connect your wallet to access the dashboard.
              </p>
            </div>
          ) : (
            <div className="max-w-4xl mx-auto space-y-6">
              
              <div className="flex items-center justify-between">
                <h1 className=" md:text-4xl font-semibold tracking-tight font-source-serif">Dashboard</h1>
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

                      {/* Row 2: Fixed Supply Chain Path */}
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

                      {/* Row 3: Backend Data */}
                      <div className="space-y-2">
                        <Label htmlFor="description">Product Description</Label>
                        <Input 
                          id="description" 
                          placeholder="Detailed description..." 
                          value={formData.description}
                          onChange={handleInputChange}
                        />
                      </div>

                      <Button type="submit" className="w-full" disabled={isTransactionLoading}>
                        {isTransactionLoading ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Minting...
                          </>
                        ) : (
                          "Create Product"
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
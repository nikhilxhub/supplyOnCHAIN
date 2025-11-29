import React, { useState } from 'react';
import NavBar from '@/myComponents/NavBar';
import { useStateContext } from '../context/StateProvider';
import { 
  LayoutDashboard, 
  PackagePlus, 
  ScanLine, 
  History, 
  Settings,
  AlertCircle
} from 'lucide-react';


import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import DashBoardAnalytics from '@/myComponents/DashBoardAnalytics';


const Dashboard = () => {
  const { address } = useStateContext();
  const [activeTab, setActiveTab] = useState("create"); // 'dashboard', 'create', 'scan'

  const handleCreateProduct = (e:any) => {
    e.preventDefault();
    console.log("Creating product on chain...");
    // Add your smart contract interaction here
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Top Navigation */}
      <NavBar />

      <div className="flex flex-1">
        
       
        {address && (
          <aside className="w-64 border-r bg-white hidden md:block">
            <div className="p-4 space-y-2">
              <Button 
                variant={activeTab === 'dashboard' ? "secondary" : "ghost"} 
                className="w-full justify-start"
                onClick={() => setActiveTab('dashboard')}
              >
                <LayoutDashboard className="mr-2 h-4 w-4" />
                Overview
              </Button>
              <Button 
                variant={activeTab === 'create' ? "secondary" : "ghost"} 
                className="w-full justify-start"
                onClick={() => setActiveTab('create')}
              >
                <PackagePlus className="mr-2 h-4 w-4" />
                Create Product
              </Button>
              <Button 
                variant={activeTab === 'scan' ? "secondary" : "ghost"} 
                className="w-full justify-start"
                onClick={() => setActiveTab('scan')}
              >
                <ScanLine className="mr-2 h-4 w-4" />
                Scan QR
              </Button>
              <Button variant="ghost" className="w-full justify-start">
                <History className="mr-2 h-4 w-4" />
                History
              </Button>
            </div>
            <div className="absolute bottom-4 left-0 w-64 p-4">
              <Button variant="outline" className="w-full justify-start text-red-500 hover:text-red-600 hover:bg-red-50">
                <Settings className="mr-2 h-4 w-4" />
                Settings
              </Button>
            </div>
          </aside>
        )}


        <main className="flex-1 p-8">
          
          {!address ? (
            /* LOCKED STATE: Wallet Not Connected */
            <div className="h-[60vh] flex flex-col items-center justify-center text-center space-y-4">
              <div className="bg-slate-100 p-6 rounded-full">
                <AlertCircle className="h-12 w-12 text-slate-400" />
              </div>
              <h2 className="text-2xl font-bold tracking-tight">Wallet Not Connected</h2>
              <p className="text-muted-foreground max-w-md">
                To access the Supply Chain Dashboard, create products, and track shipments, please connect your wallet using the button in the top right.
              </p>
            </div>
          ) : (
            /* UNLOCKED STATE: Wallet Connected */
            <div className="max-w-4xl mx-auto space-y-6">
              
              {/* Header */}
              <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
                <p className="text-sm text-muted-foreground">
                   Connected: <span className="font-mono bg-slate-200 px-2 py-1 rounded">{address.slice(0,6)}...{address.slice(-4)}</span>
                </p>
              </div>

          
                <DashBoardAnalytics />

             
              {activeTab === 'create' && (
                <Card>
                  <CardHeader>
                    <CardTitle>Register New Product</CardTitle>
                    <CardDescription>
                      This will create a digital record on the blockchain and generate a unique QR code.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleCreateProduct} className="space-y-4">
                      <div className="grid w-full items-center gap-1.5">
                        <Label htmlFor="name">Product Name</Label>
                        <Input type="text" id="name" placeholder="e.g. Nike Air Jordan" required />
                      </div>
                      
                      <div className="grid w-full items-center gap-1.5">
                        <Label htmlFor="batch">Batch ID / Serial Number</Label>
                        <Input type="text" id="batch" placeholder="e.g. BATCH-2025-001" required />
                      </div>

                      <div className="grid w-full items-center gap-1.5">
                        <Label htmlFor="description">Description</Label>
                        <Input type="text" id="description" placeholder="Short description of the product" />
                      </div>

                      <Button type="submit" className="w-full" onClick={handleCreateProduct}>
                        Create Product & Generate QR
                      </Button>
                    </form>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
import React from 'react';
import { ConnectButton } from 'thirdweb/react';
import { client } from '@/client'; // Adjust path if necessary based on your project structure
import { Box, Cuboid } from 'lucide-react';

const NavBar = () => {
  return (
    <nav className="flex items-center justify-between border-b px-6 py-4 bg-background">
      <div className="flex items-center gap-2">
        <div className="bg-primary p-2 rounded-md">
          <Cuboid className="h-6 w-6 text-primary-foreground" />
        </div>
        <span className="text-xl font-bold tracking-tight">SupplyOnChain</span>
      </div>

      <div>
        <ConnectButton 
          client={client} 
          theme={"dark"} 
        />
      </div>
    </nav>
  );
};

export default NavBar;
import React from 'react';
import { ConnectButton } from 'thirdweb/react';
import { client } from '@/client'; 
import { Box, Cuboid, Menu } from 'lucide-react'; // Added Menu icon
import { Button } from "@/components/ui/button"; // Assuming you have this

// Define props to accept the toggle function
interface NavBarProps {
  onMenuClick?: () => void;
}

const NavBar = ({ onMenuClick }: NavBarProps) => {
  return (
    <nav className="flex items-center justify-between border-b px-4 py-3 bg-white sticky top-0 z-30">
      <div className="flex items-center gap-3">
        {/* Mobile Menu Button (Hidden on Desktop) */}
        <Button 
          variant="ghost" 
          size="icon" 
          className="md:hidden" 
          onClick={onMenuClick}
        >
          <Menu className="h-6 w-6" />
        </Button>

        <div className="flex items-center gap-2">
          <div className="bg-primary p-2 rounded-md">
            <Cuboid className="h-6 w-6 text-primary-foreground" />
          </div>
          <span className="text-xl font-bol tracking-tight hidden sm:block font-source-serif weight">
  SupplyOnChain
</span>

        </div>
      </div>

      <div>
        <ConnectButton 
          client={client} 
          // theme={"dark"} 
        />
      </div>
    </nav>
  );
};

export default NavBar;
import React from "react";
import { MapPin, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

const Addresses = () => {
  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <h1 className="text-[32px] font-medium text-linen">Addresses</h1>
        <Button className="bg-gold text-obsidian hover:bg-linen rounded-full">
          <Plus className="w-4 h-4 mr-2" /> Add Address
        </Button>
      </div>

      <div className="flex flex-col items-center justify-center py-20 text-center border border-border-subtle rounded-[16px] bg-surface-1">
        <div className="w-20 h-20 mb-6 rounded-full bg-surface-2 border border-border-subtle flex items-center justify-center">
          <MapPin className="w-8 h-8 text-gold opacity-50" />
        </div>
        <h2 className="text-[20px] font-medium text-linen mb-2">No addresses saved</h2>
        <p className="text-stone max-w-sm mb-6">Add a shipping address for a faster checkout experience on your next acquisition.</p>
        <Button variant="outline" className="text-stone border-border-subtle hover:bg-surface-2 hover:text-linen rounded-full">
          Add New Address
        </Button>
      </div>
    </div>
  );
};

export default Addresses;

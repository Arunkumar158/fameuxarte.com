import React from "react";
import { Link } from "react-router-dom";
import { FolderOpen } from "lucide-react";
import { Button } from "@/components/ui/button";

const SavedCollections = () => {
  // Using existing data only: Currently no backend for saved collections.
  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <h1 className="text-[32px] font-medium text-linen">Saved Collections</h1>

      <div className="flex flex-col items-center justify-center py-24 text-center">
        <div className="w-48 h-48 mb-8 opacity-50">
          <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="30" y="50" width="140" height="100" rx="8" stroke="#D4AF37" strokeWidth="2" strokeDasharray="4 4" />
            <path d="M70 150 L70 170 L130 170 L130 150" stroke="#D4AF37" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <h2 className="text-[28px] font-medium text-linen mb-3">Curate your inspiration.</h2>
        <p className="text-stone max-w-md mb-8">Create thematic collections like 'Minimalism', 'Abstract', or 'Landscape' to organize artworks you discover.</p>
        <Button asChild className="bg-gold text-obsidian hover:bg-linen rounded-full px-8">
          <Link to="/artworks">Explore Artworks</Link>
        </Button>
      </div>
    </div>
  );
};

export default SavedCollections;

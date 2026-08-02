import React from "react";
import { Link } from "react-router-dom";
import { UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";

const Following = () => {
  // Using existing data only: Currently no backend for following artists.
  // Displaying premium empty state as requested.
  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <h1 className="text-[32px] font-medium text-linen">Following Artists</h1>

      <div className="flex flex-col items-center justify-center py-24 text-center">
        <div className="w-32 h-32 mb-8 flex items-center justify-center rounded-full bg-surface-2 border border-border-subtle">
          <UserPlus className="w-12 h-12 text-gold opacity-50" />
        </div>
        <h2 className="text-[28px] font-medium text-linen mb-3">Your favorite artists will appear here.</h2>
        <p className="text-stone max-w-md mb-8">Follow artists to stay updated on their latest releases, exhibitions, and news.</p>
        <Button asChild className="bg-gold text-obsidian hover:bg-linen rounded-full px-8">
          <Link to="/artists">Discover verified artists</Link>
        </Button>
      </div>
    </div>
  );
};

export default Following;

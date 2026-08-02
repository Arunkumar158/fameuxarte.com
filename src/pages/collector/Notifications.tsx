import React from "react";
import { Bell, ImageIcon, Truck, ShieldCheck, Tag } from "lucide-react";
import { Button } from "@/components/ui/button";

const Notifications = () => {
  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <h1 className="text-[32px] font-medium text-linen">Activity Feed</h1>
        <Button variant="outline" className="text-stone border-border-subtle hover:bg-surface-2 hover:text-linen rounded-full">
          Mark all as read
        </Button>
      </div>

      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="w-24 h-24 mb-6 rounded-full bg-surface-2 border border-border-subtle flex items-center justify-center relative">
          <Bell className="w-8 h-8 text-stone opacity-50" />
          <span className="absolute top-6 right-6 w-3 h-3 bg-gold rounded-full border-2 border-surface-2"></span>
        </div>
        <h2 className="text-[24px] font-medium text-linen mb-2">Coming Soon</h2>
        <p className="text-stone max-w-md mb-8">
          Your activity feed will soon show updates like: <br/>
          <span className="inline-flex items-center gap-2 mt-4 text-[13px] text-left">
            <ImageIcon className="w-4 h-4 text-gold" /> Artist uploaded new artwork<br/>
            <Truck className="w-4 h-4 text-gold" /> Order shipped<br/>
            <ShieldCheck className="w-4 h-4 text-gold" /> Certificate issued<br/>
            <Tag className="w-4 h-4 text-gold" /> Price updated
          </span>
        </p>
      </div>
    </div>
  );
};

export default Notifications;

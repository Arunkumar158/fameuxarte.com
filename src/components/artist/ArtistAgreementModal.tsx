import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { CheckSquare, Info, AlertCircle, Loader2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { ScrollArea } from "@/components/ui/scroll-area";

interface ArtistAgreementModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAccept: () => void;
}

export function ArtistAgreementModal({ open, onOpenChange, onAccept }: ArtistAgreementModalProps) {
  const { session } = useAuth();
  const queryClient = useQueryClient();
  
  const [agreements, setAgreements] = useState({
    copyright: false,
    ownership: false,
    authenticity: false,
    terms: false,
    packaging: false,
    commission: false
  });

  const { data: legalDoc, isLoading } = useQuery({
    queryKey: ['artist-agreement-doc'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('legal_documents')
        .select('*')
        .eq('document_type', 'artist_agreement')
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();
      
      if (error) {
        console.error("Error fetching legal document:", error);
        return null;
      }
      return data;
    },
    enabled: open,
  });

  const allAccepted = Object.values(agreements).every(Boolean);

  const { mutate: acceptAgreement, isPending } = useMutation({
    mutationFn: async () => {
      if (!session?.user.id) throw new Error("Not authenticated");
      const { error } = await supabase
        .from('profiles')
        .update({
          agreement_accepted: true,
          agreement_version: legalDoc?.version || '1.0',
          agreement_accepted_at: new Date().toISOString()
        })
        .eq('id', session.user.id);

      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Agreement accepted successfully.");
      queryClient.invalidateQueries({ queryKey: ["artist-profile"] });
      onAccept();
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to accept agreement.");
    }
  });

  const toggleAgreement = (key: keyof typeof agreements) => {
    setAgreements(prev => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl bg-surface-1 border-border-subtle text-linen sm:rounded-xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-medium tracking-tight">Artist Agreement</DialogTitle>
          <DialogDescription className="text-[#888]">
            Before publishing your artwork, please review and accept our marketplace terms. This protects both you and your collectors.
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="py-12 flex justify-center"><Loader2 className="w-8 h-8 animate-spin text-gold" /></div>
        ) : (
          <>
            <ScrollArea className="h-[200px] w-full rounded-md border border-border-subtle bg-obsidian p-4 mb-4">
              <div className="text-sm text-[#bbb] whitespace-pre-line leading-relaxed">
                {legalDoc?.content || `FAMEUXARTE ARTIST AGREEMENT (Version 1.0)
                
Welcome to Fameuxarte. By listing your artwork on our platform, you agree to the following terms and conditions designed to maintain trust and quality within our marketplace.

1. Copyright and Ownership: You must be the sole creator of the artwork and hold all necessary copyrights to list it.
2. Authenticity: You guarantee that the artwork is an original creation and not a reproduction or unauthorized copy.
3. Fulfillment: You agree to package the artwork securely according to professional standards and ship it within the timeframe specified upon sale.
4. Commission: Fameuxarte will retain a standard commission on all sales as outlined in our fee schedule.
5. Accuracy: All descriptions, dimensions, and images provided must accurately represent the physical artwork.

This agreement acts as a binding contract between you (the Artist) and Fameuxarte.`}
              </div>
            </ScrollArea>

            <div className="space-y-4 py-4">
              <label className="flex items-start gap-3 cursor-pointer group">
                <div className="pt-0.5">
                  <input type="checkbox" className="hidden" checked={agreements.copyright} onChange={() => toggleAgreement('copyright')} />
                  <div className={`w-5 h-5 rounded border ${agreements.copyright ? 'bg-gold border-gold text-obsidian' : 'border-border-strong bg-transparent group-hover:border-gold/50'} flex items-center justify-center transition-colors`}>
                    {agreements.copyright && <CheckSquare className="w-4 h-4" />}
                  </div>
                </div>
                <div className="text-sm">
                  <p className="font-medium text-linen">I created this artwork</p>
                  <p className="text-xs text-[#666]">I am the original creator of this piece.</p>
                </div>
              </label>

              <label className="flex items-start gap-3 cursor-pointer group">
                <div className="pt-0.5">
                  <input type="checkbox" className="hidden" checked={agreements.ownership} onChange={() => toggleAgreement('ownership')} />
                  <div className={`w-5 h-5 rounded border ${agreements.ownership ? 'bg-gold border-gold text-obsidian' : 'border-border-strong bg-transparent group-hover:border-gold/50'} flex items-center justify-center transition-colors`}>
                    {agreements.ownership && <CheckSquare className="w-4 h-4" />}
                  </div>
                </div>
                <div className="text-sm">
                  <p className="font-medium text-linen">I own all rights</p>
                  <p className="text-xs text-[#666]">I hold the copyright and have the right to sell this work.</p>
                </div>
              </label>

              <label className="flex items-start gap-3 cursor-pointer group">
                <div className="pt-0.5">
                  <input type="checkbox" className="hidden" checked={agreements.authenticity} onChange={() => toggleAgreement('authenticity')} />
                  <div className={`w-5 h-5 rounded border ${agreements.authenticity ? 'bg-gold border-gold text-obsidian' : 'border-border-strong bg-transparent group-hover:border-gold/50'} flex items-center justify-center transition-colors`}>
                    {agreements.authenticity && <CheckSquare className="w-4 h-4" />}
                  </div>
                </div>
                <div className="text-sm">
                  <p className="font-medium text-linen">Authenticity Declaration</p>
                  <p className="text-xs text-[#666]">I guarantee this is an original work as described.</p>
                </div>
              </label>

              <label className="flex items-start gap-3 cursor-pointer group">
                <div className="pt-0.5">
                  <input type="checkbox" className="hidden" checked={agreements.packaging} onChange={() => toggleAgreement('packaging')} />
                  <div className={`w-5 h-5 rounded border ${agreements.packaging ? 'bg-gold border-gold text-obsidian' : 'border-border-strong bg-transparent group-hover:border-gold/50'} flex items-center justify-center transition-colors`}>
                    {agreements.packaging && <CheckSquare className="w-4 h-4" />}
                  </div>
                </div>
                <div className="text-sm">
                  <p className="font-medium text-linen">I will package safely</p>
                  <p className="text-xs text-[#666]">I agree to pack the artwork professionally for secure shipping.</p>
                </div>
              </label>

              <label className="flex items-start gap-3 cursor-pointer group">
                <div className="pt-0.5">
                  <input type="checkbox" className="hidden" checked={agreements.commission} onChange={() => toggleAgreement('commission')} />
                  <div className={`w-5 h-5 rounded border ${agreements.commission ? 'bg-gold border-gold text-obsidian' : 'border-border-strong bg-transparent group-hover:border-gold/50'} flex items-center justify-center transition-colors`}>
                    {agreements.commission && <CheckSquare className="w-4 h-4" />}
                  </div>
                </div>
                <div className="text-sm">
                  <p className="font-medium text-linen">Commission and Terms</p>
                  <p className="text-xs text-[#666]">I agree to Fameuxarte's commission structure and marketplace policies.</p>
                </div>
              </label>
            </div>
            
            <DialogFooter className="mt-6 border-t border-border-faint pt-4">
              <Button variant="ghost" onClick={() => onOpenChange(false)} className="text-stone hover:text-linen">
                Cancel
              </Button>
              <Button 
                disabled={!allAccepted || isPending} 
                onClick={() => acceptAgreement()}
                className="bg-gold hover:bg-gold/90 text-obsidian"
              >
                {isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                Accept & Publish
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

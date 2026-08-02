import React, { useEffect, useState, useCallback } from "react";
import { MapPin, Plus, Pencil, Trash2, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Tables } from "@/integrations/supabase/types";
import { AddressDialog, AddressFormValues } from "@/components/collector/AddressDialog";

type Address = Tables<"addresses">;

const Addresses = () => {
  const { user } = useAuth();
  const { toast } = useToast();

  const [addresses, setAddresses] = useState<Address[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // ── Fetch ────────────────────────────────────────────────────────────────
  const fetchAddresses = useCallback(async () => {
    if (!user) return;
    setIsLoading(true);
    const { data, error } = await supabase
      .from("addresses")
      .select("*")
      .eq("user_id", user.id)
      .order("is_default", { ascending: false })
      .order("created_at", { ascending: true });

    if (error) {
      toast({ title: "Error loading addresses", description: error.message, variant: "destructive" });
    } else {
      setAddresses(data ?? []);
    }
    setIsLoading(false);
  }, [user, toast]);

  useEffect(() => {
    fetchAddresses();
  }, [fetchAddresses]);

  // ── Open dialog ──────────────────────────────────────────────────────────
  const openAdd = () => {
    setEditingAddress(null);
    setDialogOpen(true);
  };

  const openEdit = (address: Address) => {
    setEditingAddress(address);
    setDialogOpen(true);
  };

  const closeDialog = () => {
    setDialogOpen(false);
    setEditingAddress(null);
  };

  // ── Save (add / update) ───────────────────────────────────────────────────
  const handleSave = async (values: AddressFormValues) => {
    if (!user) return;
    setIsSaving(true);

    try {
      // If setting as default, first clear existing default
      if (values.is_default) {
        await supabase
          .from("addresses")
          .update({ is_default: false })
          .eq("user_id", user.id)
          .eq("is_default", true);
      }

      if (editingAddress) {
        // Update
        const { error } = await supabase
          .from("addresses")
          .update({
            label: values.label,
            full_name: values.full_name,
            line1: values.line1,
            line2: values.line2 || null,
            city: values.city,
            state: values.state,
            postal_code: values.postal_code,
            country: values.country,
            phone: values.phone || null,
            is_default: values.is_default,
          })
          .eq("id", editingAddress.id);

        if (error) throw error;
        toast({ title: "Address updated", description: "Your address has been updated." });
      } else {
        // Insert
        const { error } = await supabase.from("addresses").insert({
          user_id: user.id,
          label: values.label,
          full_name: values.full_name,
          line1: values.line1,
          line2: values.line2 || null,
          city: values.city,
          state: values.state,
          postal_code: values.postal_code,
          country: values.country,
          phone: values.phone || null,
          is_default: values.is_default,
        });

        if (error) throw error;
        toast({ title: "Address saved", description: "Your new address has been added." });
      }

      closeDialog();
      fetchAddresses();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Something went wrong";
      toast({ title: "Error saving address", description: message, variant: "destructive" });
    } finally {
      setIsSaving(false);
    }
  };

  // ── Set default ───────────────────────────────────────────────────────────
  const handleSetDefault = async (address: Address) => {
    if (!user || address.is_default) return;

    // Clear existing default
    await supabase
      .from("addresses")
      .update({ is_default: false })
      .eq("user_id", user.id)
      .eq("is_default", true);

    const { error } = await supabase
      .from("addresses")
      .update({ is_default: true })
      .eq("id", address.id);

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Default updated", description: `${address.label} is now your default address.` });
      fetchAddresses();
    }
  };

  // ── Delete ────────────────────────────────────────────────────────────────
  const handleDelete = async (id: string) => {
    setDeletingId(id);
    const { error } = await supabase.from("addresses").delete().eq("id", id);

    if (error) {
      toast({ title: "Error deleting address", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Address removed" });
      setAddresses((prev) => prev.filter((a) => a.id !== id));
    }
    setDeletingId(null);
  };

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-[32px] font-medium text-linen">Addresses</h1>
        <Button
          onClick={openAdd}
          className="bg-gold text-obsidian hover:bg-linen rounded-full"
        >
          <Plus className="w-4 h-4 mr-2" /> Add Address
        </Button>
      </div>

      {/* Loading skeleton */}
      {isLoading && (
        <div className="grid gap-4">
          {[1, 2].map((i) => (
            <div
              key={i}
              className="h-36 rounded-[16px] bg-surface-1 border border-border-subtle animate-pulse"
            />
          ))}
        </div>
      )}

      {/* Empty state */}
      {!isLoading && addresses.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-center border border-border-subtle rounded-[16px] bg-surface-1">
          <div className="w-20 h-20 mb-6 rounded-full bg-surface-2 border border-border-subtle flex items-center justify-center">
            <MapPin className="w-8 h-8 text-gold opacity-50" />
          </div>
          <h2 className="text-[20px] font-medium text-linen mb-2">
            No addresses saved
          </h2>
          <p className="text-stone max-w-sm mb-6">
            Add a shipping address for a faster checkout experience on your next
            acquisition.
          </p>
          <Button
            onClick={openAdd}
            variant="outline"
            className="text-stone border-border-subtle hover:bg-surface-2 hover:text-linen rounded-full"
          >
            Add New Address
          </Button>
        </div>
      )}

      {/* Address cards */}
      {!isLoading && addresses.length > 0 && (
        <div className="grid gap-4">
          {addresses.map((address) => (
            <div
              key={address.id}
              className={`relative p-6 rounded-[16px] border bg-surface-1 transition-all ${
                address.is_default
                  ? "border-gold/50 bg-surface-1"
                  : "border-border-subtle hover:border-gold/20"
              }`}
            >
              {/* Top row: label + badges + actions */}
              <div className="flex items-start justify-between gap-4 mb-3">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-linen font-medium text-[15px]">
                    {address.label}
                  </span>
                  {address.is_default && (
                    <Badge className="bg-gold/15 text-gold border-gold/30 text-[11px] px-2 py-0.5 rounded-full">
                      <Star className="w-2.5 h-2.5 mr-1 fill-gold" />
                      Default
                    </Badge>
                  )}
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  {!address.is_default && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleSetDefault(address)}
                      className="text-stone hover:text-gold hover:bg-transparent text-xs h-7 px-2"
                    >
                      Set default
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => openEdit(address)}
                    className="h-8 w-8 text-stone hover:text-linen hover:bg-surface-2"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDelete(address.id)}
                    disabled={deletingId === address.id}
                    className="h-8 w-8 text-stone hover:text-red-400 hover:bg-surface-2"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>

              {/* Address details */}
              <div className="text-stone text-sm leading-relaxed space-y-0.5">
                <p className="text-linen/80">{address.full_name}</p>
                <p>{address.line1}</p>
                {address.line2 && <p>{address.line2}</p>}
                <p>
                  {address.city}, {address.state} {address.postal_code}
                </p>
                <p>{address.country}</p>
                {address.phone && (
                  <p className="text-stone/70 text-[13px] mt-1">
                    {address.phone}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add/Edit Dialog */}
      <AddressDialog
        open={dialogOpen}
        onClose={closeDialog}
        onSave={handleSave}
        address={editingAddress}
        isSaving={isSaving}
      />
    </div>
  );
};

export default Addresses;

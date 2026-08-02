import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tables } from "@/integrations/supabase/types";

type Address = Tables<"addresses">;

export interface AddressFormValues {
  label: string;
  full_name: string;
  line1: string;
  line2: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
  phone: string;
  is_default: boolean;
}

interface AddressDialogProps {
  open: boolean;
  onClose: () => void;
  onSave: (values: AddressFormValues) => Promise<void>;
  address?: Address | null;
  isSaving?: boolean;
}

const LABELS = ["Home", "Work", "Studio", "Other"] as const;

const COUNTRIES = [
  "India",
  "United States",
  "United Kingdom",
  "Canada",
  "Australia",
  "Germany",
  "France",
  "UAE",
  "Singapore",
];

export const AddressDialog: React.FC<AddressDialogProps> = ({
  open,
  onClose,
  onSave,
  address,
  isSaving,
}) => {
  const isEditing = !!address;

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<AddressFormValues>({
    defaultValues: {
      label: "Home",
      full_name: "",
      line1: "",
      line2: "",
      city: "",
      state: "",
      postal_code: "",
      country: "India",
      phone: "",
      is_default: false,
    },
  });

  // Populate form when editing
  useEffect(() => {
    if (address) {
      reset({
        label: address.label,
        full_name: address.full_name,
        line1: address.line1,
        line2: address.line2 ?? "",
        city: address.city,
        state: address.state,
        postal_code: address.postal_code,
        country: address.country,
        phone: address.phone ?? "",
        is_default: address.is_default,
      });
    } else {
      reset({
        label: "Home",
        full_name: "",
        line1: "",
        line2: "",
        city: "",
        state: "",
        postal_code: "",
        country: "India",
        phone: "",
        is_default: false,
      });
    }
  }, [address, open, reset]);

  const onSubmit = async (values: AddressFormValues) => {
    await onSave(values);
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="bg-surface-1 border border-border-subtle text-linen max-w-lg w-full sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-linen text-xl font-medium">
            {isEditing ? "Edit Address" : "Add New Address"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 mt-2">
          {/* Label */}
          <div className="space-y-1.5">
            <Label className="text-stone text-sm">Address Type</Label>
            <Select
              value={watch("label")}
              onValueChange={(v) => setValue("label", v)}
            >
              <SelectTrigger className="bg-surface-2 border-border-subtle text-linen">
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent className="bg-surface-2 border-border-subtle text-linen">
                {LABELS.map((l) => (
                  <SelectItem key={l} value={l} className="focus:bg-surface-1">
                    {l}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Full name */}
          <div className="space-y-1.5">
            <Label className="text-stone text-sm">Full Name *</Label>
            <Input
              {...register("full_name", { required: "Full name is required" })}
              placeholder="Jane Doe"
              className="bg-surface-2 border-border-subtle text-linen placeholder:text-stone/50"
            />
            {errors.full_name && (
              <p className="text-xs text-red-400">{errors.full_name.message}</p>
            )}
          </div>

          {/* Line 1 */}
          <div className="space-y-1.5">
            <Label className="text-stone text-sm">Address Line 1 *</Label>
            <Input
              {...register("line1", { required: "Address is required" })}
              placeholder="123 Collectors Lane"
              className="bg-surface-2 border-border-subtle text-linen placeholder:text-stone/50"
            />
            {errors.line1 && (
              <p className="text-xs text-red-400">{errors.line1.message}</p>
            )}
          </div>

          {/* Line 2 */}
          <div className="space-y-1.5">
            <Label className="text-stone text-sm">
              Address Line 2{" "}
              <span className="text-stone/50 text-xs">(optional)</span>
            </Label>
            <Input
              {...register("line2")}
              placeholder="Apartment, suite, floor…"
              className="bg-surface-2 border-border-subtle text-linen placeholder:text-stone/50"
            />
          </div>

          {/* City + State */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-stone text-sm">City *</Label>
              <Input
                {...register("city", { required: "City is required" })}
                placeholder="Mumbai"
                className="bg-surface-2 border-border-subtle text-linen placeholder:text-stone/50"
              />
              {errors.city && (
                <p className="text-xs text-red-400">{errors.city.message}</p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label className="text-stone text-sm">State *</Label>
              <Input
                {...register("state", { required: "State is required" })}
                placeholder="Maharashtra"
                className="bg-surface-2 border-border-subtle text-linen placeholder:text-stone/50"
              />
              {errors.state && (
                <p className="text-xs text-red-400">{errors.state.message}</p>
              )}
            </div>
          </div>

          {/* Postal + Country */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-stone text-sm">Postal Code *</Label>
              <Input
                {...register("postal_code", {
                  required: "Postal code is required",
                })}
                placeholder="400001"
                className="bg-surface-2 border-border-subtle text-linen placeholder:text-stone/50"
              />
              {errors.postal_code && (
                <p className="text-xs text-red-400">
                  {errors.postal_code.message}
                </p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label className="text-stone text-sm">Country *</Label>
              <Select
                value={watch("country")}
                onValueChange={(v) => setValue("country", v)}
              >
                <SelectTrigger className="bg-surface-2 border-border-subtle text-linen">
                  <SelectValue placeholder="Select country" />
                </SelectTrigger>
                <SelectContent className="bg-surface-2 border-border-subtle text-linen">
                  {COUNTRIES.map((c) => (
                    <SelectItem
                      key={c}
                      value={c}
                      className="focus:bg-surface-1"
                    >
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Phone */}
          <div className="space-y-1.5">
            <Label className="text-stone text-sm">
              Phone{" "}
              <span className="text-stone/50 text-xs">(optional)</span>
            </Label>
            <Input
              {...register("phone")}
              placeholder="+91 98765 43210"
              className="bg-surface-2 border-border-subtle text-linen placeholder:text-stone/50"
            />
          </div>

          {/* Default */}
          <div className="flex items-center gap-3 pt-1">
            <Checkbox
              id="is_default"
              checked={watch("is_default")}
              onCheckedChange={(checked) =>
                setValue("is_default", checked === true)
              }
              className="border-border-subtle data-[state=checked]:bg-gold data-[state=checked]:border-gold"
            />
            <Label
              htmlFor="is_default"
              className="text-stone text-sm cursor-pointer"
            >
              Set as default shipping address
            </Label>
          </div>

          <DialogFooter className="pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="border-border-subtle text-stone hover:bg-surface-2 hover:text-linen rounded-full"
              disabled={isSaving}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSaving}
              className="bg-gold text-obsidian hover:bg-linen rounded-full font-medium"
            >
              {isSaving ? "Saving…" : isEditing ? "Update Address" : "Save Address"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

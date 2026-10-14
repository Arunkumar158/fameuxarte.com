import React, { useState, useEffect } from "react";
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
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  checkServiceability,
  createShipment,
  type CourierOption,
} from "@/lib/shipping";
import { formatCurrency, formatDate } from "@/lib/utils";
import {
  Truck,
  Package,
  Calendar,
  CheckCircle2,
  ShieldCheck,
  AlertCircle,
  Clock,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";

interface CreateShipmentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  orderItemId: string;
  artworkTitle: string;
  deliveryAddress?: {
    line1?: string;
    city?: string;
    state?: string;
    postal_code?: string;
  };
  artworkPrice?: number;
  onSuccess: (shipmentData: any) => void;
}

export function CreateShipmentDialog({
  open,
  onOpenChange,
  orderItemId,
  artworkTitle,
  deliveryAddress,
  artworkPrice = 15000,
  onSuccess,
}: CreateShipmentDialogProps) {
  const [loadingCouriers, setLoadingCouriers] = useState(false);
  const [couriers, setCouriers] = useState<CourierOption[]>([]);
  const [selectedCourierId, setSelectedCourierId] = useState<string>("");
  
  // Package specifications
  const [weightKg, setWeightKg] = useState<number>(2.5);
  const [lengthCm, setLengthCm] = useState<number>(45);
  const [widthCm, setWidthCm] = useState<number>(35);
  const [heightCm, setHeightCm] = useState<number>(10);
  
  // Pickup scheduling
  const tomorrow = new Date(Date.now() + 86400000).toISOString().split("T")[0];
  const [pickupDate, setPickupDate] = useState<string>(tomorrow);
  const [pickupNotes, setPickupNotes] = useState<string>(
    "ArtGuard™ Sealed Package - Fragile Art Canvas. Do not bend."
  );

  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch courier rates when dialog opens or weight changes
  useEffect(() => {
    if (open) {
      fetchServiceability();
    }
  }, [open, weightKg]);

  const fetchServiceability = async () => {
    setLoadingCouriers(true);
    try {
      const destinationPincode = deliveryAddress?.postal_code || "400001";
      const result = await checkServiceability({
        pickup_pincode: "560034", // Artist Studio
        delivery_pincode: destinationPincode,
        weight_kg: weightKg,
        declared_value: artworkPrice,
        is_fragile: true,
      });

      if (result.couriers && result.couriers.length > 0) {
        setCouriers(result.couriers);
        if (!selectedCourierId) {
          setSelectedCourierId(result.couriers[0].id);
        }
      }
    } catch (err) {
      console.error("Failed to load couriers:", err);
      toast.error("Could not fetch courier rates. Defaulting to standard rates.");
    } finally {
      setLoadingCouriers(false);
    }
  };

  const handleBookShipment = async () => {
    const courier = couriers.find((c) => c.id === selectedCourierId) || couriers[0];
    if (!courier) {
      toast.error("Please select a courier partner");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await createShipment({
        order_item_id: orderItemId,
        courier_code: courier.courier_code,
        courier_name: courier.courier_name,
        package_weight_kg: weightKg,
        package_length_cm: lengthCm,
        package_width_cm: widthCm,
        package_height_cm: heightCm,
        pickup_date: pickupDate,
        pickup_notes: pickupNotes,
      });

      toast.success(`AWB ${res.awb_code} generated with ${courier.courier_name}!`);
      onSuccess(res);
      onOpenChange(false);
    } catch (err: any) {
      toast.error(`Shipment booking failed: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl bg-obsidian border-border-faint text-linen p-0 overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="bg-surface-2 p-6 border-b border-border-faint">
          <DialogTitle className="text-xl font-medium tracking-tight text-linen flex items-center gap-2">
            <Truck className="w-5 h-5 text-gold" />
            Book Courier & Generate AWB
          </DialogTitle>
          <p className="text-xs text-stone mt-1">
            Integrated courier logistics via Shiprocket & Delhivery for &ldquo;{artworkTitle}&rdquo;
          </p>
        </div>

        {/* Content */}
        <div className="p-6 max-h-[75vh] overflow-y-auto space-y-6">
          {/* Step 1: Package Dimensions */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-linen flex items-center gap-1.5">
                <Package className="w-4 h-4 text-gold" />
                1. Artwork Packaging Dimensions
              </h3>
              <Badge variant="outline" className="text-[10px] border-gold/30 text-gold uppercase">
                Fragile Art
              </Badge>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-surface-1 p-4 rounded-xl border border-border-faint">
              <div className="space-y-1">
                <Label htmlFor="weight" className="text-[11px] text-stone">
                  Weight (kg)
                </Label>
                <Input
                  id="weight"
                  type="number"
                  step="0.1"
                  min="0.5"
                  value={weightKg}
                  onChange={(e) => setWeightKg(parseFloat(e.target.value) || 1)}
                  className="bg-surface-2 border-border-subtle text-linen h-9 text-xs"
                />
              </div>

              <div className="space-y-1">
                <Label htmlFor="length" className="text-[11px] text-stone">
                  Length (cm)
                </Label>
                <Input
                  id="length"
                  type="number"
                  value={lengthCm}
                  onChange={(e) => setLengthCm(parseFloat(e.target.value) || 10)}
                  className="bg-surface-2 border-border-subtle text-linen h-9 text-xs"
                />
              </div>

              <div className="space-y-1">
                <Label htmlFor="width" className="text-[11px] text-stone">
                  Width (cm)
                </Label>
                <Input
                  id="width"
                  type="number"
                  value={widthCm}
                  onChange={(e) => setWidthCm(parseFloat(e.target.value) || 10)}
                  className="bg-surface-2 border-border-subtle text-linen h-9 text-xs"
                />
              </div>

              <div className="space-y-1">
                <Label htmlFor="height" className="text-[11px] text-stone">
                  Height (cm)
                </Label>
                <Input
                  id="height"
                  type="number"
                  value={heightCm}
                  onChange={(e) => setHeightCm(parseFloat(e.target.value) || 5)}
                  className="bg-surface-2 border-border-subtle text-linen h-9 text-xs"
                />
              </div>
            </div>
          </div>

          {/* Step 2: Courier Partner Selection */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-linen flex items-center gap-1.5">
                <Truck className="w-4 h-4 text-gold" />
                2. Select Courier Partner
              </h3>
              <span className="text-[11px] text-stone">
                Delivery Pincode:{" "}
                <strong className="text-linen">{deliveryAddress?.postal_code || "National"}</strong>
              </span>
            </div>

            {loadingCouriers ? (
              <div className="space-y-2">
                <Skeleton className="h-16 w-full bg-surface-2" />
                <Skeleton className="h-16 w-full bg-surface-2" />
              </div>
            ) : (
              <div className="space-y-2">
                {couriers.map((courier) => {
                  const isSelected = selectedCourierId === courier.id;
                  return (
                    <div
                      key={courier.id}
                      onClick={() => setSelectedCourierId(courier.id)}
                      className={`p-4 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-4 ${
                        isSelected
                          ? "bg-gold/10 border-gold shadow-md shadow-gold/5"
                          : "bg-surface-1 border-border-faint hover:border-border-subtle"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                            isSelected ? "border-gold bg-gold text-obsidian" : "border-stone"
                          }`}
                        >
                          {isSelected && <CheckCircle2 className="w-4 h-4" />}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-linen">
                              {courier.courier_name}
                            </span>
                            <Badge
                              variant="outline"
                              className={`text-[9px] uppercase ${
                                courier.service_type === "air"
                                  ? "border-blue-500/30 text-blue-400"
                                  : "border-border-subtle text-stone"
                              }`}
                            >
                              {courier.service_type}
                            </Badge>
                          </div>
                          <p className="text-xs text-stone mt-0.5 flex items-center gap-1">
                            <Clock className="w-3 h-3 text-gold" />
                            Est. {courier.estimated_delivery_days} days (
                            {formatDate(courier.estimated_delivery_date)})
                          </p>
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="text-sm font-medium text-gold">
                          {formatCurrency(courier.rate)}
                        </div>
                        <span className="text-[10px] text-stone">Rate inclusive of GST</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Step 3: Pickup Date & Notes */}
          <div className="space-y-3">
            <h3 className="text-sm font-medium text-linen flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-gold" />
              3. Studio Pickup Schedule
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-surface-1 p-4 rounded-xl border border-border-faint">
              <div className="space-y-1">
                <Label htmlFor="pickupDate" className="text-xs text-stone">
                  Pickup Date from Artist Studio
                </Label>
                <Input
                  id="pickupDate"
                  type="date"
                  value={pickupDate}
                  min={tomorrow}
                  onChange={(e) => setPickupDate(e.target.value)}
                  className="bg-surface-2 border-border-subtle text-linen h-9 text-xs"
                />
              </div>

              <div className="space-y-1">
                <Label htmlFor="notes" className="text-xs text-stone">
                  Courier Pickup Notes
                </Label>
                <Input
                  id="notes"
                  value={pickupNotes}
                  onChange={(e) => setPickupNotes(e.target.value)}
                  placeholder="e.g. Call artist on arrival"
                  className="bg-surface-2 border-border-subtle text-linen h-9 text-xs"
                />
              </div>
            </div>
          </div>

          {/* ArtGuard Assurance */}
          <div className="bg-surface-2/40 border border-gold/20 rounded-xl p-3 flex items-center gap-3">
            <ShieldCheck className="w-5 h-5 text-gold shrink-0" />
            <p className="text-xs text-stone">
              By generating this shipment, you certify that the artwork has been packaged following{" "}
              <strong className="text-linen">Fameuxarte Fine Art Guidelines</strong> with corner protectors and bubble insulation.
            </p>
          </div>
        </div>

        {/* Footer */}
        <DialogFooter className="bg-surface-2 p-4 border-t border-border-faint flex flex-row items-center justify-between sm:justify-between">
          <Button
            variant="ghost"
            onClick={() => onOpenChange(false)}
            className="text-stone hover:text-linen text-xs"
          >
            Cancel
          </Button>

          <Button
            onClick={handleBookShipment}
            disabled={isSubmitting || loadingCouriers}
            className="bg-gold text-obsidian hover:bg-gold/90 text-xs font-medium gap-1.5"
          >
            {isSubmitting ? (
              <>Generating AWB...</>
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5" /> Confirm & Generate AWB
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

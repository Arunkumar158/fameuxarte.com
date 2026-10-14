import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useShipmentTracking } from "@/hooks/useShipmentTracking";
import { formatDate } from "@/lib/utils";
import {
  Truck,
  Package,
  MapPin,
  Calendar,
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Copy,
  Check,
  Sparkles,
  ArrowRight,
} from "lucide-react";
import { toast } from "sonner";

interface LiveTrackingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  orderItemId?: string;
  awbCode?: string;
  isArtistOrAdmin?: boolean;
}

export function LiveTrackingDialog({
  open,
  onOpenChange,
  orderItemId,
  awbCode,
  isArtistOrAdmin = false,
}: LiveTrackingDialogProps) {
  const { data, isLoading, isError, advanceMilestone, isAdvancing } = useShipmentTracking(
    { order_item_id: orderItemId, awb_code: awbCode },
    open
  );

  const [copied, setCopied] = React.useState(false);

  const handleCopyAwb = () => {
    if (data?.awb_code) {
      navigator.clipboard.writeText(data.awb_code);
      setCopied(true);
      toast.success("AWB tracking code copied to clipboard");
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case "delivered":
      case "completed":
        return "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
      case "shipped":
      case "out_for_delivery":
      case "in_transit":
        return "bg-blue-500/10 text-blue-400 border-blue-500/20";
      case "packed":
      case "pickup_scheduled":
        return "bg-gold/10 text-gold border-gold/20";
      default:
        return "bg-surface-3 text-stone border-border-subtle";
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl bg-obsidian border-border-faint text-linen p-0 overflow-hidden shadow-2xl">
        {/* Header Banner */}
        <div className="bg-gradient-to-r from-surface-2 via-surface-1 to-surface-2 p-6 border-b border-border-faint">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gold/10 border border-gold/30 flex items-center justify-center text-gold">
                <Truck className="w-5 h-5" />
              </div>
              <div>
                <DialogTitle className="text-xl font-medium tracking-tight text-linen flex items-center gap-2">
                  Live Courier Tracking
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                  </span>
                </DialogTitle>
                <p className="text-xs text-stone mt-0.5">
                  Shiprocket & Delhivery Logistics Network
                </p>
              </div>
            </div>

            {data?.status && (
              <Badge className={`text-xs uppercase px-2.5 py-1 ${getStatusColor(data.status)}`}>
                {data.status.replace(/_/g, " ")}
              </Badge>
            )}
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 max-h-[75vh] overflow-y-auto space-y-6">
          {isLoading ? (
            <div className="space-y-4">
              <Skeleton className="h-24 w-full bg-surface-2" />
              <Skeleton className="h-48 w-full bg-surface-2" />
            </div>
          ) : isError || !data ? (
            <div className="text-center py-12">
              <Package className="w-12 h-12 text-stone mx-auto mb-3 opacity-50" />
              <h3 className="text-lg font-medium text-linen">Tracking Info Pending</h3>
              <p className="text-sm text-stone mt-1 max-w-sm mx-auto">
                The artist has not yet dispatched or generated an AWB with the courier. Tracking details will appear as soon as the parcel is booked.
              </p>
            </div>
          ) : (
            <>
              {/* Carrier & AWB Overview Card */}
              <div className="bg-surface-1 border border-border-subtle rounded-xl p-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <span className="text-[11px] uppercase tracking-wider text-stone block mb-1">
                    Courier Partner
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-base font-medium text-linen">{data.courier_name}</span>
                    <Badge variant="outline" className="text-[10px] uppercase border-gold/30 text-gold">
                      Art-Safe
                    </Badge>
                  </div>
                  <div className="mt-3 flex items-center gap-2">
                    <span className="text-xs text-stone">AWB:</span>
                    <span className="text-xs font-mono font-medium text-linen bg-surface-2 px-2 py-0.5 rounded border border-border-subtle">
                      {data.awb_code}
                    </span>
                    <button
                      onClick={handleCopyAwb}
                      className="text-stone hover:text-gold p-1 transition-colors"
                      title="Copy AWB Code"
                    >
                      {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                <div className="sm:border-l sm:border-border-faint sm:pl-4 flex flex-col justify-between">
                  <div>
                    <span className="text-[11px] uppercase tracking-wider text-stone block mb-1">
                      Estimated Delivery
                    </span>
                    <div className="flex items-center gap-1.5 text-gold font-medium text-base">
                      <Calendar className="w-4 h-4" />
                      {data.estimated_delivery_date
                        ? formatDate(data.estimated_delivery_date)
                        : "2-3 Business Days"}
                    </div>
                  </div>

                  <div className="mt-3 flex items-center gap-1.5 text-xs text-stone">
                    <MapPin className="w-3.5 h-3.5 text-gold" />
                    <span>Destination: </span>
                    <strong className="text-linen">{data.destination?.city || "Customer Address"}</strong>
                  </div>
                </div>
              </div>

              {/* Progress Bar Stepper */}
              <div className="bg-surface-1 border border-border-faint rounded-xl p-6">
                <div className="flex items-center justify-between text-xs text-stone mb-2">
                  <span className="font-medium text-linen">Transit Progress</span>
                  <span className="text-gold font-mono">{data.progress_percent}%</span>
                </div>
                <div className="w-full bg-surface-3 h-2 rounded-full overflow-hidden mb-6">
                  <div
                    className="bg-gold h-full transition-all duration-700 ease-out"
                    style={{ width: `${Math.max(10, data.progress_percent)}%` }}
                  />
                </div>

                {/* Milestones Vertical Timeline */}
                <div className="space-y-6 relative before:absolute before:inset-0 before:left-[15px] before:w-0.5 before:bg-border-subtle">
                  {data.checkpoints?.map((checkpoint, idx) => {
                    const isLast = idx === data.checkpoints.length - 1;
                    return (
                      <div key={idx} className="relative flex items-start gap-4 z-10">
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 border-2 transition-colors ${
                            checkpoint.is_current
                              ? "bg-gold border-gold text-obsidian shadow-lg shadow-gold/20"
                              : checkpoint.is_completed
                              ? "bg-emerald-500 border-emerald-500 text-obsidian"
                              : "bg-surface-2 border-border-subtle text-stone"
                          }`}
                        >
                          {checkpoint.is_completed ? (
                            <CheckCircle2 className="w-4 h-4" />
                          ) : (
                            <Clock className="w-4 h-4" />
                          )}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                            <h4
                              className={`text-sm font-medium ${
                                checkpoint.is_current ? "text-gold" : "text-linen"
                              }`}
                            >
                              {checkpoint.status_label}
                            </h4>
                            <span className="text-[11px] text-stone">
                              {formatDate(checkpoint.timestamp)}
                            </span>
                          </div>
                          <p className="text-xs text-stone mt-1">{checkpoint.activity}</p>
                          <div className="mt-1 flex items-center gap-1 text-[11px] text-[#888]">
                            <MapPin className="w-3 h-3 text-stone" />
                            <span>{checkpoint.location}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* ArtGuard™ Assurance Strip */}
              <div className="bg-surface-2/60 border border-gold/20 rounded-xl p-4 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-gold/10 flex items-center justify-center text-gold shrink-0">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <h5 className="text-xs font-medium text-linen">ArtGuard™ Protected Transit</h5>
                    <p className="text-[11px] text-stone">
                      Insured against transit damage with climate-sealed and edge-reinforced packaging.
                    </p>
                  </div>
                </div>
                {data.package_info?.is_fragile && (
                  <Badge variant="outline" className="border-gold/30 text-gold text-[10px] shrink-0">
                    FRAGILE ART
                  </Badge>
                )}
              </div>

              {/* Actions Footer */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                {data.tracking_url && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-border-subtle text-linen hover:bg-surface-2 hover:text-white text-xs gap-1.5"
                    onClick={() => window.open(data.tracking_url, "_blank")}
                  >
                    Carrier Portal <ExternalLink className="w-3 h-3" />
                  </Button>
                )}

                {/* Artist / Admin Simulation Controls (Demonstration) */}
                {isArtistOrAdmin && orderItemId && data.status !== "delivered" && (
                  <div className="flex items-center gap-2 ml-auto">
                    <span className="text-[11px] text-stone hidden sm:inline">Demo Next Step:</span>
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={isAdvancing}
                      className="border-gold/30 text-gold hover:bg-gold/10 text-xs gap-1"
                      onClick={() => {
                        const next =
                          data.status === "packed"
                            ? "picked_up"
                            : data.status === "shipped"
                            ? "out_for_delivery"
                            : "delivered";
                        advanceMilestone({ orderItemId, milestone: next as any });
                      }}
                    >
                      <Sparkles className="w-3 h-3 text-gold" />
                      Advance Milestone <ArrowRight className="w-3 h-3" />
                    </Button>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

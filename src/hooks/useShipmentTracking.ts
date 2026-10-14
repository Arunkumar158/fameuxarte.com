import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { trackShipment, simulateAdvanceMilestone, type TrackingData } from "@/lib/shipping";
import { toast } from "sonner";

export function useShipmentTracking(identifier: { awb_code?: string; order_item_id?: string }, enabled = true) {
  const queryClient = useQueryClient();
  const queryKey = ["shipment-tracking", identifier.awb_code || identifier.order_item_id];

  const query = useQuery<TrackingData>({
    queryKey,
    queryFn: () => trackShipment(identifier),
    enabled: enabled && Boolean(identifier.awb_code || identifier.order_item_id),
    refetchInterval: 30000, // Poll every 30s when open
  });

  const advanceMilestoneMutation = useMutation({
    mutationFn: async ({
      orderItemId,
      milestone,
    }: {
      orderItemId: string;
      milestone: "picked_up" | "in_transit" | "out_for_delivery" | "delivered";
    }) => {
      return await simulateAdvanceMilestone(orderItemId, milestone);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey });
      queryClient.invalidateQueries({ queryKey: ["artist-order-details"] });
      queryClient.invalidateQueries({ queryKey: ["collector-orders"] });
      queryClient.invalidateQueries({ queryKey: ["admin-orders"] });
      toast.success(`Shipment advanced to ${variables.milestone.replace(/_/g, " ").toUpperCase()}`);
    },
    onError: (err: any) => {
      toast.error(`Failed to advance milestone: ${err.message}`);
    },
  });

  return {
    ...query,
    advanceMilestone: advanceMilestoneMutation.mutate,
    isAdvancing: advanceMilestoneMutation.isPending,
  };
}

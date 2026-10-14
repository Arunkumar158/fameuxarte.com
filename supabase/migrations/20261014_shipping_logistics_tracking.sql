-- Migration: Shipping & Logistics Tracking Engine (Shiprocket / Delhivery integration)
-- Adds courier logistics, AWB management, package dimensions, and milestone tracking to order_items.

ALTER TABLE public.order_items
ADD COLUMN IF NOT EXISTS courier_provider text DEFAULT 'shiprocket',
ADD COLUMN IF NOT EXISTS awb_code text,
ADD COLUMN IF NOT EXISTS shipment_id text,
ADD COLUMN IF NOT EXISTS shipping_label_url text,
ADD COLUMN IF NOT EXISTS pickup_scheduled_date timestamptz,
ADD COLUMN IF NOT EXISTS estimated_delivery_date timestamptz,
ADD COLUMN IF NOT EXISTS current_location text,
ADD COLUMN IF NOT EXISTS current_status_description text,
ADD COLUMN IF NOT EXISTS tracking_history jsonb DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS package_weight_kg numeric(6, 2) DEFAULT 2.50,
ADD COLUMN IF NOT EXISTS package_length_cm numeric(6, 2),
ADD COLUMN IF NOT EXISTS package_width_cm numeric(6, 2),
ADD COLUMN IF NOT EXISTS package_height_cm numeric(6, 2),
ADD COLUMN IF NOT EXISTS is_fragile boolean DEFAULT true,
ADD COLUMN IF NOT EXISTS insurance_covered boolean DEFAULT true,
ADD COLUMN IF NOT EXISTS pickup_token_number text;

-- Create index on awb_code and shipment_id for fast logistics lookups
CREATE INDEX IF NOT EXISTS idx_order_items_awb_code ON public.order_items (awb_code);
CREATE INDEX IF NOT EXISTS idx_order_items_shipment_id ON public.order_items (shipment_id);

-- Create courier_serviceability cache table to cache pin-to-pin rates and prevent rate-limiting
CREATE TABLE IF NOT EXISTS public.courier_serviceability_cache (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    pickup_pincode text NOT NULL,
    delivery_pincode text NOT NULL,
    weight_kg numeric(6, 2) NOT NULL,
    available_couriers jsonb NOT NULL,
    created_at timestamptz DEFAULT now(),
    expires_at timestamptz DEFAULT (now() + interval '24 hours')
);

CREATE INDEX IF NOT EXISTS idx_courier_cache_lookup 
ON public.courier_serviceability_cache (pickup_pincode, delivery_pincode, weight_kg);

-- Enable RLS for courier cache
ALTER TABLE public.courier_serviceability_cache ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read access to courier cache" 
ON public.courier_serviceability_cache FOR SELECT USING (true);
CREATE POLICY "Service role insert to courier cache" 
ON public.courier_serviceability_cache FOR INSERT WITH CHECK (true);

COMMENT ON COLUMN public.order_items.courier_provider IS 'Courier platform or aggregator: shiprocket, delhivery, bluedart, etc.';
COMMENT ON COLUMN public.order_items.awb_code IS 'Air Waybill (AWB) number assigned by the courier partner';
COMMENT ON COLUMN public.order_items.tracking_history IS 'Detailed milestone checkpoints with timestamp, status, location, and activity';

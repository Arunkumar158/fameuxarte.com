-- Add fulfillment and payout fields to order_items
ALTER TABLE order_items
ADD COLUMN IF NOT EXISTS fulfillment_status text NOT NULL DEFAULT 'pending' CHECK (fulfillment_status IN ('pending', 'accepted', 'preparing', 'packed', 'shipped', 'delivered', 'completed', 'cancelled')),
ADD COLUMN IF NOT EXISTS shipping_provider text,
ADD COLUMN IF NOT EXISTS tracking_number text,
ADD COLUMN IF NOT EXISTS tracking_url text,
ADD COLUMN IF NOT EXISTS shipping_notes text,
ADD COLUMN IF NOT EXISTS accepted_at timestamptz,
ADD COLUMN IF NOT EXISTS preparing_at timestamptz,
ADD COLUMN IF NOT EXISTS packed_at timestamptz,
ADD COLUMN IF NOT EXISTS shipped_at timestamptz,
ADD COLUMN IF NOT EXISTS delivered_at timestamptz,
ADD COLUMN IF NOT EXISTS completed_at timestamptz,
ADD COLUMN IF NOT EXISTS cancelled_at timestamptz,
ADD COLUMN IF NOT EXISTS payout_status text NOT NULL DEFAULT 'pending' CHECK (payout_status IN ('pending', 'released', 'on_hold')),
ADD COLUMN IF NOT EXISTS payout_amount numeric,
ADD COLUMN IF NOT EXISTS payout_date timestamptz;

-- Notifications table
CREATE TABLE IF NOT EXISTS notifications (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    title text NOT NULL,
    message text NOT NULL,
    type text NOT NULL,
    read boolean NOT NULL DEFAULT false,
    metadata jsonb DEFAULT '{}'::jsonb,
    created_at timestamptz NOT NULL DEFAULT now()
);

-- RLS for notifications
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own notifications" ON notifications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update their own notifications" ON notifications FOR UPDATE USING (auth.uid() = user_id);

-- RLS for order_items
-- Since artists need to view and update their order items, we need policies.
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
-- Artists can see order items for artworks they created
CREATE POLICY "Artists can view their order items" ON order_items FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM artworks a
        WHERE a.id = order_items.artwork_id AND a.artist_id = auth.uid()
    )
);
-- Artists can update their order items (e.g. tracking, status)
CREATE POLICY "Artists can update their order items" ON order_items FOR UPDATE USING (
    EXISTS (
        SELECT 1 FROM artworks a
        WHERE a.id = order_items.artwork_id AND a.artist_id = auth.uid()
    )
);

-- RLS for orders (allowing artists to see the orders their items belong to)
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Artists can view orders containing their items" ON orders FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM order_items oi
        JOIN artworks a ON a.id = oi.artwork_id
        WHERE oi.order_id = orders.id AND a.artist_id = auth.uid()
    )
);

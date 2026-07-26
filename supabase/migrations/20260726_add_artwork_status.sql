-- Add status, sold_at, and sold_order_id columns to artworks table
ALTER TABLE artworks 
ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'available' CHECK (status IN ('available', 'sold', 'reserved')),
ADD COLUMN IF NOT EXISTS sold_at timestamptz NULL,
ADD COLUMN IF NOT EXISTS sold_order_id uuid NULL REFERENCES orders(id);

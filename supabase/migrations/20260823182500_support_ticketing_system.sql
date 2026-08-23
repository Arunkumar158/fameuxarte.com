-- Migration: Support Ticketing System V1

-- Create sequence for ticket numbers
CREATE SEQUENCE IF NOT EXISTS support_ticket_seq START 1;

-- 1. Create support_tickets table
CREATE TABLE IF NOT EXISTS public.support_tickets (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    ticket_number text NOT NULL UNIQUE DEFAULT 'FA-SUP-' || LPAD(nextval('support_ticket_seq')::text, 6, '0'),
    user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    subject text NOT NULL,
    category text NOT NULL CHECK (category IN ('ORDER', 'PAYMENT', 'SHIPPING', 'REFUND', 'ARTWORK', 'ARTIST', 'CERTIFICATE', 'ACCOUNT', 'OTHER')),
    priority text NOT NULL DEFAULT 'NORMAL' CHECK (priority IN ('LOW', 'NORMAL', 'HIGH', 'URGENT')),
    status text NOT NULL DEFAULT 'OPEN' CHECK (status IN ('OPEN', 'IN_PROGRESS', 'WAITING_FOR_CUSTOMER', 'RESOLVED', 'CLOSED')),
    order_id uuid REFERENCES public.orders(id) ON DELETE SET NULL,
    artwork_id uuid REFERENCES public.artworks(id) ON DELETE SET NULL,
    certificate_id uuid REFERENCES public.certificates(id) ON DELETE SET NULL,
    assigned_agent_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),
    resolved_at timestamptz,
    closed_at timestamptz,
    last_message_at timestamptz NOT NULL DEFAULT now()
);

-- 2. Create support_ticket_messages table
CREATE TABLE IF NOT EXISTS public.support_ticket_messages (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    ticket_id uuid NOT NULL REFERENCES public.support_tickets(id) ON DELETE CASCADE,
    sender_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    message text NOT NULL,
    is_internal boolean NOT NULL DEFAULT false,
    attachments text[] DEFAULT '{}',
    created_at timestamptz NOT NULL DEFAULT now()
);

-- 3. Indexes
CREATE INDEX IF NOT EXISTS idx_support_tickets_user_id ON public.support_tickets(user_id);
CREATE INDEX IF NOT EXISTS idx_support_tickets_status ON public.support_tickets(status);
CREATE INDEX IF NOT EXISTS idx_support_tickets_priority ON public.support_tickets(priority);
CREATE INDEX IF NOT EXISTS idx_support_tickets_assigned_agent_id ON public.support_tickets(assigned_agent_id);
CREATE INDEX IF NOT EXISTS idx_support_tickets_order_id ON public.support_tickets(order_id);
CREATE INDEX IF NOT EXISTS idx_support_tickets_artwork_id ON public.support_tickets(artwork_id);
CREATE INDEX IF NOT EXISTS idx_support_tickets_certificate_id ON public.support_tickets(certificate_id);
CREATE INDEX IF NOT EXISTS idx_support_tickets_created_at ON public.support_tickets(created_at);
CREATE INDEX IF NOT EXISTS idx_support_tickets_last_message_at ON public.support_tickets(last_message_at);

CREATE INDEX IF NOT EXISTS idx_support_ticket_messages_ticket_id ON public.support_ticket_messages(ticket_id);
CREATE INDEX IF NOT EXISTS idx_support_ticket_messages_created_at ON public.support_ticket_messages(created_at);

-- 4. Triggers for updated_at and last_message_at
CREATE OR REPLACE FUNCTION update_support_ticket_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    IF NEW.status = 'RESOLVED' AND OLD.status != 'RESOLVED' THEN
        NEW.resolved_at = now();
    END IF;
    IF NEW.status = 'CLOSED' AND OLD.status != 'CLOSED' THEN
        NEW.closed_at = now();
    END IF;
    
    -- Clear stale values if reopened
    IF NEW.status NOT IN ('RESOLVED', 'CLOSED') THEN
        NEW.resolved_at = NULL;
        NEW.closed_at = NULL;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_support_tickets_modtime
    BEFORE UPDATE ON public.support_tickets
    FOR EACH ROW
    EXECUTE FUNCTION update_support_ticket_timestamp();

CREATE OR REPLACE FUNCTION update_ticket_last_message_at()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE public.support_tickets
    SET last_message_at = NEW.created_at, updated_at = now()
    WHERE id = NEW.ticket_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_last_message_time
    AFTER INSERT ON public.support_ticket_messages
    FOR EACH ROW
    EXECUTE FUNCTION update_ticket_last_message_at();

-- 5. Trigger to strictly validate Customer UPDATEs
CREATE OR REPLACE FUNCTION check_customer_ticket_update()
RETURNS TRIGGER AS $$
BEGIN
    -- If admin, allow all
    IF EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin') THEN
        RETURN NEW;
    END IF;

    -- Customers cannot change core properties
    IF NEW.user_id != OLD.user_id OR
       NEW.ticket_number != OLD.ticket_number OR
       NEW.category != OLD.category OR
       NEW.priority != OLD.priority OR
       NEW.order_id IS DISTINCT FROM OLD.order_id OR
       NEW.artwork_id IS DISTINCT FROM OLD.artwork_id OR
       NEW.certificate_id IS DISTINCT FROM OLD.certificate_id OR
       NEW.assigned_agent_id IS DISTINCT FROM OLD.assigned_agent_id
    THEN
        RAISE EXCEPTION 'Customers are only allowed to update the ticket status.';
    END IF;

    -- Customers cannot set CLOSED
    IF NEW.status = 'CLOSED' AND OLD.status != 'CLOSED' THEN
        RAISE EXCEPTION 'Customers cannot close tickets. Use RESOLVED instead.';
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER enforce_customer_ticket_updates
    BEFORE UPDATE ON public.support_tickets
    FOR EACH ROW
    EXECUTE FUNCTION check_customer_ticket_update();

-- 6. RLS for support_tickets
ALTER TABLE public.support_tickets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins have full access to support tickets" 
ON public.support_tickets TO authenticated 
USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY "Users can view own tickets" 
ON public.support_tickets FOR SELECT TO authenticated 
USING (user_id = auth.uid());

CREATE POLICY "Users can create tickets" 
ON public.support_tickets FOR INSERT TO authenticated 
WITH CHECK (
    user_id = auth.uid() AND
    -- Ensure user owns order or is the artist of the order items
    (order_id IS NULL OR EXISTS (SELECT 1 FROM orders WHERE id = order_id AND user_id = auth.uid()) OR EXISTS (SELECT 1 FROM order_items oi JOIN artworks a ON a.id = oi.artwork_id WHERE oi.order_id = order_id AND a.artist_id = auth.uid())) AND
    -- Artworks are public, so existence is sufficient
    (artwork_id IS NULL OR EXISTS (SELECT 1 FROM artworks WHERE id = artwork_id)) AND
    -- Ensure user is collector or artist of the certificate
    (certificate_id IS NULL OR EXISTS (SELECT 1 FROM certificates WHERE id = certificate_id AND (collector_id = auth.uid() OR artist_id = auth.uid())))
);

CREATE POLICY "Users can update own tickets status" 
ON public.support_tickets FOR UPDATE TO authenticated 
USING (user_id = auth.uid()) 
WITH CHECK (
    user_id = auth.uid() AND 
    status IN ('OPEN', 'IN_PROGRESS', 'WAITING_FOR_CUSTOMER', 'RESOLVED')
);

-- 7. RLS for support_ticket_messages
ALTER TABLE public.support_ticket_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins have full access to ticket messages" 
ON public.support_ticket_messages TO authenticated 
USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY "Users can view own non-internal messages" 
ON public.support_ticket_messages FOR SELECT TO authenticated 
USING (
    is_internal = false AND
    EXISTS (SELECT 1 FROM support_tickets WHERE id = ticket_id AND user_id = auth.uid())
);

CREATE POLICY "Users can insert non-internal messages" 
ON public.support_ticket_messages FOR INSERT TO authenticated 
WITH CHECK (
    sender_id = auth.uid() AND
    is_internal = false AND
    EXISTS (SELECT 1 FROM support_tickets WHERE id = ticket_id AND user_id = auth.uid())
);

-- 8. Storage bucket setup
INSERT INTO storage.buckets (id, name, public) 
VALUES ('support_attachments', 'support_attachments', false)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Admins can access support attachments" 
ON storage.objects TO authenticated 
USING (
    bucket_id = 'support_attachments' AND 
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
)
WITH CHECK (
    bucket_id = 'support_attachments' AND 
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

CREATE POLICY "Users can view own support attachments" 
ON storage.objects FOR SELECT TO authenticated 
USING (
    bucket_id = 'support_attachments' AND 
    EXISTS (
        SELECT 1 FROM support_tickets 
        WHERE id::text = split_part(name, '/', 1) AND user_id = auth.uid()
    )
);

CREATE POLICY "Users can upload own support attachments" 
ON storage.objects FOR INSERT TO authenticated 
WITH CHECK (
    bucket_id = 'support_attachments' AND 
    EXISTS (
        SELECT 1 FROM support_tickets 
        WHERE id::text = split_part(name, '/', 1) AND user_id = auth.uid()
    )
);

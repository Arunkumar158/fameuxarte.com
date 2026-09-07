import React, { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Send, ArrowLeft, Loader2, AlertCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

const AVAILABLE_TEMPLATES = [
  { id: "artist_application_received", name: "Artist Application Received", defaultVars: { artist_name: "Test Artist", dashboard_url: "https://fameuxarte.com/artist" } },
  { id: "artist_verification_approved", name: "Artist Verification Approved", defaultVars: { artist_name: "Test Artist", dashboard_url: "https://fameuxarte.com/artist" } },
  { id: "artist_verification_rejected", name: "Artist Verification Rejected", defaultVars: { artist_name: "Test Artist", reason: "Blurry identity document", action_required: "Please resubmit a clear photo", dashboard_url: "https://fameuxarte.com/artist/verification" } },
  { id: "artwork_submitted", name: "Artwork Submitted", defaultVars: { artist_name: "Test Artist", artwork_title: "Test Masterpiece", dashboard_url: "https://fameuxarte.com/artist" } },
  { id: "artwork_sold", name: "Artwork Sold", defaultVars: { artist_name: "Test Artist", artwork_title: "Test Masterpiece", order_reference: "ORD-12345", sale_amount: "₹50,000", dashboard_url: "https://fameuxarte.com/artist/orders" } },
  { id: "order_confirmation", name: "Order Confirmation", defaultVars: { customer_name: "Test Customer", order_number: "ORD-12345", order_date: new Date().toLocaleDateString('en-IN'), order_url: "https://fameuxarte.com/collector/orders", order_total: "₹50,000", subtotal: "₹50,000", shipping_fee: "Free", payment_status: "Paid", artworks: [{ artwork_title: "Test Masterpiece", artist_name: "Test Artist", quantity: 1, price: "₹50,000" }], shipping_address: "123 Test St, Test City, TS 12345" } },
  { id: "order_shipped", name: "Order Shipped", defaultVars: { customer_name: "Test Customer", order_number: "ORD-12345", carrier: "FedEx", tracking_number: "FX123456789", tracking_url: "https://fedex.com", estimated_delivery: "Tomorrow", artwork_title: "Test Masterpiece", order_url: "https://fameuxarte.com/collector/orders" } },
  { id: "order_delivered", name: "Order Delivered", defaultVars: { customer_name: "Test Customer", order_number: "ORD-12345", delivered_at: new Date().toLocaleDateString('en-IN'), artwork_title: "Test Masterpiece", order_url: "https://fameuxarte.com/collector/orders" } },
  { id: "payment_success", name: "Payment Success", defaultVars: { customer_name: "Test Customer", order_number: "ORD-12345", amount_paid: "₹50,000", payment_date: new Date().toLocaleDateString('en-IN'), order_url: "https://fameuxarte.com/collector/orders" } },
  { id: "support_reply", name: "Support Reply", defaultVars: { customer_name: "Test Customer", ticket_number: "TKT-123", ticket_subject: "Where is my order?", reply_snippet: "Your order has been shipped and should arrive tomorrow.", ticket_url: "https://fameuxarte.com/collector/support/123" } },
  { id: "newsletter", name: "Newsletter (Marketing)", defaultVars: { subscriber_name: "Test Subscriber", subject: "Fameuxarte Spring Collection", preview_text: "Discover the newest arrivals.", hero_image_url: "https://images.unsplash.com/photo-1547826039-bfc35e0f1ea8", headline: "Spring Collection is Here", body_html: "<p>Welcome to our new collection!</p>", cta_text: "View Collection", cta_url: "https://fameuxarte.com" } }
];

export default function EmailTesting() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    to: user?.email || "",
    template: "order_confirmation",
    variables: JSON.stringify(AVAILABLE_TEMPLATES.find(t => t.id === "order_confirmation")?.defaultVars, null, 2)
  });

  const handleTemplateChange = (val: string) => {
    const tmpl = AVAILABLE_TEMPLATES.find(t => t.id === val);
    if (tmpl) {
      setFormData({
        ...formData,
        template: val,
        variables: JSON.stringify(tmpl.defaultVars, null, 2)
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      let vars = {};
      try {
        vars = JSON.parse(formData.variables);
      } catch (err) {
        toast.error("Invalid JSON variables");
        setIsSubmitting(false);
        return;
      }

      const { data: { session } } = await supabase.auth.getSession();
      
      const res = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/send-email`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${session?.access_token}`
        },
        body: JSON.stringify({
          type: formData.template,
          to: formData.to,
          idempotencyKey: `test_${formData.template}_${Date.now()}`,
          variables: vars,
          _test: true // Marks as test in DB
        })
      });

      const responseData = await res.json();
      
      if (!res.ok) {
        throw new Error(responseData.error || "Failed to send email");
      }

      toast.success("Test email sent successfully!");
      navigate("/admin/communications/logs");
    } catch (err: any) {
      toast.error(err.message || "An error occurred");
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div className="flex items-center gap-4">
        <Link to="/admin/communications/logs">
          <Button variant="ghost" size="icon" className="text-stone hover:text-linen">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-medium tracking-tight text-linen">Send Test Email</h1>
          <p className="text-stone mt-1">Trigger transactional and marketing email templates for testing.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 bg-surface-1 p-6 rounded-xl border border-border-subtle">
        <div className="space-y-2">
          <label className="text-sm font-medium text-linen">Recipient Email</label>
          <Input 
            required
            type="email"
            value={formData.to}
            onChange={(e) => setFormData({...formData, to: e.target.value})}
            className="bg-surface-2 border-border-strong text-linen"
            placeholder="test@example.com"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-linen">Template</label>
          <Select value={formData.template} onValueChange={handleTemplateChange}>
            <SelectTrigger className="bg-surface-2 border-border-strong text-linen">
              <SelectValue placeholder="Select template" />
            </SelectTrigger>
            <SelectContent className="bg-surface-2 border-border-strong text-linen max-h-64">
              {AVAILABLE_TEMPLATES.map(t => (
                <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-linen">Variables (JSON)</label>
          <p className="text-xs text-stone">Provide the required variables for this template as JSON.</p>
          <Textarea 
            required
            value={formData.variables}
            onChange={(e) => setFormData({...formData, variables: e.target.value})}
            className="font-mono text-sm min-h-[250px] bg-obsidian border-border-strong text-linen"
          />
        </div>

        <div className="pt-4 border-t border-border-faint flex justify-end">
          <Button 
            type="submit" 
            disabled={isSubmitting}
            className="bg-gold text-obsidian hover:bg-gold/90 min-w-[150px]"
          >
            {isSubmitting ? (
              <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Sending...</>
            ) : (
              <><Send className="w-4 h-4 mr-2" /> Send Test Email</>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}

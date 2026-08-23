import React, { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { format } from "date-fns";
import { ArrowLeft, Send, ShieldCheck, ShoppingBag, Image as ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

const SupportTicketDetails = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [replyMessage, setReplyMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: ticket, isLoading: ticketLoading } = useQuery({
    queryKey: ["support-ticket", id],
    queryFn: async () => {
      if (!user || !id) return null;
      const { data, error } = await supabase
        .from("support_tickets")
        .select("*, orders(total_amount, status), artworks(title), certificates(certificate_number)")
        .eq("id", id)
        .eq("user_id", user.id)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!user && !!id,
  });

  const { data: messages, isLoading: messagesLoading } = useQuery({
    queryKey: ["support-messages", id],
    queryFn: async () => {
      if (!user || !id) return [];
      const { data, error } = await supabase
        .from("support_ticket_messages")
        .select("*, profiles:sender_id(full_name, role)")
        .eq("ticket_id", id)
        .eq("is_internal", false)
        .order("created_at", { ascending: true });
      if (error) throw error;
      return data;
    },
    enabled: !!user && !!id,
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "OPEN": return "bg-blue-500/10 text-blue-500 border-blue-500/20";
      case "IN_PROGRESS": return "bg-gold/10 text-gold border-gold/20";
      case "WAITING_FOR_CUSTOMER": return "bg-orange-500/10 text-orange-500 border-orange-500/20";
      case "RESOLVED": return "bg-green-500/10 text-green-500 border-green-500/20";
      case "CLOSED": return "bg-stone/10 text-stone border-stone/20";
      default: return "bg-stone/10 text-stone border-stone/20";
    }
  };

  const handleReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyMessage.trim() || !user || !id) return;
    
    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from("support_ticket_messages")
        .insert([
          {
            ticket_id: id,
            sender_id: user.id,
            message: replyMessage.trim(),
            is_internal: false,
          },
        ]);

      if (error) throw error;

      toast({
        title: "Reply sent",
        description: "Your message has been added to the ticket.",
      });
      setReplyMessage("");
      queryClient.invalidateQueries({ queryKey: ["support-messages", id] });
      queryClient.invalidateQueries({ queryKey: ["support-tickets"] });
    } catch (error: any) {
      console.error("Error sending reply:", error);
      toast({
        title: "Failed to send reply",
        description: error.message || "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleMarkResolved = async () => {
    if (!user || !id) return;
    try {
      const { error } = await supabase
        .from("support_tickets")
        .update({ status: "RESOLVED" })
        .eq("id", id)
        .eq("user_id", user.id);
        
      if (error) throw error;
      
      toast({
        title: "Ticket resolved",
        description: "Thank you for confirming the issue is resolved.",
      });
      queryClient.invalidateQueries({ queryKey: ["support-ticket", id] });
      queryClient.invalidateQueries({ queryKey: ["support-tickets"] });
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to update ticket status",
        variant: "destructive",
      });
    }
  };

  if (ticketLoading || messagesLoading) {
    return (
      <div className="flex justify-center p-12">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-gold"></div>
      </div>
    );
  }

  if (!ticket) {
    return (
      <div className="text-center p-12 bg-surface rounded-xl border border-border-subtle">
        <h3 className="text-lg font-medium text-linen mb-2">Ticket not found</h3>
        <p className="text-stone mb-6">The ticket you are looking for does not exist or you don't have permission to view it.</p>
        <Link to="/collector/support">
          <Button className="bg-gold text-obsidian hover:bg-gold-light">Back to Support</Button>
        </Link>
      </div>
    );
  }

  const isClosedOrResolved = ticket.status === "CLOSED" || ticket.status === "RESOLVED";

  return (
    <div className="space-y-6">
      <div>
        <Link to="/collector/support" className="inline-flex items-center text-sm text-stone hover:text-gold mb-4 transition-colors">
          <ArrowLeft className="w-4 h-4 mr-1" />
          Back to Tickets
        </Link>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <span className="text-sm font-medium text-gold font-mono">{ticket.ticket_number}</span>
              <Badge variant="outline" className={getStatusColor(ticket.status)}>
                {ticket.status.replace(/_/g, ' ')}
              </Badge>
            </div>
            <h1 className="text-2xl font-serif text-linen">{ticket.subject}</h1>
          </div>
          {!isClosedOrResolved && (
            <Button onClick={handleMarkResolved} variant="outline" className="border-border-subtle text-linen hover:bg-surface-2 hover:text-green-500">
              Mark as Resolved
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-surface rounded-xl border border-border-subtle overflow-hidden flex flex-col">
            <div className="p-4 sm:p-6 space-y-6 max-h-[60vh] overflow-y-auto">
              {messages?.map((msg: any) => {
                const isAgent = msg.profiles?.role === "admin" || msg.profiles?.role === "support";
                const isCustomer = msg.sender_id === user?.id;
                
                return (
                  <div key={msg.id} className={`flex gap-4 ${isCustomer ? "flex-row-reverse" : ""}`}>
                    <Avatar className={`w-8 h-8 ${isAgent ? "bg-gold/20" : "bg-surface-2"}`}>
                      <AvatarFallback className={isAgent ? "text-gold" : "text-stone"}>
                        {isAgent ? "FA" : (msg.profiles?.full_name?.[0] || "U")}
                      </AvatarFallback>
                    </Avatar>
                    <div className={`flex flex-col ${isCustomer ? "items-end" : "items-start"} max-w-[80%]`}>
                      <span className="text-xs text-stone mb-1 flex items-center gap-2">
                        {isAgent ? "Fameuxarte Support" : "You"}
                        <span className="opacity-50">•</span>
                        {format(new Date(msg.created_at), "MMM d, h:mm a")}
                      </span>
                      <div className={`p-3 rounded-lg text-sm whitespace-pre-wrap ${
                        isCustomer 
                          ? "bg-gold text-obsidian rounded-tr-none" 
                          : "bg-surface-2 text-linen border border-border-subtle rounded-tl-none"
                      }`}>
                        {msg.message}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            
            <div className="p-4 border-t border-border-subtle bg-obsidian">
              {isClosedOrResolved ? (
                <div className="text-center p-4 bg-surface-2 rounded-lg text-stone text-sm">
                  This ticket has been {ticket.status.toLowerCase()}. You can no longer reply.
                </div>
              ) : (
                <form onSubmit={handleReply} className="flex gap-2">
                  <Textarea 
                    value={replyMessage}
                    onChange={(e) => setReplyMessage(e.target.value)}
                    placeholder="Type your reply here..." 
                    className="min-h-[80px] bg-surface text-linen border-border-subtle focus-visible:ring-gold resize-y"
                  />
                  <Button 
                    type="submit"
                    disabled={!replyMessage.trim() || isSubmitting}
                    className="bg-gold text-obsidian hover:bg-gold-light self-end"
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                </form>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="bg-surface rounded-xl border border-border-subtle p-5">
            <h3 className="text-sm font-medium uppercase tracking-wider text-stone mb-4">Ticket Details</h3>
            <dl className="space-y-3 text-sm">
              <div>
                <dt className="text-stone">Created</dt>
                <dd className="text-linen">{format(new Date(ticket.created_at), "MMM d, yyyy")}</dd>
              </div>
              <div>
                <dt className="text-stone">Category</dt>
                <dd className="text-linen">{ticket.category}</dd>
              </div>
              <div>
                <dt className="text-stone">Priority</dt>
                <dd className="text-linen">{ticket.priority}</dd>
              </div>
            </dl>
          </div>

          {(ticket.order_id || ticket.artwork_id || ticket.certificate_id) && (
            <div className="bg-surface rounded-xl border border-border-subtle p-5">
              <h3 className="text-sm font-medium uppercase tracking-wider text-stone mb-4">Related Context</h3>
              <div className="space-y-4 text-sm">
                {ticket.order_id && ticket.orders && (
                  <div>
                    <dt className="flex items-center gap-2 text-stone mb-1">
                      <ShoppingBag className="w-3 h-3" /> Order
                    </dt>
                    <dd className="text-linen">
                      <Link to={`/collector/orders`} className="text-gold hover:underline">
                        View Order
                      </Link>
                      <div className="text-xs text-stone mt-1">Status: {ticket.orders.status}</div>
                    </dd>
                  </div>
                )}
                
                {ticket.artwork_id && ticket.artworks && (
                  <div>
                    <dt className="flex items-center gap-2 text-stone mb-1">
                      <ImageIcon className="w-3 h-3" /> Artwork
                    </dt>
                    <dd className="text-linen">
                      <span className="font-medium">{ticket.artworks.title}</span>
                    </dd>
                  </div>
                )}
                
                {ticket.certificate_id && ticket.certificates && (
                  <div>
                    <dt className="flex items-center gap-2 text-stone mb-1">
                      <ShieldCheck className="w-3 h-3" /> Certificate
                    </dt>
                    <dd className="text-linen">
                      {ticket.certificates.certificate_number}
                    </dd>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SupportTicketDetails;

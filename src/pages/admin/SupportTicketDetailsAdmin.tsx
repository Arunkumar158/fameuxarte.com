import React, { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { format } from "date-fns";
import { ArrowLeft, Send, ShieldCheck, ShoppingBag, Image as ImageIcon, Lock, User as UserIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { notifyUser } from "@/lib/notifications";

const SupportTicketDetailsAdmin = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [replyMessage, setReplyMessage] = useState("");
  const [isInternal, setIsInternal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: ticket, isLoading: ticketLoading } = useQuery({
    queryKey: ["admin-support-ticket", id],
    queryFn: async () => {
      if (!id) return null;
      const { data, error } = await supabase
        .from("support_tickets")
        .select("*, profiles!user_id(full_name, role), orders(total_amount, status), artworks(title), certificates(certificate_number)")
        .eq("id", id)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });

  const { data: messages, isLoading: messagesLoading } = useQuery({
    queryKey: ["admin-support-messages", id],
    queryFn: async () => {
      if (!id) return [];
      const { data, error } = await supabase
        .from("support_ticket_messages")
        .select("*, profiles:sender_id(full_name, role)")
        .eq("ticket_id", id)
        .order("created_at", { ascending: true });
      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "OPEN": return "bg-blue-500/10 text-blue-500 border-blue-500/20";
      case "IN_PROGRESS": return "bg-gold/10 text-gold border-gold/20";
      case "WAITING_FOR_CUSTOMER": return "bg-orange-500/10 text-orange-500 border-orange-500/20";
      case "RESOLVED": return "bg-green-500/10 text-green-500 border-green-500/20";
      case "CLOSED": return "bg-stone/10 text-slate-500 border-stone/20";
      default: return "bg-stone/10 text-slate-500 border-stone/20";
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
            is_internal: isInternal,
          },
        ]);

      if (error) throw error;

      // Also automatically update status if it's OPEN and we send a public reply
      if (ticket?.status === "OPEN" && !isInternal) {
        await handleStatusChange("IN_PROGRESS");
      }

      // Send notification to customer if it's a public reply
      if (!isInternal && ticket?.user_id) {
        await notifyUser({
          userId: ticket.user_id,
          type: 'SUPPORT_REPLY',
          title: 'New Reply to Your Support Ticket',
          message: `An agent has replied to your ticket: ${ticket.subject}`,
          priority: 'normal',
          metadata: {
            ticket_id: ticket.id,
            ticket_number: ticket.ticket_number,
            url: `/collector/support/${ticket.id}`,
          },
        });

        // Trigger email
        try {
          const { data: { session } } = await supabase.auth.getSession();
          if (session?.access_token) {
            await supabase.functions.invoke('send-email', {
              body: {
                type: "support_reply",
                // to is auto-resolved
                idempotencyKey: `support_reply:${id}:${Date.now()}`,
                relatedUserId: ticket.user_id,
                relatedTicketId: ticket.id,
                variables: {
                  customer_name: ticket.profiles?.full_name || "Customer",
                  ticket_number: ticket.ticket_number,
                  ticket_subject: ticket.subject,
                  reply_snippet: replyMessage.trim().substring(0, 100) + (replyMessage.length > 100 ? "..." : ""),
                  ticket_url: `https://fameuxarte.com/collector/support/${ticket.id}`
                }
              }
            });
          }
        } catch (e) {
          console.error("Failed to send support_reply email:", e);
        }
      }

      toast({
        title: "Reply sent",
        description: isInternal ? "Internal note added." : "Reply sent to customer.",
      });
      setReplyMessage("");
      setIsInternal(false);
      queryClient.invalidateQueries({ queryKey: ["admin-support-messages", id] });
      queryClient.invalidateQueries({ queryKey: ["admin-support-tickets"] });
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

  const handleStatusChange = async (newStatus: string) => {
    if (!id) return;
    try {
      const { error } = await supabase
        .from("support_tickets")
        .update({ status: newStatus })
        .eq("id", id);
        
      if (error) throw error;
      
      if (ticket?.user_id && newStatus !== ticket.status) {
        await notifyUser({
          userId: ticket.user_id,
          type: 'SUPPORT_STATUS',
          title: 'Ticket Status Updated',
          message: `Your ticket ${ticket.ticket_number} has been marked as ${newStatus.replace(/_/g, ' ')}.`,
          priority: 'normal',
          metadata: {
            ticket_id: id,
            ticket_number: ticket.ticket_number,
            url: `/collector/support/${id}`,
          },
        });

        // Trigger email if resolved/closed
        if (newStatus === "RESOLVED" || newStatus === "CLOSED") {
          try {
            const { data: { session } } = await supabase.auth.getSession();
            if (session?.access_token) {
              await supabase.functions.invoke('send-email', {
                body: {
                  type: "support_ticket_resolved",
                  // to is auto-resolved
                  idempotencyKey: `support_resolved:${id}:${Date.now()}`,
                  relatedUserId: ticket.user_id,
                  relatedTicketId: ticket.id,
                  variables: {
                    customer_name: ticket.profiles?.full_name || "Customer",
                    ticket_number: ticket.ticket_number,
                    ticket_subject: ticket.subject,
                    ticket_url: `https://fameuxarte.com/collector/support/${ticket.id}`
                  }
                }
              });
            }
          } catch (e) {
            console.error("Failed to send support_ticket_resolved email:", e);
          }
        }
      }
      
      toast({
        title: "Status updated",
        description: `Ticket marked as ${newStatus.replace(/_/g, ' ')}.`,
      });
      queryClient.invalidateQueries({ queryKey: ["admin-support-ticket", id] });
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to update ticket status",
        variant: "destructive",
      });
    }
  };

  const handlePriorityChange = async (newPriority: string) => {
    if (!id) return;
    try {
      const { error } = await supabase
        .from("support_tickets")
        .update({ priority: newPriority })
        .eq("id", id);
        
      if (error) throw error;
      
      toast({
        title: "Priority updated",
        description: `Priority changed to ${newPriority}.`,
      });
      queryClient.invalidateQueries({ queryKey: ["admin-support-ticket", id] });
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to update priority",
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
      <div className="text-center p-12 bg-white rounded-xl border border-slate-200">
        <h3 className="text-lg font-medium text-slate-900 mb-2">Ticket not found</h3>
        <Link to="/admin/support">
          <Button className="bg-gold text-obsidian hover:bg-gold-light">Back to Support Center</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-20">
      <div>
        <Link to="/admin/support" className="inline-flex items-center text-sm text-slate-500 hover:text-gold mb-4 transition-colors">
          <ArrowLeft className="w-4 h-4 mr-1" />
          Back to Tickets
        </Link>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <span className="text-sm font-medium text-gold font-mono">{ticket.ticket_number}</span>
              <Badge variant="outline" className={getStatusColor(ticket.status)}>
                {ticket.status.replace(/_/g, ' ')}
              </Badge>
              <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                ticket.priority === 'URGENT' ? 'bg-red-500/10 text-red-500' :
                ticket.priority === 'HIGH' ? 'bg-orange-500/10 text-orange-500' :
                ticket.priority === 'NORMAL' ? 'bg-blue-500/10 text-blue-500' :
                'bg-stone/10 text-slate-500'
              }`}>
                {ticket.priority} Priority
              </span>
            </div>
            <h1 className="text-2xl font-serif text-slate-900">{ticket.subject}</h1>
          </div>
          
          <div className="flex items-center gap-3">
            <Select value={ticket.status} onValueChange={handleStatusChange}>
              <SelectTrigger className="w-[180px] bg-white border-slate-200 text-slate-900 focus:ring-gold">
                <SelectValue placeholder="Change status" />
              </SelectTrigger>
              <SelectContent className="bg-white border-slate-200 text-slate-900">
                <SelectItem value="OPEN">Open</SelectItem>
                <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                <SelectItem value="WAITING_FOR_CUSTOMER">Waiting for Customer</SelectItem>
                <SelectItem value="RESOLVED">Resolved</SelectItem>
                <SelectItem value="CLOSED">Closed</SelectItem>
              </SelectContent>
            </Select>

            <Select value={ticket.priority} onValueChange={handlePriorityChange}>
              <SelectTrigger className="w-[140px] bg-white border-slate-200 text-slate-900 focus:ring-gold">
                <SelectValue placeholder="Change priority" />
              </SelectTrigger>
              <SelectContent className="bg-white border-slate-200 text-slate-900">
                <SelectItem value="LOW">Low</SelectItem>
                <SelectItem value="NORMAL">Normal</SelectItem>
                <SelectItem value="HIGH">High</SelectItem>
                <SelectItem value="URGENT">Urgent</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden flex flex-col">
            <div className="p-4 sm:p-6 space-y-6 max-h-[60vh] overflow-y-auto">
              {messages?.map((msg: any) => {
                const isCustomer = msg.profiles?.role !== "admin" && msg.profiles?.role !== "support";
                const isInternalNote = msg.is_internal;
                
                return (
                  <div key={msg.id} className={`flex gap-4 ${isCustomer ? "flex-row-reverse" : ""}`}>
                    <Avatar className={`w-8 h-8 ${isInternalNote ? "bg-amber-500/20" : isCustomer ? "bg-slate-50" : "bg-gold/20"}`}>
                      <AvatarFallback className={isInternalNote ? "text-amber-500" : isCustomer ? "text-slate-500" : "text-gold"}>
                        {isInternalNote ? <Lock className="w-4 h-4" /> : isCustomer ? (msg.profiles?.full_name?.[0] || "U") : "FA"}
                      </AvatarFallback>
                    </Avatar>
                    <div className={`flex flex-col ${isCustomer ? "items-end" : "items-start"} max-w-[80%]`}>
                      <span className="text-xs text-slate-500 mb-1 flex items-center gap-2">
                        {isInternalNote ? "Internal Note" : isCustomer ? "Customer" : "Agent"}
                        <span className="opacity-50">•</span>
                        {msg.profiles?.full_name || "Unknown"}
                        <span className="opacity-50">•</span>
                        {format(new Date(msg.created_at), "MMM d, h:mm a")}
                      </span>
                      <div className={`p-3 rounded-lg text-sm whitespace-pre-wrap ${
                        isInternalNote
                          ? "bg-amber-500/10 text-amber-500 border border-amber-500/20 rounded-tl-none"
                          : isCustomer 
                            ? "bg-slate-50 text-slate-900 border border-slate-200 rounded-tr-none" 
                            : "bg-gold text-obsidian rounded-tl-none"
                      }`}>
                        {msg.message}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            
            <div className={`p-4 border-t ${isInternal ? "border-amber-500/30 bg-amber-500/5" : "border-slate-200 bg-slate-100"}`}>
              <form onSubmit={handleReply} className="space-y-3">
                <div className="flex items-center space-x-2 px-1">
                  <Checkbox 
                    id="internal-note" 
                    checked={isInternal}
                    onCheckedChange={(checked) => setIsInternal(checked as boolean)}
                    className="border-stone data-[state=checked]:bg-amber-500 data-[state=checked]:border-amber-500"
                  />
                  <Label 
                    htmlFor="internal-note" 
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-slate-500 flex items-center gap-1 cursor-pointer"
                  >
                    <Lock className="w-3 h-3" />
                    Internal Note (Hidden from Customer)
                  </Label>
                </div>
                
                <div className="flex gap-2">
                  <Textarea 
                    value={replyMessage}
                    onChange={(e) => setReplyMessage(e.target.value)}
                    placeholder={isInternal ? "Write a private note for staff..." : "Write a reply to the customer..."} 
                    className={`min-h-[100px] text-slate-900 focus-visible:ring-gold resize-y ${
                      isInternal ? "bg-amber-500/10 border-amber-500/30 placeholder:text-amber-500/50" : "bg-white border-slate-200"
                    }`}
                  />
                </div>
                
                <div className="flex justify-end">
                  <Button 
                    type="submit"
                    disabled={!replyMessage.trim() || isSubmitting}
                    className={isInternal ? "bg-amber-500 text-obsidian hover:bg-amber-600" : "bg-gold text-obsidian hover:bg-gold-light"}
                  >
                    <Send className="w-4 h-4 mr-2" />
                    {isSubmitting ? "Sending..." : isInternal ? "Save Internal Note" : "Send Reply"}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-slate-200 p-5">
            <h3 className="text-sm font-medium uppercase tracking-wider text-slate-500 mb-4">Customer Info</h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <Avatar className="w-10 h-10 bg-slate-50 border border-slate-200">
                  <AvatarFallback className="text-slate-500">
                    <UserIcon className="w-5 h-5" />
                  </AvatarFallback>
                </Avatar>
                <div>
                  <div className="text-sm font-medium text-slate-900">
                    {ticket.profiles?.full_name || "Unknown"}
                  </div>
                  <div className="text-xs text-gold capitalize mt-0.5">{ticket.profiles?.role}</div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl border border-slate-200 p-5">
            <h3 className="text-sm font-medium uppercase tracking-wider text-slate-500 mb-4">Ticket Details</h3>
            <dl className="space-y-3 text-sm">
              <div>
                <dt className="text-slate-500">Created</dt>
                <dd className="text-slate-900">{format(new Date(ticket.created_at), "MMM d, yyyy HH:mm")}</dd>
              </div>
              <div>
                <dt className="text-slate-500">Category</dt>
                <dd className="text-slate-900">{ticket.category}</dd>
              </div>
            </dl>
          </div>

          {(ticket.order_id || ticket.artwork_id || ticket.certificate_id) && (
            <div className="bg-white rounded-xl border border-slate-200 p-5">
              <h3 className="text-sm font-medium uppercase tracking-wider text-slate-500 mb-4">Related Context</h3>
              <div className="space-y-4 text-sm">
                {ticket.order_id && ticket.orders && (
                  <div>
                    <dt className="flex items-center gap-2 text-slate-500 mb-1">
                      <ShoppingBag className="w-3 h-3" /> Order
                    </dt>
                    <dd className="text-slate-900">
                      <Link to={`/admin/orders/${ticket.order_id}`} className="text-gold hover:underline font-mono text-xs">
                        {ticket.order_id.substring(0, 8)}...
                      </Link>
                      <div className="text-xs text-slate-500 mt-1">Status: {ticket.orders.status}</div>
                    </dd>
                  </div>
                )}
                
                {ticket.artwork_id && ticket.artworks && (
                  <div>
                    <dt className="flex items-center gap-2 text-slate-500 mb-1">
                      <ImageIcon className="w-3 h-3" /> Artwork
                    </dt>
                    <dd className="text-slate-900">
                      <span className="font-medium">{ticket.artworks.title}</span>
                    </dd>
                  </div>
                )}
                
                {ticket.certificate_id && ticket.certificates && (
                  <div>
                    <dt className="flex items-center gap-2 text-slate-500 mb-1">
                      <ShieldCheck className="w-3 h-3" /> Certificate
                    </dt>
                    <dd className="text-slate-900 font-mono text-xs text-gold">
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

export default SupportTicketDetailsAdmin;

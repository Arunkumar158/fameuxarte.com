import React from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { format } from "date-fns";
import { MessageSquare, Plus, Clock, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { CreateTicketDialog } from "@/components/support/CreateTicketDialog";

const SupportTickets = () => {
  const { user } = useAuth();
  const [isCreateOpen, setIsCreateOpen] = React.useState(false);
  const [search, setSearch] = React.useState("");

  const { data: tickets, isLoading } = useQuery({
    queryKey: ["support-tickets", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from("support_tickets")
        .select("*")
        .eq("user_id", user.id)
        .order("last_message_at", { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!user,
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

  const filteredTickets = tickets?.filter(t => 
    t.ticket_number.toLowerCase().includes(search.toLowerCase()) || 
    t.subject.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-serif text-linen">Help & Support</h1>
          <p className="text-sm text-stone mt-1">Manage your support tickets and conversations.</p>
        </div>
        <Button 
          onClick={() => setIsCreateOpen(true)}
          className="bg-gold text-obsidian hover:bg-gold-light"
        >
          <Plus className="w-4 h-4 mr-2" />
          New Ticket
        </Button>
      </div>

      <div className="flex items-center space-x-2 bg-surface-2 p-2 rounded-lg border border-border-subtle max-w-md">
        <Search className="w-4 h-4 text-stone ml-2" />
        <Input 
          placeholder="Search tickets..." 
          className="bg-transparent border-none text-linen focus-visible:ring-0 px-2"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {isLoading ? (
        <div className="flex justify-center p-12">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-gold"></div>
        </div>
      ) : filteredTickets?.length === 0 ? (
        <div className="text-center p-12 bg-surface rounded-xl border border-border-subtle">
          <MessageSquare className="w-12 h-12 text-stone mx-auto mb-4 opacity-50" />
          <h3 className="text-lg font-medium text-linen mb-2">No tickets found</h3>
          <p className="text-stone mb-6 max-w-sm mx-auto">
            {search ? "No tickets match your search." : "You haven't created any support tickets yet."}
          </p>
          {!search && (
            <Button onClick={() => setIsCreateOpen(true)} variant="outline" className="border-gold text-gold hover:bg-gold/10">
              Create your first ticket
            </Button>
          )}
        </div>
      ) : (
        <div className="bg-surface rounded-xl border border-border-subtle overflow-hidden">
          <div className="divide-y divide-border-subtle">
            {filteredTickets?.map((ticket) => (
              <Link 
                key={ticket.id} 
                to={`/collector/support/${ticket.id}`}
                className="block p-4 sm:p-6 hover:bg-surface-2 transition-colors group"
              >
                <div className="flex flex-col sm:flex-row justify-between gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-medium text-gold font-mono">
                        {ticket.ticket_number}
                      </span>
                      <Badge variant="outline" className={getStatusColor(ticket.status)}>
                        {ticket.status.replace(/_/g, ' ')}
                      </Badge>
                    </div>
                    <h3 className="text-base font-medium text-linen group-hover:text-gold transition-colors">
                      {ticket.subject}
                    </h3>
                    <div className="flex items-center gap-4 text-xs text-stone">
                      <span>Category: {ticket.category}</span>
                    </div>
                  </div>
                  
                  <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-2 text-xs text-stone">
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      Updated {format(new Date(ticket.last_message_at), "MMM d, yyyy")}
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      <CreateTicketDialog 
        open={isCreateOpen} 
        onOpenChange={setIsCreateOpen} 
      />
    </div>
  );
};

export default SupportTickets;

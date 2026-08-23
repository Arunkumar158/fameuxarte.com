import React from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { Search, Eye, Filter, CheckCircle, Clock, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const SupportTicketsAdmin = () => {
  const [search, setSearch] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState<string>("ALL");

  const { data: tickets, isLoading } = useQuery({
    queryKey: ["admin-support-tickets"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("support_tickets")
        .select("*, profiles!user_id(full_name)")
        .order("last_message_at", { ascending: false });

      if (error) throw error;
      return data;
    },
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

  const filteredTickets = tickets?.filter(t => {
    const matchesSearch = 
      t.ticket_number.toLowerCase().includes(search.toLowerCase()) || 
      t.subject.toLowerCase().includes(search.toLowerCase()) ||
      t.profiles?.full_name?.toLowerCase().includes(search.toLowerCase());
      
    const matchesStatus = statusFilter === "ALL" || t.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  // Calculate dashboard stats
  const openCount = tickets?.filter(t => t.status === "OPEN").length || 0;
  const inProgressCount = tickets?.filter(t => t.status === "IN_PROGRESS").length || 0;
  const urgentCount = tickets?.filter(t => t.status !== "RESOLVED" && t.status !== "CLOSED" && t.priority === "URGENT").length || 0;
  const resolvedCount = tickets?.filter(t => t.status === "RESOLVED").length || 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-serif text-linen">Support Center</h1>
        <p className="text-sm text-stone mt-1">Manage customer support tickets.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-surface rounded-xl border border-border-subtle p-5">
          <div className="flex items-center justify-between">
            <h3 className="text-stone text-sm font-medium">Open</h3>
            <AlertCircle className="w-4 h-4 text-blue-500" />
          </div>
          <p className="text-2xl font-semibold text-linen mt-2">{openCount}</p>
        </div>
        <div className="bg-surface rounded-xl border border-border-subtle p-5">
          <div className="flex items-center justify-between">
            <h3 className="text-stone text-sm font-medium">In Progress</h3>
            <Clock className="w-4 h-4 text-gold" />
          </div>
          <p className="text-2xl font-semibold text-linen mt-2">{inProgressCount}</p>
        </div>
        <div className="bg-surface rounded-xl border border-border-subtle p-5">
          <div className="flex items-center justify-between">
            <h3 className="text-stone text-sm font-medium">Urgent</h3>
            <AlertCircle className="w-4 h-4 text-red-500" />
          </div>
          <p className="text-2xl font-semibold text-linen mt-2">{urgentCount}</p>
        </div>
        <div className="bg-surface rounded-xl border border-border-subtle p-5">
          <div className="flex items-center justify-between">
            <h3 className="text-stone text-sm font-medium">Resolved</h3>
            <CheckCircle className="w-4 h-4 text-green-500" />
          </div>
          <p className="text-2xl font-semibold text-linen mt-2">{resolvedCount}</p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 items-center bg-surface p-4 rounded-xl border border-border-subtle">
        <div className="flex-1 w-full relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-stone" />
          <Input 
            placeholder="Search by ticket #, subject, or email..." 
            className="pl-9 bg-surface-2 border-border-subtle text-linen focus-visible:ring-gold w-full"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="w-full sm:w-48">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="bg-surface-2 border-border-subtle text-linen focus:ring-gold">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent className="bg-surface border-border-subtle text-linen">
              <SelectItem value="ALL">All Statuses</SelectItem>
              <SelectItem value="OPEN">Open</SelectItem>
              <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
              <SelectItem value="WAITING_FOR_CUSTOMER">Waiting for Customer</SelectItem>
              <SelectItem value="RESOLVED">Resolved</SelectItem>
              <SelectItem value="CLOSED">Closed</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="bg-surface rounded-xl border border-border-subtle overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-surface-2 border-b border-border-subtle">
              <TableRow className="hover:bg-transparent border-none">
                <TableHead className="text-stone font-medium">Ticket</TableHead>
                <TableHead className="text-stone font-medium">Customer</TableHead>
                <TableHead className="text-stone font-medium">Category</TableHead>
                <TableHead className="text-stone font-medium">Status</TableHead>
                <TableHead className="text-stone font-medium">Priority</TableHead>
                <TableHead className="text-stone font-medium">Last Updated</TableHead>
                <TableHead className="text-stone font-medium text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-32 text-center">
                    <div className="flex justify-center">
                      <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-gold"></div>
                    </div>
                  </TableCell>
                </TableRow>
              ) : filteredTickets?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-32 text-center text-stone">
                    No tickets found matching your criteria.
                  </TableCell>
                </TableRow>
              ) : (
                filteredTickets?.map((ticket) => (
                  <TableRow key={ticket.id} className="border-border-subtle hover:bg-surface-2">
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-mono text-gold text-xs">{ticket.ticket_number}</span>
                        <span className="text-linen font-medium truncate max-w-[200px]" title={ticket.subject}>
                          {ticket.subject}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="text-linen">
                          {ticket.profiles?.full_name || "Unknown"}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-stone text-sm">{ticket.category}</span>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={getStatusColor(ticket.status)}>
                        {ticket.status.replace(/_/g, ' ')}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                        ticket.priority === 'URGENT' ? 'bg-red-500/10 text-red-500' :
                        ticket.priority === 'HIGH' ? 'bg-orange-500/10 text-orange-500' :
                        ticket.priority === 'NORMAL' ? 'bg-blue-500/10 text-blue-500' :
                        'bg-stone/10 text-stone'
                      }`}>
                        {ticket.priority}
                      </span>
                    </TableCell>
                    <TableCell className="text-stone text-sm">
                      {format(new Date(ticket.last_message_at), "MMM d, h:mm a")}
                    </TableCell>
                    <TableCell className="text-right">
                      <Link to={`/admin/support/${ticket.id}`}>
                        <Button variant="ghost" size="sm" className="text-gold hover:text-gold-light hover:bg-gold/10">
                          <Eye className="w-4 h-4 mr-2" />
                          View
                        </Button>
                      </Link>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
};

export default SupportTicketsAdmin;

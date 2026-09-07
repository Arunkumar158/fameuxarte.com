import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { Mail, Search, RefreshCw, AlertCircle, CheckCircle2, Clock, XCircle, ArrowLeft } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Link } from "react-router-dom";

export default function EmailLogs() {
  const [searchTerm, setSearchTerm] = useState("");

  const { data: logs, isLoading, refetch } = useQuery({
    queryKey: ["admin-email-logs"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("email_logs")
        .select(`
          id,
          recipient,
          template,
          subject,
          status,
          created_at,
          sent_at,
          error_message,
          retry_count
        `)
        .order("created_at", { ascending: false })
        .limit(100);

      if (error) {
        console.error("Failed to fetch email logs:", error);
        throw error;
      }
      return data;
    },
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "delivered":
        return <Badge className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20 hover:bg-emerald-500/20"><CheckCircle2 className="w-3 h-3 mr-1" /> Delivered</Badge>;
      case "sent":
        return <Badge className="bg-blue-500/10 text-blue-500 border-blue-500/20 hover:bg-blue-500/20"><CheckCircle2 className="w-3 h-3 mr-1" /> Sent</Badge>;
      case "pending":
        return <Badge className="bg-amber-500/10 text-amber-500 border-amber-500/20 hover:bg-amber-500/20"><Clock className="w-3 h-3 mr-1" /> Pending</Badge>;
      case "failed":
      case "bounced":
        return <Badge className="bg-red-500/10 text-red-500 border-red-500/20 hover:bg-red-500/20"><XCircle className="w-3 h-3 mr-1" /> {status}</Badge>;
      default:
        return <Badge variant="outline" className="text-stone">{status}</Badge>;
    }
  };

  const filteredLogs = logs?.filter((log: any) => 
    log.recipient.toLowerCase().includes(searchTerm.toLowerCase()) || 
    log.template.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.subject.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-medium tracking-tight text-linen">Email Logs</h1>
          <p className="text-stone mt-1">View the delivery status of recent transactional and system emails.</p>
        </div>
        <div className="flex items-center gap-3">
          <Link to="/admin/communications/test">
            <Button variant="outline" className="border-gold text-gold hover:bg-gold/10">
              <Mail className="w-4 h-4 mr-2" />
              Send Test Email
            </Button>
          </Link>
          <Button variant="ghost" size="icon" onClick={() => refetch()} className="text-stone hover:text-linen">
            <RefreshCw className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </div>

      <div className="bg-surface-1 p-4 rounded-xl border border-border-subtle">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone" />
          <Input
            placeholder="Search by email, template, or subject..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full border-border-strong bg-surface-2 pl-9 text-linen focus-visible:ring-gold"
          />
        </div>
      </div>

      <div className="rounded-xl border border-border-subtle bg-surface-1 overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-border-faint hover:bg-transparent">
                <TableHead className="text-stone">Date & Time</TableHead>
                <TableHead className="text-stone">Recipient</TableHead>
                <TableHead className="text-stone">Template</TableHead>
                <TableHead className="text-stone">Subject</TableHead>
                <TableHead className="text-stone">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-32 text-center text-stone">
                    <div className="flex flex-col items-center justify-center">
                      <RefreshCw className="w-6 h-6 animate-spin mb-2 text-gold" />
                      Loading logs...
                    </div>
                  </TableCell>
                </TableRow>
              ) : filteredLogs?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-32 text-center text-stone">
                    <div className="flex flex-col items-center justify-center">
                      <Mail className="w-8 h-8 text-stone mb-2 opacity-50" />
                      No email logs found.
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filteredLogs?.map((log: any) => (
                  <TableRow key={log.id} className="border-border-faint hover:bg-surface-2">
                    <TableCell className="text-stone text-xs whitespace-nowrap">
                      {format(new Date(log.created_at), "MMM d, yyyy")}
                      <br />
                      {format(new Date(log.created_at), "HH:mm:ss")}
                    </TableCell>
                    <TableCell className="text-linen text-sm font-medium">
                      {log.recipient}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="bg-surface-3 text-stone font-mono text-[10px]">
                        {log.template}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-linen text-sm truncate max-w-[200px]" title={log.subject}>
                      {log.subject}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-1 items-start">
                        {getStatusBadge(log.status)}
                        {log.error_message && (
                          <span className="text-[10px] text-red-500 max-w-[150px] truncate" title={log.error_message}>
                            {log.error_message}
                          </span>
                        )}
                      </div>
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
}

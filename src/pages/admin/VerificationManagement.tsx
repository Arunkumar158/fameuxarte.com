import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  ShieldCheck, 
  Search, 
  Filter, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  FileText,
  AlertCircle,
  ExternalLink,
  Download,
  Loader2
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { TrustBadge, TrustBadgeType } from "@/components/ui/trust-badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function VerificationManagement() {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedArtist, setSelectedArtist] = useState<any>(null);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [reviewNotes, setReviewNotes] = useState("");
  const [showDocuments, setShowDocuments] = useState(false);

  const { data: identityDocuments, isLoading: isDocumentsLoading } = useQuery({
    queryKey: ["identity-documents", selectedArtist?.id],
    queryFn: async () => {
      if (!selectedArtist?.id) return [];
      
      const { data: files, error: listError } = await supabase.storage
        .from('identity_documents')
        .list(selectedArtist.id);
        
      if (listError) throw listError;
      if (!files || files.length === 0) return [];

      const documents = await Promise.all(
        files.map(async (file) => {
          const { data, error } = await supabase.storage
            .from('identity_documents')
            .createSignedUrl(`${selectedArtist.id}/${file.name}`, 3600); // 1 hour expiry
            
          if (error) throw error;
          return {
            name: file.name,
            url: data.signedUrl
          };
        })
      );
      
      return documents;
    },
    enabled: !!selectedArtist && showDocuments
  });

  const { data: metrics } = useQuery({
    queryKey: ["trust-metrics"],
    queryFn: async () => {
      const { data: verifiedData } = await supabase.from("profiles").select('id').eq('role', 'artist').in('verification_status', ['verified', 'premium', 'featured']);
      const { data: pendingData } = await supabase.from("profiles").select('id').eq('role', 'artist').in('verification_status', ['identity_submitted', 'under_review']);
      const { data: certsData } = await supabase.from("certificates").select('id', { count: 'exact' });
      
      return {
        verifiedCount: verifiedData?.length || 0,
        pendingCount: pendingData?.length || 0,
        certificatesIssued: certsData?.length || 0,
        trustHealth: "98%"
      };
    }
  });

  const { data: artists, isLoading } = useQuery({
    queryKey: ["verification-artists", statusFilter],
    queryFn: async () => {
      let query = supabase
        .from("profiles")
        .select("id, full_name, email, verification_status, trust_score, verified_at")
        .eq("role", "artist");

      if (statusFilter !== "all") {
        query = query.eq("verification_status", statusFilter);
      } else {
        query = query.order("verification_status", { ascending: false }); // identity_submitted comes up
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    }
  });

  const { mutate: updateVerification, isPending: isUpdating } = useMutation({
    mutationFn: async ({ id, status, notes }: { id: string, status: string, notes: string }) => {
      const updateData: any = { verification_status: status, verification_notes: notes };
      if (status === 'verified') {
        updateData.verified_at = new Date().toISOString();
      }
      
      const { error } = await supabase
        .from("profiles")
        .update(updateData)
        .eq("id", id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Verification status updated.");
      queryClient.invalidateQueries({ queryKey: ["verification-artists"] });
      queryClient.invalidateQueries({ queryKey: ["trust-metrics"] });
      setIsReviewModalOpen(false);
    },
    onError: (error: any) => {
      toast.error(error.message);
    }
  });

  const handleReviewClick = (artist: any) => {
    setSelectedArtist(artist);
    setReviewNotes(artist.verification_notes || "");
    setShowDocuments(false);
    setIsReviewModalOpen(true);
  };

  const filteredArtists = artists?.filter((a) => 
    a.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    a.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-medium tracking-tight text-linen">Trust & Verification</h1>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="border-border-subtle bg-surface-2 shadow-none">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-[#888]">Verification Queue</CardTitle>
            <Clock className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-linen">{metrics?.pendingCount || 0}</div>
            <p className="text-xs text-[#666]">Awaiting review</p>
          </CardContent>
        </Card>
        
        <Card className="border-border-subtle bg-surface-2 shadow-none">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-[#888]">Verified Artists</CardTitle>
            <ShieldCheck className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-linen">{metrics?.verifiedCount || 0}</div>
            <p className="text-xs text-[#666]">Active on platform</p>
          </CardContent>
        </Card>

        <Card className="border-border-subtle bg-surface-2 shadow-none">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-[#888]">Certificates Issued</CardTitle>
            <FileText className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-linen">{metrics?.certificatesIssued || 0}</div>
            <p className="text-xs text-[#666]">Total minted</p>
          </CardContent>
        </Card>

        <Card className="border-border-subtle bg-surface-2 shadow-none">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-[#888]">Marketplace Trust</CardTitle>
            <AlertCircle className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-linen">{metrics?.trustHealth || "98%"}</div>
            <p className="text-xs text-[#666]">Overall health score</p>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between bg-surface-1 p-4 rounded-xl border border-border-subtle">
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone" />
          <Input
            placeholder="Search artists..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full border-border-strong bg-surface-2 pl-9 text-linen focus-visible:ring-gold"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-stone" />
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[180px] border-border-strong bg-surface-2 text-linen">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent className="bg-surface-2 border-border-strong text-linen">
              <SelectItem value="all">All Artists</SelectItem>
              <SelectItem value="identity_submitted">Action Required</SelectItem>
              <SelectItem value="under_review">Under Review</SelectItem>
              <SelectItem value="verified">Verified</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="rounded-xl border border-border-subtle bg-surface-1 overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-border-faint hover:bg-transparent">
                <TableHead className="text-stone">Artist</TableHead>
                <TableHead className="text-stone">Status</TableHead>
                <TableHead className="text-stone">Trust Score</TableHead>
                <TableHead className="text-stone">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={4} className="h-24 text-center text-stone">
                    Loading artists...
                  </TableCell>
                </TableRow>
              ) : filteredArtists?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="h-24 text-center text-stone">
                    No artists found.
                  </TableCell>
                </TableRow>
              ) : (
                filteredArtists?.map((artist) => (
                  <TableRow key={artist.id} className="border-border-faint hover:bg-surface-2">
                    <TableCell>
                      <div>
                        <p className="font-medium text-linen">{artist.full_name || "Unknown"}</p>
                        <p className="text-xs text-[#888]">{artist.email}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      {artist.verification_status === 'verified' || artist.verification_status === 'premium' || artist.verification_status === 'featured' ? (
                        <TrustBadge type={artist.verification_status as TrustBadgeType} />
                      ) : (
                        <span className={`inline-flex items-center rounded-full px-2 py-1 text-[10px] font-medium uppercase tracking-wider ${
                          artist.verification_status === 'identity_submitted' ? 'bg-amber-500/10 text-amber-500' :
                          artist.verification_status === 'under_review' ? 'bg-blue-500/10 text-blue-500' :
                          'bg-surface-3 text-[#888]'
                        }`}>
                          {artist.verification_status?.replace('_', ' ')}
                        </span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2 text-sm text-linen">
                        {artist.trust_score || 0}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleReviewClick(artist)}
                        className={`text-xs ${
                          artist.verification_status === 'identity_submitted' 
                            ? 'bg-gold/10 text-gold hover:bg-gold/20' 
                            : 'text-stone hover:text-linen'
                        }`}
                      >
                        {artist.verification_status === 'identity_submitted' ? 'Review Now' : 'Manage'}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      <Dialog open={isReviewModalOpen} onOpenChange={setIsReviewModalOpen}>
        <DialogContent className="max-w-md bg-surface-1 border-border-subtle text-linen sm:rounded-xl">
          <DialogHeader>
            <DialogTitle>Verify Artist</DialogTitle>
            <DialogDescription className="text-[#888]">
              Review the submitted documents for {selectedArtist?.full_name}.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="p-4 rounded-lg bg-surface-2 border border-border-faint flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <FileText className="w-5 h-5 text-stone" />
                  <span className="text-sm font-medium">Identity Documents</span>
                </div>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setShowDocuments(!showDocuments)}
                  className="h-8 border-border-strong text-stone hover:text-linen"
                >
                  {showDocuments ? "Hide Files" : "View Files"} 
                </Button>
              </div>

              {showDocuments && (
                <div className="pt-3 border-t border-border-faint space-y-2">
                  {isDocumentsLoading ? (
                    <div className="flex items-center gap-2 text-sm text-stone py-2">
                      <Loader2 className="w-4 h-4 animate-spin" /> Fetching documents...
                    </div>
                  ) : identityDocuments && identityDocuments.length > 0 ? (
                    identityDocuments.map((doc, i) => (
                      <div key={i} className="flex items-center justify-between bg-obsidian p-2 rounded border border-border-subtle">
                        <span className="text-xs text-linen truncate max-w-[200px]">{doc.name}</span>
                        <Button asChild variant="ghost" size="sm" className="h-6 px-2 text-[10px] text-gold hover:text-gold hover:bg-gold/10">
                          <a href={doc.url} target="_blank" rel="noreferrer">
                            <ExternalLink className="w-3 h-3 mr-1" /> View
                          </a>
                        </Button>
                      </div>
                    ))
                  ) : (
                    <div className="text-sm text-stone py-2">No documents found for this artist.</div>
                  )}
                </div>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-stone">Internal Notes / Feedback</label>
              <Textarea 
                value={reviewNotes}
                onChange={(e) => setReviewNotes(e.target.value)}
                placeholder="Add notes for internal use or feedback for the artist..."
                className="bg-obsidian border-border-strong text-linen"
              />
            </div>
          </div>

          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button 
              variant="outline" 
              className="border-red-900/50 text-red-500 hover:bg-red-900/20"
              onClick={() => updateVerification({ id: selectedArtist.id, status: 'pending', notes: reviewNotes })}
              disabled={isUpdating}
            >
              <XCircle className="w-4 h-4 mr-2" /> Reject / Request Changes
            </Button>
            <Button 
              className="bg-emerald-600 hover:bg-emerald-500 text-white"
              onClick={() => updateVerification({ id: selectedArtist.id, status: 'verified', notes: reviewNotes })}
              disabled={isUpdating}
            >
              <CheckCircle2 className="w-4 h-4 mr-2" /> Approve & Verify
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

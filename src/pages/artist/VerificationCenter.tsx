import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ShieldCheck, Upload, AlertCircle, FileText, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { TrustBadge } from "@/components/ui/trust-badge";
import { Progress } from "@/components/ui/progress";

export default function VerificationCenter() {
  const { session } = useAuth();
  const queryClient = useQueryClient();
  const [govIdFile, setGovIdFile] = useState<File | null>(null);
  const [selfieFile, setSelfieFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const { data: profile, isLoading } = useQuery({
    queryKey: ["artist-profile", session?.user.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", session?.user.id)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!session?.user.id,
  });

  const { data: uploadedDocs } = useQuery({
    queryKey: ["identity-docs", session?.user.id],
    queryFn: async () => {
      const { data, error } = await supabase.storage
        .from("identity_documents")
        .list(session?.user.id);
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!session?.user.id,
  });

  const handleUpload = async () => {
    if (!session?.user.id) return;
    
    if (!govIdFile && !selfieFile) {
      toast.error("Please select a file to upload");
      return;
    }

    setIsUploading(true);
    try {
      if (govIdFile) {
        const fileExt = govIdFile.name.split('.').pop();
        const filePath = `${session.user.id}/gov_id_${Math.random()}.${fileExt}`;
        const { error: uploadError } = await supabase.storage
          .from("identity_documents")
          .upload(filePath, govIdFile, { upsert: true });
        
        if (uploadError) throw uploadError;
      }

      if (selfieFile) {
        const fileExt = selfieFile.name.split('.').pop();
        const filePath = `${session.user.id}/selfie_${Math.random()}.${fileExt}`;
        const { error: uploadError } = await supabase.storage
          .from("identity_documents")
          .upload(filePath, selfieFile, { upsert: true });
        
        if (uploadError) throw uploadError;
      }

      // Update verification status to identity_submitted
      const { error: updateError } = await supabase
        .from("profiles")
        .update({ verification_status: 'identity_submitted' })
        .eq("id", session.user.id);

      if (updateError) throw updateError;

      toast.success("Documents submitted successfully for review.");
      setGovIdFile(null);
      setSelfieFile(null);
      queryClient.invalidateQueries({ queryKey: ["artist-profile"] });
      queryClient.invalidateQueries({ queryKey: ["identity-docs"] });
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || "An error occurred while uploading documents.");
    } finally {
      setIsUploading(false);
    }
  };

  const getProgress = () => {
    if (!profile) return 0;
    switch (profile.verification_status) {
      case 'pending': return 20;
      case 'identity_submitted': return 50;
      case 'under_review': return 75;
      case 'verified':
      case 'premium':
      case 'featured': return 100;
      default: return 0;
    }
  };

  const isVerified = ['verified', 'premium', 'featured'].includes(profile?.verification_status || '');
  const hasSubmitted = ['identity_submitted', 'under_review'].includes(profile?.verification_status || '');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-medium tracking-tight text-linen">Verification Center</h1>
        {isVerified && <TrustBadge type="verified" />}
      </div>

      <p className="text-[#888]">
        Build trust with collectors by verifying your identity. Verified artists receive a trust badge, digital certificates for their artworks, and higher visibility.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <Card className="border-border-subtle bg-surface-2 shadow-none">
            <CardHeader>
              <CardTitle>Verification Progress</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Progress value={getProgress()} className="h-2" />
                <div className="flex justify-between text-xs text-[#666] mt-2">
                  <span>Profile Complete</span>
                  <span>Identity Submitted</span>
                  <span>Under Review</span>
                  <span>Verified</span>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                  <span className="text-sm text-linen">Email Verified</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                  <span className="text-sm text-linen">Profile Completed</span>
                </div>
                <div className="flex items-center gap-3">
                  {hasSubmitted || isVerified ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                  ) : (
                    <div className="w-5 h-5 rounded-full border-2 border-border-strong flex-shrink-0" />
                  )}
                  <span className="text-sm text-linen">Identity Submitted</span>
                </div>
                <div className="flex items-center gap-3">
                  {profile?.verification_status === 'under_review' || isVerified ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                  ) : (
                    <div className="w-5 h-5 rounded-full border-2 border-border-strong flex-shrink-0" />
                  )}
                  <span className="text-sm text-linen">Founder Review</span>
                </div>
                <div className="flex items-center gap-3">
                  {isVerified ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                  ) : (
                    <div className="w-5 h-5 rounded-full border-2 border-border-strong flex-shrink-0" />
                  )}
                  <span className="text-sm text-linen">Verified Badge</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {!isVerified && (
            <Card className="border-border-subtle bg-surface-2 shadow-none">
              <CardHeader>
                <CardTitle>Submit Identity Documents</CardTitle>
                <CardDescription>Upload a government-issued ID to complete your verification.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {profile?.verification_status === 'pending' && (
                  <Alert className="bg-blue-50/10 border-blue-500/20 text-blue-200">
                    <AlertCircle className="w-4 h-4 text-blue-400" />
                    <AlertTitle>Action Required</AlertTitle>
                    <AlertDescription>
                      Please upload your documents below to start the verification process.
                    </AlertDescription>
                  </Alert>
                )}

                {hasSubmitted && (
                   <Alert className="bg-emerald-50/10 border-emerald-500/20 text-emerald-200">
                   <ShieldCheck className="w-4 h-4 text-emerald-400" />
                   <AlertTitle>Under Review</AlertTitle>
                   <AlertDescription>
                     Your documents have been submitted and are currently being reviewed by the Fameuxarte team.
                   </AlertDescription>
                 </Alert>
                )}

                {profile?.verification_notes && (
                   <Alert className="bg-amber-50/10 border-amber-500/20 text-amber-200">
                   <AlertCircle className="w-4 h-4 text-amber-400" />
                   <AlertTitle>Feedback from Reviewer</AlertTitle>
                   <AlertDescription>
                     {profile.verification_notes}
                   </AlertDescription>
                 </Alert>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-linen">Government ID</label>
                    <div className="border-2 border-dashed border-border-strong rounded-lg p-6 text-center hover:bg-surface transition-colors cursor-pointer" onClick={() => document.getElementById('gov-id-upload')?.click()}>
                      <Upload className="w-6 h-6 text-[#666] mx-auto mb-2" />
                      <span className="text-xs text-[#888]">{govIdFile ? govIdFile.name : "Click to upload ID"}</span>
                      <input id="gov-id-upload" type="file" className="hidden" accept="image/*,.pdf" onChange={(e) => setGovIdFile(e.target.files?.[0] || null)} />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-linen">Selfie (Optional)</label>
                    <div className="border-2 border-dashed border-border-strong rounded-lg p-6 text-center hover:bg-surface transition-colors cursor-pointer" onClick={() => document.getElementById('selfie-upload')?.click()}>
                      <Upload className="w-6 h-6 text-[#666] mx-auto mb-2" />
                      <span className="text-xs text-[#888]">{selfieFile ? selfieFile.name : "Click to upload Selfie"}</span>
                      <input id="selfie-upload" type="file" className="hidden" accept="image/*" onChange={(e) => setSelfieFile(e.target.files?.[0] || null)} />
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button 
                  onClick={handleUpload} 
                  disabled={(!govIdFile && !selfieFile) || isUploading}
                  className="w-full bg-gold hover:bg-gold/90 text-obsidian"
                >
                  {isUploading ? "Uploading..." : "Submit Documents"}
                </Button>
              </CardFooter>
            </Card>
          )}
        </div>

        <div className="space-y-6">
          <Card className="border-border-subtle bg-surface-2 shadow-none">
            <CardHeader>
              <CardTitle>Current Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-3 mb-6">
                <div className={`p-3 rounded-full ${isVerified ? 'bg-emerald-500/10 text-emerald-500' : 'bg-surface text-[#aaa]'}`}>
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-medium text-linen capitalize">
                    {profile?.verification_status?.replace('_', ' ') || 'Pending'}
                  </h3>
                  <p className="text-xs text-[#666]">Verification Status</p>
                </div>
              </div>

              {profile?.trust_score !== undefined && (
                <div className="pt-4 border-t border-border-faint">
                  <p className="text-xs text-[#666] mb-1">Trust Score</p>
                  <div className="flex items-end gap-1">
                    <span className="text-3xl font-medium text-linen">{profile.trust_score}</span>
                    <span className="text-sm text-[#888] mb-1">/100</span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="border-border-subtle bg-surface-2 shadow-none">
            <CardHeader>
              <CardTitle>Submitted Documents</CardTitle>
            </CardHeader>
            <CardContent>
              {uploadedDocs && uploadedDocs.length > 0 ? (
                <ul className="space-y-3">
                  {uploadedDocs.map((doc, idx) => (
                    <li key={idx} className="flex items-center gap-3 text-sm text-[#aaa]">
                      <FileText className="w-4 h-4 text-[#666]" />
                      <span className="truncate">{doc.name}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-[#666]">No documents uploaded yet.</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

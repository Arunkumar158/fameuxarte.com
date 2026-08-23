import React, { useState, useRef, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import MainLayout from "@/components/layouts/MainLayout";
import HomeNav from "@/components/home/HomeNav";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Upload, CheckCircle2, AlertCircle, XCircle } from "lucide-react";

export default function ArtistOnboarding() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [status, setStatus] = useState<string | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const [profileLoading, setProfileLoading] = useState(true);

  const [step, setStep] = useState(1);
  const [bio, setBio] = useState("");
  const [styles, setStyles] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth", { replace: true });
    }
  }, [authLoading, user, navigate]);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) return;
      try {
        const { data, error } = await supabase
          .from("profiles")
          .select("verification_status, role, bio, art_styles")
          .eq("id", user.id)
          .single();

        if (error) throw error;
        
        setStatus(data.verification_status);
        setRole(data.role);
        setBio(data.bio || "");
        setStyles(data.art_styles ? data.art_styles.join(", ") : "");
      } catch (err) {
        console.error("Error fetching profile:", err);
      } finally {
        setProfileLoading(false);
      }
    };
    if (user) fetchProfile();
  }, [user]);

  if (authLoading || profileLoading) {
    return (
      <MainLayout>
        <div className="flex min-h-screen items-center justify-center bg-obsidian text-gold">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </MainLayout>
    );
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = async () => {
    if (!user || !file) return;
    setIsSubmitting(true);
    try {
      // 1. Upload Identity Document
      const ext = file.name.split(".").pop();
      const filePath = `${user.id}/gov_id_${Date.now()}.${ext}`;
      const { error: uploadError } = await supabase.storage
        .from("identity_documents")
        .upload(filePath, file, { upsert: false });

      if (uploadError) throw uploadError;

      // 2. Update Profile with bio, styles, and status
      const styleArray = styles.split(",").map(s => s.trim()).filter(Boolean);
      const { error: updateError } = await supabase
        .from("profiles")
        .update({
          bio,
          art_styles: styleArray,
          verification_status: "identity_submitted"
        })
        .eq("id", user.id);

      if (updateError) throw updateError;

      setStatus("identity_submitted");
      toast({
        title: "Application Submitted",
        description: "Your artist application is now under review.",
      });
    } catch (err) {
      console.error(err);
      toast({
        variant: "destructive",
        title: "Submission Failed",
        description: err instanceof Error ? err.message : "An error occurred",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStatusPage = () => {
    if (status === "identity_submitted" || status === "under_review") {
      return (
        <div className="mx-auto max-w-md rounded-xl border border-border-subtle bg-surface-2 p-8 text-center">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full border border-gold/20 bg-gold/10 text-gold">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
          <h2 className="mb-2 text-2xl font-medium text-linen">Application Under Review</h2>
          <p className="mb-6 text-sm text-stone">
            We have received your artist application. Our team is carefully reviewing your portfolio and identity documents. This usually takes 2-3 business days.
          </p>
          <Button asChild variant="outline" className="h-10 border-border-subtle bg-transparent text-stone hover:bg-surface-3 hover:text-linen">
            <Link to="/account">Return to Account</Link>
          </Button>
        </div>
      );
    }
    
    if (status === "verified") {
      return (
        <div className="mx-auto max-w-md rounded-xl border border-border-subtle bg-surface-2 p-8 text-center">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full border border-emerald-500/20 bg-emerald-500/10 text-emerald-500">
            <CheckCircle2 className="h-8 w-8" />
          </div>
          <h2 className="mb-2 text-2xl font-medium text-linen">You're a Verified Artist!</h2>
          <p className="mb-6 text-sm text-stone">
            Welcome to the Fameuxarte creator ecosystem. You can now access your dashboard and publish your artworks.
          </p>
          <Button asChild className="h-10 bg-gold text-obsidian hover:bg-linen">
            <Link to="/artist">Go to Dashboard</Link>
          </Button>
        </div>
      );
    }

    if (status === "suspended") {
      return (
        <div className="mx-auto max-w-md rounded-xl border border-border-subtle bg-surface-2 p-8 text-center">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full border border-red-500/20 bg-red-500/10 text-red-500">
            <XCircle className="h-8 w-8" />
          </div>
          <h2 className="mb-2 text-2xl font-medium text-linen">Account Suspended</h2>
          <p className="mb-6 text-sm text-stone">
            Your artist privileges have been temporarily suspended. Please contact support for more information.
          </p>
          <Button asChild variant="outline" className="h-10 border-border-subtle bg-transparent text-stone hover:bg-surface-3 hover:text-linen">
            <Link to="/contact">Contact Support</Link>
          </Button>
        </div>
      );
    }
    
    return null; // Should not reach here if pending/rejected
  };

  return (
    <MainLayout>
      <div className="min-h-screen bg-obsidian">
        <HomeNav />
        <main className="mx-auto max-w-3xl px-6 py-16">
          {(status && status !== "pending" && status !== "rejected") ? (
            renderStatusPage()
          ) : (
            <div className="space-y-8">
              <div className="text-center">
                <h1 className="mb-3 text-3xl font-medium tracking-tight text-linen sm:text-4xl">Artist Application</h1>
                <p className="text-sm text-stone">
                  Join Fameuxarte as a verified artist to build your legacy and connect with collectors worldwide.
                </p>
                {status === 'rejected' && (
                  <div className="mt-4 inline-flex items-center gap-2 rounded-md bg-red-500/10 px-4 py-2 text-sm text-red-400">
                    <AlertCircle className="h-4 w-4" />
                    Your previous application was rejected. Please update your details and try again.
                  </div>
                )}
              </div>

              <div className="rounded-xl border border-border-subtle bg-surface-2 p-6 sm:p-8">
                {step === 1 && (
                  <div className="space-y-6 animate-in fade-in">
                    <div>
                      <h2 className="text-lg font-medium text-linen">Step 1: Artist Profile</h2>
                      <p className="text-sm text-stone">Tell us about your background and creative focus.</p>
                    </div>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="bio" className="text-stone">Artist Biography</Label>
                        <Textarea 
                          id="bio" 
                          value={bio} 
                          onChange={(e) => setBio(e.target.value)}
                          className="min-h-32 border-border-subtle bg-obsidian text-linen" 
                          placeholder="Share your artistic journey..." 
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="styles" className="text-stone">Primary Art Styles (comma separated)</Label>
                        <Input 
                          id="styles" 
                          value={styles} 
                          onChange={(e) => setStyles(e.target.value)}
                          className="border-border-subtle bg-obsidian text-linen" 
                          placeholder="e.g. Abstract, Portraiture, Landscape" 
                        />
                      </div>
                    </div>
                    <div className="flex justify-end pt-4">
                      <Button onClick={() => setStep(2)} disabled={!bio.trim()} className="bg-gold text-obsidian hover:bg-linen">
                        Next Step
                      </Button>
                    </div>
                  </div>
                )}

                {step === 2 && (
                  <div className="space-y-6 animate-in fade-in">
                    <div>
                      <h2 className="text-lg font-medium text-linen">Step 2: Identity Verification</h2>
                      <p className="text-sm text-stone">Upload a valid government-issued ID to protect the authenticity of our marketplace.</p>
                    </div>
                    
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="flex min-h-44 w-full flex-col items-center justify-center gap-3 rounded-lg border border-dashed border-gold/30 bg-gold/5 p-6 text-center text-stone transition-colors hover:border-gold hover:text-gold"
                    >
                      <Upload className="h-8 w-8" />
                      <span className="text-sm font-medium text-linen">
                        {file ? file.name : "Select Government ID"}
                      </span>
                      <span className="text-xs text-[#666]">PNG, JPG, or PDF (Max 5MB)</span>
                    </button>
                    <input ref={fileInputRef} type="file" accept="image/*,.pdf" className="hidden" onChange={handleFileChange} />
                    
                    <div className="flex justify-between pt-4">
                      <Button variant="outline" onClick={() => setStep(1)} className="border-border-subtle bg-transparent text-stone hover:bg-surface-3 hover:text-linen">
                        Back
                      </Button>
                      <Button onClick={() => setStep(3)} disabled={!file} className="bg-gold text-obsidian hover:bg-linen">
                        Review Application
                      </Button>
                    </div>
                  </div>
                )}

                {step === 3 && (
                  <div className="space-y-6 animate-in fade-in">
                    <div>
                      <h2 className="text-lg font-medium text-linen">Step 3: Review & Submit</h2>
                      <p className="text-sm text-stone">Please review your information before submitting.</p>
                    </div>
                    
                    <div className="rounded-lg border border-border-faint bg-obsidian p-4 space-y-4">
                      <div>
                        <div className="text-xs uppercase tracking-wider text-stone mb-1">Biography</div>
                        <div className="text-sm text-linen line-clamp-3">{bio}</div>
                      </div>
                      <div>
                        <div className="text-xs uppercase tracking-wider text-stone mb-1">Styles</div>
                        <div className="text-sm text-linen">{styles || "None specified"}</div>
                      </div>
                      <div>
                        <div className="text-xs uppercase tracking-wider text-stone mb-1">Identity Document</div>
                        <div className="text-sm text-linen">{file?.name}</div>
                      </div>
                    </div>

                    <div className="rounded-md bg-gold/10 p-4 border border-gold/20">
                      <p className="text-xs text-gold">
                        By submitting this application, you confirm that the information provided is accurate and you agree to our Artist Terms of Service.
                      </p>
                    </div>
                    
                    <div className="flex justify-between pt-4">
                      <Button variant="outline" onClick={() => setStep(2)} disabled={isSubmitting} className="border-border-subtle bg-transparent text-stone hover:bg-surface-3 hover:text-linen">
                        Back
                      </Button>
                      <Button onClick={handleSubmit} disabled={isSubmitting} className="bg-gold text-obsidian hover:bg-linen">
                        {isSubmitting ? (
                          <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Submitting...</>
                        ) : "Submit Application"}
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </main>
      </div>
    </MainLayout>
  );
}

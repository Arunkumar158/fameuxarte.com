import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { CheckCircle2, ShieldAlert, FileText, ArrowRight } from "lucide-react";
import MainLayout from "@/components/layouts/MainLayout";
import HomeNav from "@/components/home/HomeNav";
import { SEO } from "@/components/SEO";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";

export default function CertificateVerify() {
  const { certificateNumber } = useParams();

  const { data: cert, isLoading, error } = useQuery({
    queryKey: ["certificate-verify", certificateNumber],
    queryFn: async () => {
      if (!certificateNumber) throw new Error("No certificate number provided");

      const { data, error } = await supabase
        .from("certificates")
        .select(`
          id,
          certificate_number,
          issued_at,
          certificate_status,
          artwork:artworks(title, image_path, category, mediums, description),
          artist:profiles!certificates_artist_id_fkey(full_name, verification_status),
          collector:profiles!certificates_collector_id_fkey(full_name)
        `)
        .eq("certificate_number", certificateNumber)
        .maybeSingle();

      if (error) throw error;
      if (!data) throw new Error("Certificate not found");

      return data;
    },
    enabled: Boolean(certificateNumber),
  });

  return (
    <MainLayout>
      <SEO
        title="Verify Certificate of Authenticity | Fameuxarte"
        description="Verify the authenticity of your artwork certificate."
      />
      <div className="min-h-screen bg-obsidian text-linen">
        <HomeNav />
        <div className="mx-auto max-w-3xl px-6 py-20">
          <div className="text-center mb-10">
            <h1 className="text-3xl font-medium tracking-tight text-linen mb-3">Certificate Verification</h1>
            <p className="text-[#888]">Securely verify the authenticity of an artwork registered on Fameuxarte.</p>
          </div>

          {isLoading && (
            <div className="rounded-xl border border-border-subtle bg-surface-2 p-10 text-center animate-pulse">
              <div className="h-12 w-12 mx-auto rounded-full bg-surface mb-4"></div>
              <div className="h-6 w-48 bg-surface mx-auto rounded"></div>
            </div>
          )}

          {error && !isLoading && (
            <div className="rounded-xl border border-red-900/30 bg-red-950/20 p-10 text-center">
              <ShieldAlert className="w-12 h-12 text-red-500 mx-auto mb-4" />
              <h2 className="text-xl font-medium text-red-50 mb-2">Invalid Certificate</h2>
              <p className="text-red-200/70 max-w-md mx-auto text-sm">
                We could not find a valid Certificate of Authenticity with the number <span className="font-mono text-red-100">{certificateNumber}</span>. 
                Please ensure the number is correct.
              </p>
              <Button asChild variant="outline" className="mt-6 border-red-900/50 hover:bg-red-900/30 text-red-100">
                <Link to="/">Return to Home</Link>
              </Button>
            </div>
          )}

          {cert && (
            <div className="overflow-hidden rounded-xl border border-border-subtle bg-surface-2 shadow-2xl">
              <div className="bg-[#1a2a1a] border-b border-[rgba(74,157,111,0.2)] p-6 text-center">
                <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-3" />
                <h2 className="text-xl font-medium text-emerald-50">Authentic Record Found</h2>
                <p className="text-emerald-200/70 text-sm mt-1 flex items-center justify-center gap-2">
                  <FileText className="w-4 h-4" />
                  Certificate: <span className="font-mono text-emerald-100">{cert.certificate_number}</span>
                </p>
              </div>

              <div className="p-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-xs text-[#666] uppercase tracking-wider font-semibold mb-1">Artwork Title</h3>
                      <p className="text-lg font-medium text-linen">{cert.artwork?.title || "Unknown"}</p>
                    </div>

                    <div>
                      <h3 className="text-xs text-[#666] uppercase tracking-wider font-semibold mb-1">Artist</h3>
                      <p className="text-md text-linen flex items-center gap-2">
                        {cert.artist?.full_name || "Unknown"}
                        {cert.artist?.verification_status === 'verified' && (
                          <CheckCircle2 className="w-3.5 h-3.5 text-verified" />
                        )}
                      </p>
                    </div>

                    <div>
                      <h3 className="text-xs text-[#666] uppercase tracking-wider font-semibold mb-1">Original Collector</h3>
                      <p className="text-md text-[#aaa]">Private Collection</p>
                    </div>

                    <div>
                      <h3 className="text-xs text-[#666] uppercase tracking-wider font-semibold mb-1">Issue Date</h3>
                      <p className="text-md text-[#aaa]">
                        {cert.issued_at ? new Date(cert.issued_at).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        }) : "N/A"}
                      </p>
                    </div>
                  </div>

                  <div className="bg-[#151515] rounded-lg border border-border-faint p-4 flex items-center justify-center min-h-[240px]">
                    {cert.artwork?.image_path ? (
                      <img 
                        src={`https://yexjmqhffxukzomkblqj.supabase.co/storage/v1/object/public/artworks/${cert.artwork.image_path}`} 
                        alt={cert.artwork?.title || "Artwork"}
                        className="max-h-[200px] object-contain rounded shadow-lg"
                      />
                    ) : (
                      <div className="text-[#555] text-sm">Image not available</div>
                    )}
                  </div>
                </div>

                <div className="mt-10 pt-6 border-t border-border-faint flex flex-col sm:flex-row justify-between items-center gap-4">
                  <div className="text-xs text-[#666] flex items-center gap-1.5">
                    <ShieldAlert className="w-3.5 h-3.5" />
                    Fameuxarte Verification System
                  </div>
                  <Button asChild variant="outline" className="border-border-subtle bg-transparent hover:bg-surface text-linen">
                    <Link to="/" className="flex items-center gap-2">
                      Explore Gallery <ArrowRight className="w-4 h-4" />
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
}

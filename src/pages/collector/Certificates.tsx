import React from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { Download, ShieldCheck, CheckCircle, ExternalLink } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";

const Certificates = () => {
  const { user } = useAuth();

  const { data: certificates, isLoading } = useQuery({
    queryKey: ["collector-certificates", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from("certificates")
        .select(`
          id,
          certificate_number,
          created_at,
          artwork_id,
          artworks (
            title,
            image_path,
            slug,
            artists (
              profiles (
                full_name
              )
            )
          )
        `)
        .eq("collector_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as any;
    },
    enabled: !!user,
  });

  const formatDate = (dateString: string) => {
    return new Intl.DateTimeFormat("en-US", { year: 'numeric', month: 'short', day: 'numeric' }).format(new Date(dateString));
  };

  const getImageUrl = (path: string | null | undefined) => {
    if (!path) return "/placeholder.svg";
    return `https://yexjmqhffxukzomkblqj.supabase.co/storage/v1/object/public/artworks/${path}`;
  };

  const getCertUrl = (path: string) => {
    return `https://yexjmqhffxukzomkblqj.supabase.co/storage/v1/object/public/certificates/${path}`;
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {[1, 2].map((i) => (
          <div key={i} className="h-48 animate-pulse bg-surface-2 rounded-[16px] border border-border-subtle" />
        ))}
      </div>
    );
  }

  if (!certificates || certificates.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center animate-in fade-in duration-700">
        <div className="w-48 h-48 mb-8 opacity-50 flex items-center justify-center">
          <ShieldCheck className="w-24 h-24 text-gold opacity-50" />
        </div>
        <h2 className="text-[28px] font-medium text-linen mb-3">Your Vault is empty.</h2>
        <p className="text-stone max-w-md mb-8">Certificates of authenticity will appear here securely once you acquire original artworks.</p>
        <Button asChild className="bg-gold text-obsidian hover:bg-linen rounded-full px-8">
          <Link to="/artworks">Acquire Artwork</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[32px] font-medium text-linen flex items-center gap-3">
            My Vault
            <ShieldCheck className="w-6 h-6 text-gold" />
          </h1>
          <p className="text-[14px] text-stone mt-1">Digital certificates of authenticity</p>
        </div>
        <p className="text-[14px] text-stone">{certificates.length} {certificates.length === 1 ? 'Certificate' : 'Certificates'}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {certificates.map((cert) => {
          const artwork = cert.artworks as any;
          const artistName = artwork?.artists?.profiles?.full_name || "Unknown Artist";
          const issuedDate = cert.created_at ? formatDate(cert.created_at) : "Unknown Date";

          return (
            <div key={cert.id} className="relative group rounded-[16px] border border-gold/20 bg-gradient-to-br from-surface-1 to-surface-2 p-1 overflow-hidden transition-all hover:border-gold/40 hover:shadow-[0_0_40px_rgba(212,175,55,0.08)]">
              {/* Decorative Background */}
              <div className="absolute top-0 right-0 p-6 opacity-5 pointer-events-none">
                <ShieldCheck className="w-32 h-32 text-gold" />
              </div>
              
              <div className="relative bg-obsidian rounded-[14px] p-6 h-full flex flex-col">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-verified/10 text-verified border border-verified/20 text-[10px] uppercase tracking-widest font-medium mb-3">
                      <CheckCircle className="w-3 h-3" /> Authenticated
                    </span>
                    <p className="font-mono text-[12px] text-gold tracking-widest">NO. {cert.certificate_number}</p>
                  </div>
                </div>

                <div className="flex gap-5 mb-6 flex-1">
                  <div className="w-20 h-20 rounded-[8px] bg-surface-3 overflow-hidden shrink-0 border border-border-subtle">
                    <img 
                      src={getImageUrl(artwork?.image_path)} 
                      alt={artwork?.title} 
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <h3 className="text-[18px] font-medium text-linen mb-1 leading-tight">{artwork?.title}</h3>
                    <p className="text-[14px] text-stone mb-1">{artistName}</p>
                    <p className="text-[11px] text-[#666] uppercase tracking-wider mt-2">Issued: {issuedDate}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-6 border-t border-border-faint mt-auto">
                  <Button asChild variant="outline" className="rounded-full border-border-subtle text-linen hover:bg-surface-3 hover:text-white h-10">
                    <a href={getCertUrl(cert.file_path)} target="_blank" rel="noreferrer">
                      <Download className="w-4 h-4 mr-2" /> Download PDF
                    </a>
                  </Button>
                  <Button asChild variant="outline" className="rounded-full border-gold/30 text-gold hover:bg-gold/10 hover:text-gold h-10">
                    <Link to={`/verify/${cert.certificate_number}`}>
                      Verify Online <ExternalLink className="w-4 h-4 ml-2" />
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Certificates;

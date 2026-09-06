import React from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, AlertCircle } from "lucide-react";

interface LegalDocumentProps {
  documentType: string;
  fallbackTitle: string;
}

export function LegalDocument({ documentType, fallbackTitle }: LegalDocumentProps) {
  const { data: document, isLoading, error } = useQuery({
    queryKey: ['legal-document', documentType],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('legal_documents')
        .select('*')
        .eq('document_type', documentType)
        .eq('status', 'published')
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) {
        console.error("Error fetching legal document:", error);
        throw error;
      }
      
      return data;
    }
  });

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-[#888]">
        <Loader2 className="w-8 h-8 animate-spin text-gold mb-4" />
        <p>Loading document...</p>
      </div>
    );
  }

  if (error || !document) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-center max-w-md mx-auto">
        <AlertCircle className="w-12 h-12 text-[#666] mb-4" />
        <h1 className="text-2xl font-serif tracking-tight text-linen mb-2">{fallbackTitle}</h1>
        <p className="text-[#888]">
          This document is currently being updated or is pending a business decision. Please check back later.
        </p>
      </div>
    );
  }

  return (
    <article className="prose prose-invert prose-stone max-w-none">
      <header className="mb-10 not-prose">
        <h1 className="text-3xl md:text-4xl font-serif tracking-tight text-linen mb-4">
          {document.title || fallbackTitle}
        </h1>
        <div className="flex flex-wrap items-center gap-4 text-sm text-[#888] font-mono border-b border-border-subtle pb-6">
          <span>Version: {document.version}</span>
          <span>•</span>
          <span>
            Last Updated: {document.updated_at 
              ? new Date(document.updated_at).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })
              : 'Unknown'}
          </span>
          {document.effective_at && (
            <>
              <span>•</span>
              <span>
                Effective: {new Date(document.effective_at).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
              </span>
            </>
          )}
        </div>
      </header>

      {/* Basic markdown rendering. For advanced Markdown support, we could use react-markdown. 
          For now we render text assuming basic HTML or whitespace-formatted text.
          Given V1 requirements, we'll map simple line breaks if it's plain text.
      */}
      <div 
        className="text-[#bbb] leading-relaxed space-y-6 font-sans text-[15px]"
        dangerouslySetInnerHTML={{ __html: document.content.replace(/\n/g, '<br />') }}
      />
    </article>
  );
}

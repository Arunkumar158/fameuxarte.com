import { Twitter, Linkedin, Link as LinkIcon, Share2 } from "lucide-react";
import { toast } from "sonner";
import { posthog } from "posthog-js";

export const SocialShare = ({ url, title }: { url: string; title: string }) => {
  const fullUrl = `${window.location.origin}${url}`;

  const trackShare = (platform: string) => {
    try {
      posthog.capture("share_clicked", { platform, url: fullUrl, title });
    } catch (e) {
      // ignore
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(fullUrl);
    toast.success("Link copied to clipboard");
    
    try {
      posthog.capture("copy_link_clicked", { url: fullUrl });
    } catch (e) {
      // ignore
    }
  };

  const shareTwitter = () => {
    trackShare("twitter");
    window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(fullUrl)}&text=${encodeURIComponent(title)}`, '_blank');
  };

  const shareLinkedin = () => {
    trackShare("linkedin");
    window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(fullUrl)}`, '_blank');
  };

  return (
    <div className="sticky top-24 hidden lg:flex flex-col gap-4 items-center">
      <div className="w-[1px] h-12 bg-border-subtle mb-2" />
      <span className="text-[10px] uppercase tracking-widest text-[#666] font-medium rotate-180" style={{ writingMode: 'vertical-rl' }}>Share</span>
      <div className="w-[1px] h-4 bg-border-subtle my-2" />
      
      <button 
        onClick={shareTwitter}
        className="w-10 h-10 rounded-full border border-border-subtle flex items-center justify-center text-[#888] hover:text-linen hover:border-gold hover:bg-gold/10 transition-colors"
        aria-label="Share on Twitter"
      >
        <Twitter className="w-4 h-4" />
      </button>
      
      <button 
        onClick={shareLinkedin}
        className="w-10 h-10 rounded-full border border-border-subtle flex items-center justify-center text-[#888] hover:text-linen hover:border-gold hover:bg-gold/10 transition-colors"
        aria-label="Share on LinkedIn"
      >
        <Linkedin className="w-4 h-4" />
      </button>
      
      <button 
        onClick={copyToClipboard}
        className="w-10 h-10 rounded-full border border-border-subtle flex items-center justify-center text-[#888] hover:text-linen hover:border-gold hover:bg-gold/10 transition-colors"
        aria-label="Copy link"
      >
        <LinkIcon className="w-4 h-4" />
      </button>
    </div>
  );
};

export const MobileSocialShare = ({ url, title }: { url: string; title: string }) => {
  const fullUrl = `${window.location.origin}${url}`;

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title,
          url: fullUrl
        });
        try {
          posthog.capture("share_clicked", { platform: "native", url: fullUrl });
        } catch (e) {}
      } catch (err) {
        console.error("Error sharing:", err);
      }
    } else {
      navigator.clipboard.writeText(fullUrl);
      toast.success("Link copied to clipboard");
    }
  };

  return (
    <div className="flex lg:hidden justify-center items-center gap-4 py-8 border-y border-border-subtle my-12">
      <span className="text-sm font-medium text-linen">Share this article:</span>
      <button 
        onClick={handleNativeShare}
        className="px-4 py-2 rounded-full border border-border-subtle flex items-center gap-2 text-sm text-linen hover:bg-surface-2 transition-colors"
      >
        <Share2 className="w-4 h-4" /> Share
      </button>
    </div>
  );
};

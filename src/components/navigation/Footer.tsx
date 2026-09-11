import { Link } from "react-router-dom";
import { ArrowRight, Facebook, Instagram, Linkedin, Twitter, Youtube, LifeBuoy, HelpCircle } from "lucide-react";

const footerSections = [
  {
    title: "Discover",
    links: [
      { label: "Original artworks", to: "/artworks" },
      { label: "Verified artists", to: "/artists" },
      { label: "Collections", to: "/collections" },
      { label: "Journal", to: "/blog" },
      { label: "Resources", to: "/resources" },
    ],
  },
  {
    title: "Fameuxarte",
    links: [
      { label: "Our story", to: "/our-story" },
      { label: "Trust Center", to: "/trust" },
      { label: "Help Centre & Tickets", to: "/collector/support" },
      { label: "Contact", to: "/contact" },
      { label: "FAQ", to: "/faq" },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Privacy Policy", to: "/legal/privacy" },
      { label: "Terms & Conditions", to: "/legal/terms" },
      { label: "Buyer Terms", to: "/legal/buyer-terms" },
      { label: "Refunds & Cancellations", to: "/legal/refunds" },
      { label: "Shipping Policy", to: "/legal/shipping" },
    ],
  },
];

const DiscordIcon = ({ className }: { className?: string }) => (
  <svg
    role="img"
    viewBox="0 0 24 24"
    fill="currentColor"
    className={className}
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994.021-.041.001-.09-.041-.106a13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.929 1.793 8.18 1.793 12.061 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.893.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.028zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
  </svg>
);

const RedditIcon = ({ className }: { className?: string }) => (
  <svg
    role="img"
    viewBox="0 0 24 24"
    fill="currentColor"
    className={className}
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M12 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0zm5.01 4.744c.688 0 1.25.561 1.25 1.249a1.25 1.25 0 0 1-2.498.056l-2.597-.547-.8 3.747c1.824.07 3.48.632 4.674 1.488.308-.309.73-.491 1.207-.491.968 0 1.754.786 1.754 1.754 0 .716-.435 1.333-1.01 1.614a3.111 3.111 0 0 1 .042.52c0 2.694-3.13 4.87-7.004 4.87-3.874 0-7.004-2.176-7.004-4.87 0-.183.015-.366.043-.534A1.748 1.748 0 0 1 4.028 12c0-.968.786-1.754 1.754-1.754.463 0 .898.196 1.207.49 1.207-.883 2.878-1.43 4.744-1.487l.885-4.182a.342.342 0 0 1 .14-.197.35.35 0 0 1 .238-.042l2.906.617a1.214 1.214 0 0 1 1.108-.701zM9.25 12C8.561 12 8 12.562 8 13.25c0 .687.561 1.248 1.25 1.248.687 0 1.248-.561 1.248-1.249 0-.688-.561-1.249-1.249-1.249zm5.5 0c-.687 0-1.248.561-1.248 1.25 0 .687.561 1.248 1.249 1.248.688 0 1.249-.561 1.249-1.249 0-.688-.562-1.249-1.25-1.249zm-5.466 3.99a.327.327 0 0 0-.231.094.33.33 0 0 0 0 .463c.842.842 2.484.913 2.961.913.477 0 2.105-.056 2.961-.913a.361.361 0 0 0 .029-.463.33.33 0 0 0-.464 0c-.547.533-1.684.73-2.512.73-.828 0-1.979-.197-2.512-.73a.326.326 0 0 0-.232-.095z" />
  </svg>
);

const socialLinks = [
  { label: "Instagram", href: "https://www.instagram.com/fameuxarte", icon: Instagram },
  { label: "Discord", href: "https://discord.gg/JGdX9db9q", icon: DiscordIcon },
  { label: "Reddit", href: "https://www.reddit.com/u/fameuxarte/s/y7V9rgz6gN", icon: RedditIcon },
  { label: "Facebook", href: "https://www.facebook.com/fameuxarte", icon: Facebook },
  { label: "Twitter", href: "https://twitter.com/fameuxarte", icon: Twitter },
  { label: "YouTube", href: "https://www.youtube.com/@fameuxarte", icon: Youtube },
  { label: "LinkedIn", href: "https://www.linkedin.com/company/fameuxarte", icon: Linkedin },
];

const Footer = () => {
  return (
    <footer className="border-t border-border-faint bg-obsidian px-4 sm:px-6">
      <div className="mx-auto max-w-6xl py-12 sm:py-14">
        
        {/* Help Centre Support Banner Above Footer */}
        <div className="border-b border-white/[0.08] pb-10 mb-12">
          <div className="rounded-2xl bg-gradient-to-r from-[#121212] via-[#161616] to-[#121212] border border-white/[0.08] p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-[0_4px_24px_rgba(0,0,0,0.4)]">
            <div className="flex items-center gap-4 text-left">
              <div className="h-12 w-12 rounded-xl bg-white/[0.05] border border-white/10 flex items-center justify-center shrink-0 text-white">
                <LifeBuoy className="h-6 w-6 text-gold" />
              </div>
              <div>
                <h3 className="text-lg font-serif font-medium text-white mb-1">
                  Fameuxarte Help Centre & Support
                </h3>
                <p className="text-xs sm:text-sm text-stone-400 max-w-xl">
                  Need assistance with an order, authentication certificate, artist verification, or general questions? Submit a ticket and our support team will help you promptly.
                </p>
              </div>
            </div>

            <Link
              to="/collector/support"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-white text-black text-xs sm:text-sm font-semibold hover:bg-stone-200 transition-all hover:gap-3 shrink-0 shadow-sm"
            >
              <span>Visit Help Centre</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>

        {/* Footer Navigation Columns */}
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-[1.35fr_1fr_1fr_1fr_1.2fr]">
          <div>
            <Link to="/" className="mb-4 inline-flex text-[18px] font-medium tracking-[-0.02em] text-linen">
              Fameuxarte
            </Link>
            <p className="max-w-[330px] text-[13px] leading-[1.8] text-[#666]">
              ArtGuard verified originals from personally vetted contemporary artists, curated for collectors building with taste and conviction.
            </p>

            <div className="mt-6 grid max-w-[330px] grid-cols-2 gap-x-6 gap-y-4 border-t border-border-faint pt-5">
              <div>
                <div className="mb-[2px] text-[15px] font-medium tracking-[-0.02em] text-linen">AI Analysis</div>
                <div className="text-[11px] text-[#555]">ArtGuard Protection</div>
              </div>
              <div>
                <div className="mb-[2px] text-[15px] font-medium tracking-[-0.02em] text-verified">Verified</div>
                <div className="text-[11px] text-[#555]">Artist Identity</div>
              </div>
            </div>
          </div>

          {footerSections.map((section) => (
            <div key={section.title}>
              <h2 className="mb-4 text-[11px] font-normal uppercase tracking-[0.14em] text-[#555]">
                {section.title}
              </h2>
              <ul className="space-y-3">
                {section.links.map((link) => (
                  <li key={link.to}>
                    <Link to={link.to} className="text-[13px] text-[#777] transition-colors hover:text-gold">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          <div>
            <h2 className="mb-4 text-[11px] font-normal uppercase tracking-[0.14em] text-[#555]">
              Collector notes
            </h2>
            <p className="mb-4 text-[13px] leading-[1.8] text-[#666]">
              Receive new collection drops, ArtGuard updates, and artist stories.
            </p>
            <form className="flex gap-2" onSubmit={(event) => event.preventDefault()}>
              <input
                type="email"
                aria-label="Email address"
                placeholder="Email address"
                className="min-w-0 flex-1 rounded-full border border-white/10 bg-[#161616] px-4 py-[10px] text-[13px] text-white outline-none transition-colors placeholder:text-stone-500 focus:border-white/30 focus:bg-[#1a1a1a]"
              />
              <button
                type="submit"
                aria-label="Subscribe"
                className="inline-flex h-[44px] w-[44px] shrink-0 items-center justify-center rounded-full bg-white text-black transition-all hover:bg-stone-200 hover:scale-105 active:scale-95"
              >
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </button>
            </form>

            <div className="mt-6 flex flex-wrap gap-2.5">
              {socialLinks.map(({ label, href, icon: Icon }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  title={label}
                  className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-[#161616] text-stone-400 transition-all hover:border-white/30 hover:bg-white/10 hover:text-white hover:scale-105"
                >
                  <Icon className="h-4 w-4" aria-hidden="true" />
                </a>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-4 border-t border-border-faint pt-6 text-[12px] text-[#555] md:flex-row md:items-center md:justify-between">
          <p>&copy; {new Date().getFullYear()} Fameuxarte. All rights reserved.</p>
          <div className="flex gap-4">
            <Link to="/privacy-policy" className="transition-colors hover:text-gold">
              Privacy policy
            </Link>
            <Link to="/terms-of-service" className="transition-colors hover:text-gold">
              Terms of service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

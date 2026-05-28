import { Link } from "react-router-dom";
import { ArrowRight, Facebook, Instagram, Linkedin, Twitter, Youtube } from "lucide-react";

const footerSections = [
  {
    title: "Discover",
    links: [
      { label: "Original artworks", to: "/artworks" },
      { label: "Verified artists", to: "/artists" },
      { label: "Collections", to: "/collections" },
      { label: "Journal", to: "/blog" },
    ],
  },
  {
    title: "Fameuxarte",
    links: [
      { label: "Our story", to: "/our-story" },
      { label: "Contact", to: "/contact" },
      { label: "FAQ", to: "/faq" },
      { label: "Cancellations & refunds", to: "/cancellations-and-refunds" },
    ],
  },
];

const socialLinks = [
  { label: "Instagram", href: "https://www.instagram.com/fameuxarte", icon: Instagram },
  { label: "Facebook", href: "https://www.facebook.com/fameuxarte", icon: Facebook },
  { label: "Twitter", href: "https://twitter.com/fameuxarte", icon: Twitter },
  { label: "YouTube", href: "https://www.youtube.com/@fameuxarte", icon: Youtube },
  { label: "LinkedIn", href: "https://www.linkedin.com/company/fameuxarte", icon: Linkedin },
];

const Footer = () => {
  return (
    <footer className="border-t border-border-faint bg-obsidian px-6">
      <div className="mx-auto max-w-6xl py-14">
        <div className="grid gap-10 lg:grid-cols-[1.35fr_1fr_1fr_1.2fr]">
          <div>
            <Link to="/" className="mb-4 inline-flex text-[18px] font-medium tracking-[-0.02em] text-linen">
              Fameuxarte
            </Link>
            <p className="max-w-[330px] text-[13px] leading-[1.8] text-[#666]">
              ArtGuard verified originals from personally vetted contemporary artists, curated for collectors building with taste and conviction.
            </p>

            <div className="mt-6 grid max-w-[330px] grid-cols-2 gap-x-6 gap-y-4 border-t border-border-faint pt-5">
              <div>
                <div className="mb-[2px] text-[18px] font-medium tracking-[-0.02em] text-linen">1,200+</div>
                <div className="text-[11px] text-[#555]">Verified works</div>
              </div>
              <div>
                <div className="mb-[2px] text-[18px] font-medium tracking-[-0.02em] text-verified">98%</div>
                <div className="text-[11px] text-[#555]">Authenticity rate</div>
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
                className="min-w-0 flex-1 rounded-[6px] border border-border-subtle bg-surface-2 px-3 py-[10px] text-[13px] text-linen outline-none transition-colors placeholder:text-[#555] focus:border-gold/40"
              />
              <button
                type="submit"
                aria-label="Subscribe"
                className="inline-flex h-[40px] w-[40px] shrink-0 items-center justify-center rounded-[6px] bg-linen text-obsidian transition-colors hover:bg-gold"
              >
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </button>
            </form>

            <div className="mt-6 flex flex-wrap gap-2">
              {socialLinks.map(({ label, href, icon: Icon }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  title={label}
                  className="inline-flex h-9 w-9 items-center justify-center rounded-[6px] border border-border-subtle bg-surface-2 text-[#666] transition-colors hover:border-gold/30 hover:text-gold"
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

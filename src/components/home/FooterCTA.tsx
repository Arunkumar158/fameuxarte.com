import { Link } from "react-router-dom";

const FooterCTA = () => {
  return (
    <section className="border-t border-border-faint bg-obsidian px-6 py-14 text-center">
      <div className="mx-auto max-w-xl">
        <div className="mb-3 text-[11px] font-normal uppercase tracking-[0.14em] text-[#555]">Start collecting</div>
        <h2 className="mb-[10px] text-[28px] font-medium tracking-[-0.02em] text-linen">Your first acquisition starts here.</h2>
        <p className="mb-6 text-[13px] text-[#555]">Browse verified original artworks from emerging and established artists.</p>

        <div className="flex flex-col justify-center gap-[10px] sm:flex-row">
          <Link to="/artworks" className="rounded-[6px] bg-linen px-5 py-[11px] text-[13px] font-medium text-obsidian transition-opacity hover:opacity-90">
            Explore the collection
          </Link>
          <a href="#artguard" className="rounded-[6px] border border-[#2a2a2a] bg-transparent px-5 py-[11px] text-[13px] text-[#888] transition-colors hover:text-linen">
            Learn about ArtGuard
          </a>
        </div>
      </div>
    </section>
  );
};

export default FooterCTA;

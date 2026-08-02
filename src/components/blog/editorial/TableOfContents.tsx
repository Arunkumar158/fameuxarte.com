import { useEffect, useState } from "react";
import { Link } from "lucide-react";

interface TOCItem {
  id: string;
  title: string;
  level: number;
}

export const TableOfContents = () => {
  const [headings, setHeadings] = useState<TOCItem[]>([]);
  const [activeId, setActiveId] = useState<string>("");

  useEffect(() => {
    // Wait for content to render
    const timer = setTimeout(() => {
      const elements = Array.from(document.querySelectorAll("article h2, article h3"))
        .filter(el => el.id)
        .map(el => ({
          id: el.id,
          title: el.textContent || "",
          level: Number(el.tagName.charAt(1))
        }));
      setHeadings(elements);
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        });
      },
      { rootMargin: "0% 0% -80% 0%" }
    );

    headings.forEach((heading) => {
      const element = document.getElementById(heading.id);
      if (element) observer.observe(element);
    });

    return () => observer.disconnect();
  }, [headings]);

  if (headings.length < 2) return null;

  return (
    <nav className="sticky top-24 hidden lg:block w-64 pr-8 max-h-[calc(100vh-8rem)] overflow-y-auto custom-scrollbar">
      <h4 className="text-xs font-semibold uppercase tracking-widest text-[#888] mb-4">Contents</h4>
      <ul className="space-y-3 border-l border-border-subtle pl-4 relative">
        {headings.map((heading) => (
          <li key={heading.id} style={{ marginLeft: `${(heading.level - 2) * 12}px` }}>
            <a
              href={`#${heading.id}`}
              className={`block text-sm transition-colors ${
                activeId === heading.id ? "text-gold font-medium" : "text-[#666] hover:text-linen"
              }`}
              onClick={(e) => {
                e.preventDefault();
                document.getElementById(heading.id)?.scrollIntoView({ behavior: 'smooth' });
                // Update URL without page jump
                window.history.pushState(null, '', `#${heading.id}`);
              }}
            >
              {heading.title}
            </a>
          </li>
        ))}
        
        {/* Animated indicator line */}
        <div 
          className="absolute left-[-1px] w-[2px] bg-gold transition-all duration-300"
          style={{
            top: `${Math.max(0, headings.findIndex(h => h.id === activeId)) * 32}px`, // Approximate height per item
            height: activeId ? '20px' : '0'
          }}
        />
      </ul>
    </nav>
  );
};

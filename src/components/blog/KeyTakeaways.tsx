import { CheckCircle2 } from "lucide-react";

interface KeyTakeawaysProps {
  items: string[];
}

/**
 * Key Takeaways — editorial summary block shown near the top of articles.
 * Renders 3–7 bullet points summarizing the article's core insights.
 */
const KeyTakeaways = ({ items }: KeyTakeawaysProps) => {
  if (!items || items.length === 0) return null;

  const visibleItems = items.slice(0, 7);

  return (
    <aside
      aria-label="Key Takeaways"
      className="mx-auto max-w-[680px] px-6 mb-2"
    >
      <div className="rounded-xl border border-gold/20 bg-surface-2/60 p-6 backdrop-blur-sm">
        <div className="flex items-center gap-2.5 mb-4">
          {/* Decorative accent line */}
          <div className="w-5 h-[2px] bg-gold rounded-full" />
          <h2 className="text-[11px] font-semibold uppercase tracking-[0.12em] text-gold">
            Key Takeaways
          </h2>
        </div>

        <ul className="space-y-3" role="list">
          {visibleItems.map((item, index) => (
            <li key={index} className="flex items-start gap-3">
              <CheckCircle2
                className="w-4 h-4 mt-0.5 text-gold flex-shrink-0"
                aria-hidden="true"
              />
              <span className="text-[14px] leading-[1.7] text-linen/80">
                {item}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </aside>
  );
};

export default KeyTakeaways;

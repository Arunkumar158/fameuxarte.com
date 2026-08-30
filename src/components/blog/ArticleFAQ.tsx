import { useState } from "react";
import { ChevronDown } from "lucide-react";
import type { FAQItem } from "./types";

interface ArticleFAQProps {
  faqs: FAQItem[];
}

/**
 * ArticleFAQ — accordion FAQ section rendered at the end of articles.
 * Pairs with the FAQPage JSON-LD schema injected by MetadataPipeline.
 * Accessible: uses proper button semantics and aria-expanded.
 */
const ArticleFAQ = ({ faqs }: ArticleFAQProps) => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  if (!faqs || faqs.length === 0) return null;

  const toggle = (index: number) => {
    setOpenIndex(prev => (prev === index ? null : index));
  };

  return (
    <section
      aria-label="Frequently Asked Questions"
      className="mx-auto max-w-[680px] px-6 py-10 border-t border-border-faint"
      id="faq"
    >
      <div className="mb-8">
        <div className="flex items-center gap-2.5 mb-2">
          <div className="w-5 h-[2px] bg-gold rounded-full" />
          <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-gold">
            FAQ
          </span>
        </div>
        <h2 className="text-[28px] font-serif text-linen leading-tight tracking-tight">
          Frequently Asked Questions
        </h2>
      </div>

      <dl className="space-y-2">
        {faqs.map((item, index) => {
          const isOpen = openIndex === index;
          const panelId = `faq-panel-${index}`;
          const headingId = `faq-heading-${index}`;

          return (
            <div
              key={index}
              className="rounded-lg border border-border-subtle bg-surface-2/40 overflow-hidden"
            >
              <dt>
                <button
                  id={headingId}
                  aria-expanded={isOpen}
                  aria-controls={panelId}
                  onClick={() => toggle(index)}
                  className="w-full flex items-start justify-between text-left px-5 py-4 gap-4 group"
                >
                  <h3 className="text-[15px] font-medium text-linen leading-snug group-hover:text-gold transition-colors">
                    {item.question}
                  </h3>
                  <ChevronDown
                    className={`w-4 h-4 flex-shrink-0 mt-0.5 text-[#888] transition-transform duration-200 ${
                      isOpen ? "rotate-180" : ""
                    }`}
                    aria-hidden="true"
                  />
                </button>
              </dt>
              <dd
                id={panelId}
                role="region"
                aria-labelledby={headingId}
                className={`overflow-hidden transition-all duration-300 ease-in-out ${
                  isOpen ? "max-h-[600px] opacity-100" : "max-h-0 opacity-0"
                }`}
              >
                <p className="px-5 pb-5 text-[14px] leading-[1.8] text-[#999]">
                  {item.answer}
                </p>
              </dd>
            </div>
          );
        })}
      </dl>
    </section>
  );
};

export default ArticleFAQ;

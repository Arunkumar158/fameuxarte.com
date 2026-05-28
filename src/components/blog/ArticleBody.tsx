import type { ReactNode } from "react";

interface ArticleBodyProps {
  content: string;
}

const renderPlainContent = (content: string): ReactNode[] =>
  content
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line, index) => {
      if (line.startsWith("## ")) {
        return <h2 key={index}>{line.substring(3)}</h2>;
      }
      if (line.startsWith("### ")) {
        return <h3 key={index}>{line.substring(4)}</h3>;
      }
      if (line.startsWith("> ")) {
        return <blockquote key={index}>{line.substring(2)}</blockquote>;
      }
      return <p key={index}>{line}</p>;
    });

const ArticleBody = ({ content }: ArticleBodyProps) => {
  const hasHtml = /<\/?[a-z][\s\S]*>/i.test(content);

  return (
    <section className="mx-auto max-w-[680px] px-6 py-10">
      <div
        className="article-content text-[#888] [&_a]:text-gold [&_a]:underline [&_blockquote]:my-8 [&_blockquote]:border-l-2 [&_blockquote]:border-gold [&_blockquote]:pl-5 [&_blockquote]:text-[18px] [&_blockquote]:leading-[1.7] [&_h2]:mb-4 [&_h2]:mt-10 [&_h2]:text-[22px] [&_h2]:font-medium [&_h2]:tracking-[-0.015em] [&_h2]:text-linen [&_h3]:mb-3 [&_h3]:mt-8 [&_h3]:text-[18px] [&_h3]:font-medium [&_h3]:text-linen [&_li]:mb-2 [&_li]:text-[15px] [&_li]:leading-[1.8] [&_ol]:mb-6 [&_ol]:ml-5 [&_ol]:list-decimal [&_p]:mb-[18px] [&_p]:text-[15px] [&_p]:leading-[1.8] [&_ul]:mb-6 [&_ul]:ml-5 [&_ul]:list-disc"
        dangerouslySetInnerHTML={hasHtml ? { __html: content } : undefined}
      >
        {!hasHtml ? renderPlainContent(content) : null}
      </div>
    </section>
  );
};

export default ArticleBody;


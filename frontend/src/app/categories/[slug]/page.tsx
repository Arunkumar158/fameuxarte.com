import { Metadata } from "next";
import { notFound } from "next/navigation";

// ─── Slug formatter ───────────────────────────────────────────────────────────
function formatSlug(slug: string): string {
  return slug
    .replace(/-/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

// ─── Known categories (extend as needed) ─────────────────────────────────────
const VALID_CATEGORIES = [
  "paintings",
  "sculptures",
  "mixed-media",
  "photography",
  "prints",
  "abstract",
  "contemporary",
  "traditional",
];

// ─── Dynamic SEO Metadata ─────────────────────────────────────────────────────
export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const { slug } = params;
  const formatted = formatSlug(slug);

  return {
    title: `${formatted} Art Collection | Original Works for Collectors | Fameuxarte`,
    description: `Explore our curated ${slug} art collection. Original works by India's emerging contemporary artists. Authenticated, investment-grade pieces.`,
    openGraph: {
      type: "website",
    },
    alternates: {
      canonical: `https://fameuxarte.com/categories/${slug}`,
    },
  };
}

// ─── Static Params (pre-render known categories) ──────────────────────────────
export function generateStaticParams() {
  return VALID_CATEGORIES.map((slug) => ({ slug }));
}

// ─── Page Component ───────────────────────────────────────────────────────────
export default function CategoryPage({
  params,
}: {
  params: { slug: string };
}) {
  const { slug } = params;

  if (!VALID_CATEGORIES.includes(slug)) return notFound();

  const formatted = formatSlug(slug);

  return (
    <main className="min-h-screen bg-background pt-32 pb-12 px-4">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold text-primary mb-4">{formatted} Art</h1>
        <p className="text-muted-foreground text-lg">
          Explore our curated {slug} collection — original works by India&apos;s
          emerging contemporary artists.
        </p>
      </div>
    </main>
  );
}

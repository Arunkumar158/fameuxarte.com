// ============================================================
// Fameuxarte Blog Types
// Shared types for the blog/editorial system.
// ============================================================

export interface FAQItem {
  question: string;
  answer: string;
}

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  category: string;
  excerpt: string;
  content: string;
  featured_image: string | null;
  author?: {
    id?: string;
    name: string;
    avatar: string | null;
    bio?: string;
    role?: string;
  };
  published_at: string;
  updated_at?: string;
  read_time: number;
  // SEO fields
  meta_title?: string;
  meta_description?: string;
  canonical_url?: string;
  og_image?: string;
  keywords?: string[];
  tags?: string[];
  schema_type?: string;
  // Editorial blocks
  key_takeaways?: string[];
  faq?: FAQItem[];
  cta_label?: string;
  cta_url?: string;
  cta_description?: string;
  // Source tracking
  source?: 'insights' | 'blogs';
}

// ──────────────────────────────────────────────
// Placeholder data (used when DB returns nothing or for demo articles)
// ──────────────────────────────────────────────
export const PLACEHOLDER_FEATURED: BlogPost = {
  id: "1",
  title: "How to Choose the Right Artwork for Your Home",
  slug: "how-to-choose-artwork-for-your-home",
  category: "Collecting Guide",
  excerpt:
    "Selecting original art for your living space is both personal and informed. Learn how to evaluate scale, lighting, medium, and artist provenance before you buy.",
  content: `
<h2>The Intersection of Architecture and Art</h2>
<p>Selecting original artwork for a living or working space requires balancing aesthetic intuition with spatial awareness. Large contemporary canvases demand breathing room, while intricate etchings and watercolors thrive in intimate, focused settings.</p>

<h2>Evaluating Scale and Sightlines</h2>
<p>A frequent pitfall in art curation is choosing works that are either dwarfed by high ceilings or overwhelmed by tight corridors. As a guiding rule, wall art should occupy between 60% and 75% of available blank wall space, measured across the primary furniture anchor.</p>

<h3>Focal Points and Architectural Anchors</h3>
<p>Position your primary piece where natural sightlines converge upon entering the room. Maintain the optical center at standard gallery eye level: approximately 57 to 60 inches from the finished floor.</p>

<h2>Mediums and Longevity</h2>
<p>Oil paintings offer unmatched depth and light refraction, whereas acrylic works provide crisp graphic vibrancy. Always consider UV exposure and humidity when hanging delicate paper works or unvarnished oil canvases.</p>

<h2>Building a Cohesive Collection</h2>
<p>A sophisticated collection does not require matching color swatches to furniture. Instead, seek tonal resonance, textural dialogue, and conceptual depth across pieces by emerging and established contemporary artists.</p>
`,
  featured_image: "https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=1200&q=80",
  author: {
    name: "Fameuxarte Editorial Team",
    avatar: null,
    bio: "Curatorial intelligence and market research by Fameuxarte's editorial board.",
    role: "Curator"
  },
  published_at: "2026-08-01",
  updated_at: "2026-08-15",
  read_time: 6,
  meta_title: "How to Choose Original Artwork for Your Home | Fameuxarte",
  meta_description: "Expert advice on selecting original contemporary art: measuring scale, evaluating lighting, choosing mediums, and curating a timeless collection.",
  canonical_url: "/blog/how-to-choose-artwork-for-your-home",
  tags: ["Collecting Guide", "Interior Design", "Original Art", "Art Market"],
  keywords: ["original art", "how to buy art", "art collecting", "contemporary paintings"],
  key_takeaways: [
    "Aim for artwork to occupy 60% to 75% of blank wall space above furniture anchors.",
    "Hang pieces at standard gallery eye level: 57 to 60 inches from the floor to the center.",
    "Prioritize tonal and conceptual cohesion over literal color matching with upholstery.",
    "Verify certificate of authenticity and artist provenance with every acquisition."
  ],
  faq: [
    {
      question: "How do I choose between oil and acrylic paintings?",
      answer: "Oil paintings provide exceptional depth, rich glaze layers, and classic luminosity. Acrylics offer bold saturation, rapid drying resilience, and versatility across contemporary mixed media."
    },
    {
      question: "What is the recommended hanging height for original art?",
      answer: "The center of the artwork should typically hang between 57 and 60 inches from the floor, mimicking museum eye level."
    },
    {
      question: "Does Fameuxarte provide certificates of authenticity?",
      answer: "Yes, every original artwork acquired on Fameuxarte comes with a verified digital and physical certificate of authenticity linked to the artist."
    }
  ],
  cta_label: "Explore Original Paintings",
  cta_url: "/artworks",
  cta_description: "Discover curated original works by verified contemporary artists worldwide."
};

export const PLACEHOLDER_POSTS: BlogPost[] = [
  {
    id: "2",
    title: "The Rebellion of Light: How 19th-Century Academic Artists Painted the Devil",
    slug: "rebellion-of-light-devil",
    category: "Art History Analysis",
    excerpt: "A deep dive into the dramatic works of French Academic painters and their portrayal of fallen angels.",
    content: `
<h2>The Shift in Romantic and Academic Depictions</h2>
<p>During the mid-nineteenth century, academic masters departed from grotesque medieval iconography to depict Lucifer as a figure of tragic grandeur, luminous beauty, and profound emotional intensity.</p>

<h2>Alexandre Cabanel's Fallen Angel (1847)</h2>
<p>Painted when Cabanel was just twenty-four at the Villa Medici in Rome, <em>L'Ange Déchu</em> caused a sensation at the French Academy. The painting captures the precise moment of exile, where divine grief turns into smoldering defiance.</p>

<h3>Anatomy and Classical Perfection</h3>
<p>Cabanel applied rigorous classical draughtsmanship to construct a heroic physique, juxtaposing idealized anatomical perfection with a solitary, crystalline tear and storm-laden clouds.</p>

<h2>Light as a Metaphor for Lost Divinity</h2>
<p>The academic technique of chiaroscuro in these works emphasized the contrast between lingering heavenly radiance and impending darkness, symbolizing free will and spiritual conflict.</p>

<h2>Legacy and Influence on Contemporary Visual Culture</h2>
<p>The emotive intensity of 19th-century academic romanticism continues to influence modern figurative painters, cinematic lighting designers, and contemporary digital artists exploring emotional vulnerability.</p>
`,
    featured_image: "https://images.unsplash.com/photo-1577083552431-6e5fd01aa342?auto=format&fit=crop&w=1200&q=80",
    author: {
      name: "Fameuxarte Curatorial Board",
      avatar: null,
      bio: "Historical essays and critical insights exploring pivotal moments in classical and modern art.",
      role: "Art Historian"
    },
    published_at: "2026-06-02",
    updated_at: "2026-07-10",
    read_time: 7,
    meta_title: "The Rebellion of Light: 19th-Century Academic Art | Fameuxarte",
    meta_description: "Explore how 19th-century French Academic painters reimagined classical mythology, dramatic light, and emotional intensity.",
    canonical_url: "/blog/rebellion-of-light-devil",
    tags: ["Art History", "Academic Painting", "French Art", "Figurative"],
    keywords: ["academic art", "Alexandre Cabanel", "fallen angel", "19th century art"],
    key_takeaways: [
      "19th-century Academic artists abandoned monstrous depictions in favor of tragic heroic beauty.",
      "Alexandre Cabanel's 1847 masterpiece used classical anatomy to express raw defiance.",
      "Dramatic chiaroscuro symbolized the conflict between divine radiance and exile.",
      "This era's lighting and figurative precision heavily inspire contemporary figurative art."
    ],
    faq: [
      {
        question: "Why was Alexandre Cabanel's Fallen Angel controversial in 1847?",
        answer: "The Paris Salon judges were taken aback by the intense dramatic expression and romantic rebellion presented by such a young student, departing from strictly orthodox neoclassical subjects."
      },
      {
        question: "Where is the original Fallen Angel painting located today?",
        answer: "The original 1847 masterpiece is preserved in the Musée Fabre in Montpellier, France."
      }
    ],
    cta_label: "Discover Classical & Figurative Artworks",
    cta_url: "/artworks",
    cta_description: "Explore contemporary figurative and classical-inspired paintings by curated artists."
  },
  {
    id: "3",
    title: "Beyond the Fallen Angel: The Academic Precision and Legacy of Alexandre Cabanel",
    slug: "beyond-fallen-angel-cabanel",
    category: "Artist Spotlight",
    excerpt: "Examining the technical mastery, salon triumphs, and enduring influence of one of France's greatest Academic painters.",
    content: `
<h2>The Master of the Second Empire</h2>
<p>Alexandre Cabanel (1823–1889) was one of the most decorated and celebrated painters of the French Second Empire. His studio trained hundreds of students from across Europe and North America.</p>

<h2>The Birth of Venus (1863)</h2>
<p>Purchased personally by Emperor Napoleon III, <em>The Birth of Venus</em> established Cabanel as the preeminent master of mythological allegory and porcelain-like surface finish.</p>

<h2>Technical Mastery: From Underdrawing to Glazing</h2>
<p>Cabanel's process relied on meticulous preparatory studies in charcoal, followed by grisaille underpainting and dozens of transparent oil glazes to achieve luminous skin tones.</p>
`,
    featured_image: "https://images.unsplash.com/photo-1582561424760-0321d75e81fa?auto=format&fit=crop&w=1200&q=80",
    author: {
      name: "Fameuxarte Curatorial Board",
      avatar: null,
      bio: "Historical essays and critical insights exploring pivotal moments in classical and modern art.",
      role: "Art Historian"
    },
    published_at: "2026-05-24",
    read_time: 11,
    meta_title: "Alexandre Cabanel: Academic Precision & Legacy | Fameuxarte",
    meta_description: "Deep dive into Alexandre Cabanel's technique, atelier influence, and enduring legacy in classical painting.",
    canonical_url: "/blog/beyond-fallen-angel-cabanel",
    tags: ["Artist Spotlight", "Academic Art", "Oil Painting"],
    keywords: ["Alexandre Cabanel", "French Salon", "Academic painter", "Oil glazing"],
    key_takeaways: [
      "Cabanel was the most prominent teacher and painter of the French Academic establishment.",
      "His technical glazing method created peerless luminescence in figurative works.",
      "His studio trained world-renowned painters including Jules Bastien-Lepage and Jean-Joseph Benjamin-Constant."
    ],
    faq: [
      {
        question: "What technique did Alexandre Cabanel use for skin tones?",
        answer: "Cabanel layered fine semi-transparent oil glazes over a monochrome tonal underpainting, achieving smooth, pearl-like transitions without visible brushstrokes."
      }
    ],
    cta_label: "Explore Artist Spotlights",
    cta_url: "/artists",
    cta_description: "Meet verified contemporary artists creating original works on Fameuxarte."
  },
];

export type DiscoveryEntityType = 'collection' | 'category' | 'style' | 'medium' | 'subject' | 'color' | 'location';

export interface DiscoveryEntity {
  slug: string;
  type: DiscoveryEntityType;
  title: string;
  heroTitle: string;
  heroDescription: string;
  seoTitle: string;
  seoDescription: string;
  aiSummary: string;
  openGraphImage: string;
  featured: boolean;
  relatedCollections?: string[];
  relatedCategories?: string[];
  relatedStyles?: string[];
  relatedMediums?: string[];
  relatedSubjects?: string[];
  relatedColors?: string[];
  relatedLocations?: string[];
}

export const DISCOVERY_REGISTRY: Record<string, DiscoveryEntity> = {
  // --- Collections ---
  'modern-art': {
    slug: 'modern-art',
    type: 'collection',
    title: 'Modern Art',
    heroTitle: 'Modern Art Collection',
    heroDescription: 'Discover groundbreaking modern artworks from visionary artists around the world. A curated selection of pieces that challenge conventions and redefine artistic expression.',
    seoTitle: 'Modern Art Paintings & Artworks | Fameuxarte',
    seoDescription: 'Explore our curated Modern Art Collection featuring original paintings, sculptures, and mixed media by emerging and established artists.',
    aiSummary: 'A curated collection of modern art focusing on contemporary themes, innovative techniques, and expressive compositions.',
    openGraphImage: '/images/discovery/modern-art-og.jpg',
    featured: true,
    relatedCategories: ['abstract', 'contemporary'],
    relatedStyles: ['minimalism', 'cubism'],
    relatedMediums: ['acrylic', 'mixed-media'],
    relatedColors: ['black-and-white', 'monochrome']
  },
  'new-arrivals': {
    slug: 'new-arrivals',
    type: 'collection',
    title: 'New Arrivals',
    heroTitle: 'Latest Artworks & New Arrivals',
    heroDescription: 'Be the first to discover the newest additions to Fameuxarte. Hand-picked original artworks fresh from the studios of our talented global artists.',
    seoTitle: 'New Artworks & Latest Paintings | Fameuxarte',
    seoDescription: 'Shop the newest original paintings, drawings, and sculptures just added to the Fameuxarte marketplace.',
    aiSummary: 'A dynamically updated collection featuring the most recent artworks added to the platform across all categories and styles.',
    openGraphImage: '/images/discovery/new-arrivals-og.jpg',
    featured: true,
    relatedCollections: ['modern-art'],
    relatedCategories: ['landscape', 'portrait'],
    relatedMediums: ['oil', 'acrylic']
  },

  // --- Categories ---
  'abstract': {
    slug: 'abstract',
    type: 'category',
    title: 'Abstract',
    heroTitle: 'Original Abstract Paintings',
    heroDescription: 'Discover original abstract paintings from emerging and established artists. Explore expressive compositions, modern techniques, and collectible artworks curated by Fameuxarte.',
    seoTitle: 'Abstract Art & Original Abstract Paintings | Fameuxarte',
    seoDescription: 'Buy original abstract art directly from artists. Discover a diverse range of abstract paintings, from geometric and minimalist to bold expressionism.',
    aiSummary: 'A category dedicated to non-representational art, focusing on color, form, and gestural marks to achieve its effect.',
    openGraphImage: '/images/discovery/abstract-og.jpg',
    featured: true,
    relatedStyles: ['contemporary', 'minimalism'],
    relatedMediums: ['acrylic', 'mixed-media'],
    relatedSubjects: ['spiritual'],
    relatedColors: ['blue', 'earth-tones']
  },
  'landscape': {
    slug: 'landscape',
    type: 'category',
    title: 'Landscape',
    heroTitle: 'Breathtaking Landscape Art',
    heroDescription: 'Bring the beauty of the outdoors inside with our curated selection of original landscape paintings. From serene countryside vistas to vibrant cityscapes.',
    seoTitle: 'Landscape Paintings & Nature Art | Fameuxarte',
    seoDescription: 'Explore original landscape paintings featuring nature, mountains, forests, and oceans created by talented artists globally.',
    aiSummary: 'A category focusing on natural scenery such as mountains, valleys, trees, rivers, and forests, especially where the main subject is a wide view.',
    openGraphImage: '/images/discovery/landscape-og.jpg',
    featured: true,
    relatedStyles: ['impressionism', 'realism'],
    relatedMediums: ['oil', 'watercolor'],
    relatedSubjects: ['nature', 'cityscape'],
    relatedColors: ['blue', 'earth-tones']
  },
  'portrait': {
    slug: 'portrait',
    type: 'category',
    title: 'Portrait',
    heroTitle: 'Evocative Portrait Artworks',
    heroDescription: 'Explore deeply expressive and captivating original portrait paintings that capture the essence of the human spirit.',
    seoTitle: 'Original Portrait Paintings & Art | Fameuxarte',
    seoDescription: 'Shop exquisite portrait art by talented contemporary artists. From realistic oil portraits to expressive abstract depictions.',
    aiSummary: 'A category centered on the visual representation of people, exploring human expression, identity, and emotion.',
    openGraphImage: '/images/discovery/portrait-og.jpg',
    featured: false,
    relatedStyles: ['realism', 'contemporary'],
    relatedMediums: ['oil', 'charcoal'],
    relatedSubjects: ['people']
  },

  // --- Styles ---
  'minimalism': {
    slug: 'minimalism',
    type: 'style',
    title: 'Minimalism',
    heroTitle: 'Minimalist Art & Aesthetics',
    heroDescription: 'Embrace simplicity and refined aesthetics. Discover minimalist artworks that use deliberate composition and negative space to create powerful visual statements.',
    seoTitle: 'Minimalist Art & Paintings | Fameuxarte',
    seoDescription: 'Discover elegant minimalist paintings and artworks. Less is more with these refined, simple, and striking contemporary pieces.',
    aiSummary: 'An art style characterized by extreme spareness and simplicity, focusing on the fundamental elements of form, color, and texture.',
    openGraphImage: '/images/discovery/minimalism-og.jpg',
    featured: true,
    relatedCategories: ['abstract'],
    relatedMediums: ['acrylic', 'digital'],
    relatedColors: ['monochrome', 'black-and-white']
  },
  'contemporary': {
    slug: 'contemporary',
    type: 'style',
    title: 'Contemporary',
    heroTitle: 'Contemporary Art',
    heroDescription: 'Art of today, produced by artists living in the 21st century. Explore boundary-pushing contemporary artworks that reflect modern culture and ideas.',
    seoTitle: 'Contemporary Art & Original Paintings | Fameuxarte',
    seoDescription: 'Shop the finest contemporary art from today\'s leading emerging and established artists across the globe.',
    aiSummary: 'Art produced at the present period in time, encompassing a wide range of mediums and exploring current cultural and societal themes.',
    openGraphImage: '/images/discovery/contemporary-og.jpg',
    featured: true,
    relatedCategories: ['abstract', 'portrait'],
    relatedCollections: ['modern-art']
  },

  // --- Mediums ---
  'acrylic': {
    slug: 'acrylic',
    type: 'medium',
    title: 'Acrylic',
    heroTitle: 'Acrylic Paintings',
    heroDescription: 'Vibrant, versatile, and enduring. Explore our extensive collection of original acrylic paintings showcasing brilliant colors and dynamic textures.',
    seoTitle: 'Original Acrylic Paintings | Fameuxarte',
    seoDescription: 'Discover beautiful acrylic paintings by talented artists. Shop vibrant, fast-drying artworks in a variety of styles and subjects.',
    aiSummary: 'Artworks created using acrylic paint, known for its fast drying time, vibrant pigmentation, and versatility in application.',
    openGraphImage: '/images/discovery/acrylic-og.jpg',
    featured: true,
    relatedCategories: ['abstract', 'landscape'],
    relatedStyles: ['contemporary', 'expressionism']
  },
  'oil': {
    slug: 'oil',
    type: 'medium',
    title: 'Oil',
    heroTitle: 'Original Oil Paintings',
    heroDescription: 'Experience the rich depth, luminous colors, and timeless quality of original oil paintings crafted by master artists.',
    seoTitle: 'Oil Paintings & Original Art | Fameuxarte',
    seoDescription: 'Shop museum-quality oil paintings. Explore classic and contemporary oil artworks across landscapes, portraits, and abstract styles.',
    aiSummary: 'Classic artworks created with oil-based paints, characterized by rich textures, slow drying time, and deep, luminous colors.',
    openGraphImage: '/images/discovery/oil-og.jpg',
    featured: true,
    relatedCategories: ['landscape', 'portrait'],
    relatedStyles: ['realism', 'impressionism']
  },

  // --- Subjects ---
  'nature': {
    slug: 'nature',
    type: 'subject',
    title: 'Nature',
    heroTitle: 'Nature Inspired Art',
    heroDescription: 'Immerse yourself in the tranquility of nature. Discover artworks inspired by flora, fauna, and the earth\'s natural wonders.',
    seoTitle: 'Nature Art & Paintings | Fameuxarte',
    seoDescription: 'Find peace and inspiration with original nature paintings. Shop artworks featuring forests, wildlife, flowers, and natural landscapes.',
    aiSummary: 'Artworks whose primary focus is the natural world, including plants, animals, landscapes, and natural phenomena.',
    openGraphImage: '/images/discovery/nature-og.jpg',
    featured: true,
    relatedCategories: ['landscape'],
    relatedMediums: ['watercolor', 'oil'],
    relatedColors: ['earth-tones', 'blue']
  },
  'spiritual': {
    slug: 'spiritual',
    type: 'subject',
    title: 'Spiritual',
    heroTitle: 'Spiritual & Meditative Art',
    heroDescription: 'Connect with the divine and the inner self. Explore spiritual artworks that evoke peace, mindfulness, and transcendental thought.',
    seoTitle: 'Spiritual Art & Paintings | Fameuxarte',
    seoDescription: 'Discover uplifting spiritual art and meditative paintings that bring harmony, balance, and positive energy to your space.',
    aiSummary: 'Art that explores spiritual, religious, or mystical themes, aiming to evoke a sense of peace, contemplation, or connection to the divine.',
    openGraphImage: '/images/discovery/spiritual-og.jpg',
    featured: false,
    relatedCategories: ['abstract'],
    relatedStyles: ['minimalism']
  },

  // --- Colors ---
  'blue': {
    slug: 'blue',
    type: 'color',
    title: 'Blue',
    heroTitle: 'Blue Themed Artworks',
    heroDescription: 'From deep indigos to serene sky blues. Explore a curated selection of artworks united by calming, majestic, and emotional blue hues.',
    seoTitle: 'Blue Paintings & Artworks | Fameuxarte',
    seoDescription: 'Shop beautiful blue paintings. Discover art featuring navy, azure, and turquoise tones perfect for creating a calming atmosphere.',
    aiSummary: 'A collection of artworks where the color blue is the dominant hue, often evoking feelings of calmness, depth, or sadness.',
    openGraphImage: '/images/discovery/blue-og.jpg',
    featured: true,
    relatedSubjects: ['nature'],
    relatedCategories: ['abstract', 'landscape']
  },
  'monochrome': {
    slug: 'monochrome',
    type: 'color',
    title: 'Monochrome',
    heroTitle: 'Monochrome Art',
    heroDescription: 'Striking contrast and subtle gradations. Discover powerful monochrome artworks that focus entirely on tone, light, and shadow.',
    seoTitle: 'Monochrome & Black and White Art | Fameuxarte',
    seoDescription: 'Explore dramatic monochrome paintings and drawings. Shop black and white artworks for a sophisticated, modern look.',
    aiSummary: 'Artworks created using varying tones of only one color, most commonly black and white, emphasizing form and contrast over hue.',
    openGraphImage: '/images/discovery/monochrome-og.jpg',
    featured: false,
    relatedStyles: ['minimalism'],
    relatedMediums: ['charcoal']
  },

  // --- Locations ---
  'kerala': {
    slug: 'kerala',
    type: 'location',
    title: 'Kerala Artists',
    heroTitle: 'Art from Kerala',
    heroDescription: 'Discover the vibrant colors, rich traditions, and contemporary voices of artists hailing from God\'s Own Country, Kerala.',
    seoTitle: 'Paintings & Art by Kerala Artists | Fameuxarte',
    seoDescription: 'Support local talent and explore exquisite artworks created by top emerging and established artists from Kerala, India.',
    aiSummary: 'A curated selection showcasing the artistic talent and cultural heritage of artists based in or originally from Kerala, India.',
    openGraphImage: '/images/discovery/kerala-og.jpg',
    featured: true,
    relatedMediums: ['acrylic', 'watercolor'],
    relatedSubjects: ['nature', 'spiritual']
  },
  'chennai': {
    slug: 'chennai',
    type: 'location',
    title: 'Chennai Artists',
    heroTitle: 'Art from Chennai',
    heroDescription: 'Explore the dynamic art scene of Chennai. A curated collection of traditional and modern artworks from talented local creators.',
    seoTitle: 'Paintings & Art by Chennai Artists | Fameuxarte',
    seoDescription: 'Discover incredible artworks by talented artists from Chennai. Shop authentic local art reflecting a blend of tradition and modernity.',
    aiSummary: 'Artworks produced by artists connected to Chennai, reflecting the region\'s unique blend of deep-rooted tradition and modern urban life.',
    openGraphImage: '/images/discovery/chennai-og.jpg',
    featured: false,
    relatedStyles: ['contemporary', 'realism']
  }
};

export const getDiscoveryEntity = (slug: string, type: DiscoveryEntityType): DiscoveryEntity | undefined => {
  const entity = DISCOVERY_REGISTRY[slug];
  if (entity && entity.type === type) {
    return entity;
  }
  return undefined;
};

export const getDiscoveryEntitiesByType = (type: DiscoveryEntityType): DiscoveryEntity[] => {
  return Object.values(DISCOVERY_REGISTRY).filter(entity => entity.type === type);
};

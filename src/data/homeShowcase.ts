export type InteriorShowcaseItem = {
  id: string;
  image: string;
  mobileImage?: string;
  alt: string;
  space: string;
  title?: string;
  artworkId?: string;
  artworkSlug?: string;
  href?: string;
};

// These are placeholder image paths. The final production assets 
// should be placed in public/images/interiors/ and named accordingly.
export const interiorShowcaseData: InteriorShowcaseItem[] = [
  {
    id: "showcase-1",
    image: "/images/interiors/restaurant.jpg",
    alt: "Atmospheric artwork enhancing a fine dining restaurant interior",
    space: "Restaurant",
    href: "/artworks"
  },
  {
    id: "showcase-2",
    image: "/images/interiors/executive-office.jpg",
    alt: "Premium artwork displayed in an executive corporate office",
    space: "Executive Office",
    title: "Abstract Composition I",
    href: "/artworks"
  },
  {
    id: "showcase-3",
    image: "/images/interiors/hotel-lobby.jpg",
    alt: "Large scale statement painting in a luxury hotel lobby",
    space: "Hotel Lobby",
    href: "/artworks"
  },
  {
    id: "showcase-4",
    image: "/images/interiors/modern-living-room.jpg",
    alt: "Contemporary artwork displayed above a modern living room sofa",
    space: "Living Room",
    href: "/artworks"
  }
];

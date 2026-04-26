import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Art Gallery | Indian Contemporary Art | Fameuxarte',
  description: 'Browse our curated gallery of original Indian contemporary art. Paintings, sculptures, and mixed media by emerging artists. Authenticated investment-grade works.',
  openGraph: {
    type: 'website',
    url: 'https://fameuxarte.com/gallery',
  },
  alternates: {
    canonical: 'https://fameuxarte.com/gallery',
  },
};

export default function GalleryLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

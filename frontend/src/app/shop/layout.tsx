import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Buy Original Indian Art | Art Shop | Fameuxarte',
  description: 'Shop original contemporary artworks by India\'s emerging artists. Curated paintings and sculptures available for purchase. Secure checkout, worldwide delivery.',
  openGraph: {
    type: 'website',
    url: 'https://fameuxarte.com/shop',
  },
  alternates: {
    canonical: 'https://fameuxarte.com/shop',
  },
};

export default function ShopLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

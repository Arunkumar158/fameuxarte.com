import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Legal Policies | Fameuxarte',
  description: 'Terms of Use, Privacy Policy, and Refund Policy for Fameuxarte - Your Premier Art Marketplace',
  keywords: 'art marketplace, terms of use, privacy policy, refund policy, art gallery policies',
};

export default function PoliciesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

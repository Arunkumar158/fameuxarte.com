import { redirect } from "next/navigation";

export default function RootSlugRedirect({ params }: { params: { slug: string } }) {
  redirect(`/blog/${params.slug}`);
}

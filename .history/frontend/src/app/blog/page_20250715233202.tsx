// This file only redirects /blog to /blog/page/1 for paginated blog navigation.
import { redirect } from "next/navigation";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Blog Page | Free Next.js Template for Startup and SaaS",
  description: "This is Blog Page for Startup Nextjs Template",
  // other metadata
};

export default function BlogPage() {
  redirect("/blog/page/1");
  return null;
}

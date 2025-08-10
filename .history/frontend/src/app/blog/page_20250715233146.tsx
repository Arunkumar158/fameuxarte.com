import { redirect } from "next/navigation";

export default function BlogPage() {
  redirect("/blog/page/1");
  return null;
}

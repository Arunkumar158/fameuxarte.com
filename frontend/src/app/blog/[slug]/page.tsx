import blogData from "@/components/Blog/blogData";
import SharePost from "@/components/Blog/SharePost";
import TagButton from "@/components/Blog/TagButton";
import Breadcrumb from "@/components/Common/Breadcrumb";
import Image from "next/image";
import { notFound } from "next/navigation";
import { Metadata } from "next";

// ─── Data-fetching helper (reused by generateMetadata and the page) ─────────
function getBlogPost(slug: string) {
  return blogData.find((post) => post.slug === slug) ?? null;
}

// ─── Dynamic SEO Metadata ────────────────────────────────────────────────────
export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const post = getBlogPost(params.slug);

  if (!post) {
    return {
      title: "Post Not Found | Fameuxarte Art Journal",
      robots: { index: false },
    };
  }

  const description =
    post.paragraph.length > 158
      ? post.paragraph.substring(0, 155) + "..."
      : post.paragraph;

  return {
    title: `${post.title} | Fameuxarte Art Journal`,
    description,
    openGraph: {
      type: "article",
      publishedTime: `${post.publishDate}-01-01T00:00:00Z`,
      modifiedTime: `${post.publishDate}-01-01T00:00:00Z`,
      authors: [post.author.name],
      images: [
        {
          url: post.image,
          width: 1200,
          height: 630,
          alt: post.title,
        },
      ],
    },
    alternates: {
      canonical: `https://fameuxarte.com/blog/${post.slug}`,
    },
  };
}

// ─── Static Params (pre-render all known slugs) ──────────────────────────────
export function generateStaticParams() {
  return blogData.map((post) => ({ slug: post.slug }));
}

// ─── Page Component ──────────────────────────────────────────────────────────
export default function BlogPostPage({
  params,
}: {
  params: { slug: string };
}) {
  const post = getBlogPost(params.slug);

  if (!post) return notFound();

  return (
    <>
      {/* Breadcrumb renders post.title as the single <h1> for this page */}
      <Breadcrumb
        pageName={post.title}
        description={`${post.tags[0]} • ${post.publishDate}`}
      />

      <section className="pb-[120px] pt-[150px]">
        <div className="container">
          <div className="-mx-4 flex flex-wrap justify-center">
            <div className="w-full px-4 lg:w-8/12">
              <div>
                {/* Meta row — title is already the <h1> in Breadcrumb above */}
                <div className="mb-10 flex flex-wrap items-center justify-between border-b border-body-color border-opacity-10 pb-4 dark:border-white dark:border-opacity-10">
                  <div className="flex flex-wrap items-center">
                    <div className="mb-5 mr-10 flex items-center">
                      <div className="mr-4">
                        <div className="relative h-10 w-10 overflow-hidden rounded-full">
                          <Image
                            src={post.author.image}
                            alt={post.author.name}
                            fill
                          />
                        </div>
                      </div>
                      <div className="w-full">
                        <span className="mb-1 text-base font-medium text-body-color">
                          By <span>{post.author.name}</span>
                        </span>
                        <p className="text-xs text-body-color">
                          {post.author.designation}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="mb-5">
                    <span className="inline-flex items-center justify-center rounded-full bg-primary px-4 py-2 text-sm font-semibold text-white">
                      {post.tags[0]}
                    </span>
                  </div>
                </div>

                {/* Featured image */}
                <div className="mb-10 w-full overflow-hidden rounded">
                  <div className="relative aspect-[97/60] w-full sm:aspect-[97/44]">
                    <Image
                      src={post.image}
                      alt={post.title}
                      fill
                      className="object-cover object-center"
                    />
                  </div>
                </div>

                {/* Body */}
                <p className="mb-10 text-base font-medium leading-relaxed text-body-color sm:text-lg sm:leading-relaxed lg:text-base lg:leading-relaxed xl:text-lg xl:leading-relaxed">
                  {post.paragraph}
                </p>

                {/* Share & Tags */}
                <div className="items-center justify-between sm:flex">
                  <div className="mb-5">
                    <h4 className="mb-3 text-sm font-medium text-body-color">
                      Popular Tags:
                    </h4>
                    <div className="flex items-center">
                      {post.tags.map((tag) => (
                        <TagButton key={tag} text={tag} />
                      ))}
                    </div>
                  </div>
                  <div className="mb-5">
                    <h5 className="mb-3 text-sm font-medium text-body-color sm:text-right">
                      Share this post:
                    </h5>
                    <div className="flex items-center sm:justify-end">
                      <SharePost />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

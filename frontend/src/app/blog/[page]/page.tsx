import SingleBlog from "@/components/Blog/SingleBlog";
import blogData from "@/components/Blog/blogData";
import Breadcrumb from "@/components/Common/Breadcrumb";
import { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

const BLOGS_PER_PAGE = 5;

export async function generateMetadata({ params }: { params: { page: string } }): Promise<Metadata> {
  const page = parseInt(params.page, 10) || 1;
  const totalPages = Math.ceil(blogData.length / BLOGS_PER_PAGE);
  return {
    title: `Blog Page ${page} | Free Next.js Template for Startup and SaaS`,
    description: `Blog page ${page} for Startup Nextjs Template`,
    alternates: {
      canonical: `/blog/page/${page}`,
    },
    ...(page > 1 && { prev: `/blog/page/${page - 1}` }),
    ...(page < totalPages && { next: `/blog/page/${page + 1}` }),
  };
}

export default function BlogPage({ params }: { params: { page: string } }) {
  const page = parseInt(params.page, 10) || 1;
  const totalPages = Math.ceil(blogData.length / BLOGS_PER_PAGE);
  if (page < 1 || page > totalPages) return notFound();
  const startIdx = (page - 1) * BLOGS_PER_PAGE;
  const endIdx = startIdx + BLOGS_PER_PAGE;
  const blogs = blogData.slice().reverse().slice(startIdx, endIdx); // Most recent first

  return (
    <>
      <Breadcrumb
        pageName="Blog Grid"
        description="At Fameuxarte, we celebrate the beauty of artistic expression by showcasing stunning handmade paintings from talented artists worldwide. Discover unique masterpieces, connect with creativity, and bring timeless art into your space."
      />
      <section className="pb-[120px] pt-[120px]">
        <div className="container">
          <div className="-mx-4 flex flex-wrap justify-center">
            {blogs.map((blog) => (
              <div
                key={blog.id}
                className="w-full px-4 md:w-2/3 lg:w-1/2 xl:w-1/3"
              >
                <SingleBlog blog={blog} />
              </div>
            ))}
          </div>
          <div className="-mx-4 flex flex-wrap" data-wow-delay=".15s">
            <div className="w-full px-4">
              <ul className="flex items-center justify-center pt-8">
                {/* Prev button */}
                <li className="mx-1">
                  {page > 1 ? (
                    <Link
                      href={`/blog/page/${page - 1}`}
                      className="flex h-9 min-w-[36px] items-center justify-center rounded-md bg-body-color bg-opacity-[15%] px-4 text-sm text-body-color transition hover:bg-primary hover:bg-opacity-100 hover:text-white"
                      aria-label="Previous page"
                    >
                      Prev
                    </Link>
                  ) : (
                    <span className="flex h-9 min-w-[36px] items-center justify-center rounded-md bg-gray-200 px-4 text-sm text-gray-400 cursor-not-allowed">
                      Prev
                    </span>
                  )}
                </li>
                {/* Page numbers */}
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((num) => (
                  <li className="mx-1" key={num}>
                    <Link
                      href={`/blog/page/${num}`}
                      className={`flex h-9 min-w-[36px] items-center justify-center rounded-md px-4 text-sm transition
                        ${num === page
                          ? "bg-primary text-white pointer-events-none"
                          : "bg-body-color bg-opacity-[15%] text-body-color hover:bg-primary hover:bg-opacity-100 hover:text-white"}
                      `}
                      aria-current={num === page ? "page" : undefined}
                    >
                      {num}
                    </Link>
                  </li>
                ))}
                {/* Next button */}
                <li className="mx-1">
                  {page < totalPages ? (
                    <Link
                      href={`/blog/page/${page + 1}`}
                      className="flex h-9 min-w-[36px] items-center justify-center rounded-md bg-body-color bg-opacity-[15%] px-4 text-sm text-body-color transition hover:bg-primary hover:bg-opacity-100 hover:text-white"
                      aria-label="Next page"
                    >
                      Next
                    </Link>
                  ) : (
                    <span className="flex h-9 min-w-[36px] items-center justify-center rounded-md bg-gray-200 px-4 text-sm text-gray-400 cursor-not-allowed">
                      Next
                    </span>
                  )}
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>
    </>
  );
} 
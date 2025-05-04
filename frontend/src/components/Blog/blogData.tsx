import { Blog } from "@/types/blog";

const blogData: Blog[] = [
  {
    id: 1,
    title: "What is Fameuxarte?",
    paragraph:
      "In a world overflowing with art and creativity, Fameuxarte stands out as more than just an online art store. It’s a movement, a platform, and a mission—all rolled into one. So, what exactly is Fameuxarte? Let’s dive in.",
    image: "/images/blog/blog-01.jpg",
    author: {
      name: "fameuxarte",
      image: "/images/blog/author-01.png",
      designation: "Graphic Designer",
    },
    tags: ["creative"],
    publishDate: "2025",
  },
  {
    id: 2,
    title: "Why Supporting Independent Artists Matters More Than Ever",
    paragraph:
      "In a world where mass production dominates everything—from clothes to home décor—authentic art is becoming rare and valuable. At Fameuxarte, we believe in putting the spotlight back on the creators—the independent artists who pour their soul into every piece.",
    image: "/images/blog/blog-02.jpg",
    author: {
      name: "fameuxarte",
      image: "/images/blog/author-02.png",
      designation: "Content Writer",
    },
    tags: ["art"],
    publishDate: "2025",
  },
  {
    id: 3,
    title: "How AI is Helping Us Transform the Art World at Fameuxarte.",
    paragraph:
      "We’re not just about paintings and canvases—we’re blending technology with creativity to revolutionize the art scene. Fameuxarte is introducing AI-powered tools that make discovering and validating art easier than ever.",
    image: "/images/blog/blog-03.jpg",
    author: {
      name: "fameuxarte",
      image: "/images/blog/author-03.png",
      designation: "Graphic Designer",
    },
    tags: ["design"],
    publishDate: "2025",
  },
];
export default blogData;

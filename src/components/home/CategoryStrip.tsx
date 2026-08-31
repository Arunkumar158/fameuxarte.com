import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

interface CategoryItem {
  id: string;
  name: string;
  queryParam: string;
  image: string;
}

const categories: CategoryItem[] = [
  {
    id: "paintings",
    name: "Paintings",
    queryParam: "Painting",
    image: "/images/categories/paintings.jpg",
  },
  {
    id: "sculptures",
    name: "Sculptures",
    queryParam: "Sculpture",
    image: "/images/categories/sculptures.jpg",
  },
  {
    id: "prints",
    name: "Prints",
    queryParam: "Print",
    image: "/images/categories/prints.jpg",
  },
  {
    id: "abstract",
    name: "Abstract",
    queryParam: "Abstract",
    image: "/images/categories/abstract.jpg",
  },
  {
    id: "landscapes",
    name: "Landscapes",
    queryParam: "Landscape",
    image: "/images/categories/landscapes.jpg",
  },
];

const CategoryStrip = () => {
  return (
    <section className="w-full bg-black py-8 border-b border-white/[0.08]">
      <div className="mx-auto max-w-[1400px] px-4 sm:px-8">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5 sm:gap-4">
          {categories.map((category) => (
            <Link
              key={category.id}
              to={`/artworks?category=${encodeURIComponent(category.queryParam)}`}
              className="group flex items-center gap-3.5 bg-[#0f0f0f] p-3 rounded-2xl border border-white/[0.08] hover:border-white/25 hover:bg-[#151515] hover:-translate-y-0.5 transition-all duration-300 shadow-[0_2px_12px_rgba(0,0,0,0.5)]"
            >
              {/* Thumbnail Image */}
              <div className="h-12 w-12 sm:h-14 sm:w-14 shrink-0 rounded-xl overflow-hidden bg-[#1a1a1a]">
                <img
                  src={category.image}
                  alt={category.name}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
              </div>

              {/* Text Information */}
              <div className="flex flex-col justify-center min-w-0 flex-1">
                <h3 className="text-[13px] sm:text-[14px] font-semibold text-white truncate group-hover:text-white transition-colors">
                  {category.name}
                </h3>
                <span className="inline-flex items-center gap-1 text-[11px] font-medium text-stone-400 group-hover:text-white transition-colors mt-0.5">
                  <span>Explore Now</span>
                  <ArrowRight className="h-3 w-3 transition-transform duration-200 group-hover:translate-x-0.5" />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CategoryStrip;

'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Palette, Image as ImageIcon } from 'lucide-react';

interface ArtworkItem {
  id: number;
  title: string;
  imageUrl: string;
  description: string;
  category: string;
}

const artworks: ArtworkItem[] = [
  {
    id: 1,
    title: "Abstract Harmony",
    imageUrl: "https://images.unsplash.com/photo-1547826039-bfc35e0f1ea8",
    description: "A vibrant exploration of color and form",
    category: "Abstract"
  },
  {
    id: 2,
    title: "Urban Dreams",
    imageUrl: "https://images.unsplash.com/photo-1549887534-1541e9326642",
    description: "Contemporary cityscape interpretation",
    category: "Urban"
  },
  {
    id: 3,
    title: "Nature's Whisper",
    imageUrl: "https://images.unsplash.com/photo-1578301978693-85fa9c0320b9",
    description: "Organic forms and natural elements",
    category: "Nature"
  },
  {
    id: 4,
    title: "Digital Waves",
    imageUrl: "https://images.unsplash.com/photo-1618005198919-d3d4b5a92ead",
    description: "Digital art exploration",
    category: "Digital"
  },
];

const categories = ["All", "Abstract", "Urban", "Nature", "Digital"];

function GalleryPage() {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedArtwork, setSelectedArtwork] = useState<ArtworkItem | null>(null);

  const filteredArtworks = selectedCategory === "All"
    ? artworks
    : artworks.filter((art) => art.category === selectedCategory);

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-2 mb-8">
        <Palette className="w-8 h-8 text-primary" />
        <h1 className="text-4xl font-bold text-primary">Art Gallery</h1>
      </div>

      {/* Category Filter */}
      <div className="flex gap-4 mb-8 overflow-x-auto pb-4">
        {categories.map((category) => (
          <button
            key={category}
            onClick={() => setSelectedCategory(category)}
            className={`px-4 py-2 rounded-full transition-all ${
              selectedCategory === category
                ? "bg-primary text-primary-foreground"
                : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
            }`}
          >
            {category}
          </button>
        ))}
      </div>

      {/* Gallery Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredArtworks.map((artwork) => (
          <motion.div
            key={artwork.id}
            layout
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="group cursor-pointer"
            onClick={() => setSelectedArtwork(artwork)}
          >
            <div className="relative overflow-hidden rounded-lg bg-card shadow-lg aspect-square">
              <img
                src={artwork.imageUrl}
                alt={artwork.title}
                className="object-cover w-full h-full transition-transform duration-300 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-6">
                <div className="text-white">
                  <h3 className="text-xl font-semibold">{artwork.title}</h3>
                  <p className="text-sm opacity-80">{artwork.description}</p>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Modal */}
      {selectedArtwork && (
        <div
          className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedArtwork(null)}
        >
          <div
            className="bg-card max-w-4xl w-full rounded-lg overflow-hidden shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative aspect-video">
              <img
                src={selectedArtwork.imageUrl}
                alt={selectedArtwork.title}
                className="object-cover w-full h-full"
              />
            </div>
            <div className="p-6">
              <h2 className="text-2xl font-bold mb-2">{selectedArtwork.title}</h2>
              <p className="text-muted-foreground">{selectedArtwork.description}</p>
              <div className="mt-4 flex items-center gap-2">
                <span className="px-3 py-1 rounded-full bg-secondary text-secondary-foreground text-sm">
                  {selectedArtwork.category}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Empty State */}
      {filteredArtworks.length === 0 && (
        <div className="text-center py-12">
          <ImageIcon className="w-16 h-16 mx-auto text-muted-foreground/50 mb-4" />
          <h3 className="text-xl font-semibold text-primary mb-2">No Artworks Found</h3>
          <p className="text-muted-foreground">
            No artworks found in the {selectedCategory} category.
          </p>
        </div>
      )}
    </div>
  );
}

export default function GalleryWrapper() {
  return (
    <main className="min-h-screen bg-background pt-32 pb-12 px-4">
      <GalleryPage />
    </main>
  );
}

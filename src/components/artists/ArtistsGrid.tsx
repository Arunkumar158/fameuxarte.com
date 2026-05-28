import ArtistCard, { Artist } from "./ArtistCard";

interface ArtistsGridProps {
  artists: Artist[];
}

const ArtistsGrid = ({ artists }: ArtistsGridProps) => {
  if (!artists || artists.length === 0) {
    return (
      <div className="bg-surface-1 px-6 py-20 text-center">
        <p className="text-[14px] text-[#666]">No artists found</p>
      </div>
    );
  }

  return (
    <section className="bg-surface-1 px-6 py-10">
      <div className="mx-auto max-w-6xl">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {artists.map((artist, index) => (
            <ArtistCard key={artist.id} artist={artist} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default ArtistsGrid;

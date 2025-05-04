
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import SectionTitle from "../shared/SectionTitle";
import { supabase } from "@/integrations/supabase/client";

const FeaturedArtists = () => {
  const { data: artists, isLoading } = useQuery({
    queryKey: ["featured-artists"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("artists")
        .select(`
          *,
          profiles (
            avatar_url
          )
        `)
        .limit(4);
      
      if (error) throw error;
      return data;
    }
  });

  if (isLoading) {
    return (
      <section className="py-16 md:py-24 bg-secondary">
        <div className="container">
          <SectionTitle
            title="Featured Artists"
            subtitle="Loading featured artists..."
          />
        </div>
      </section>
    );
  }

  if (!artists?.length) {
    return (
      <section className="py-16 md:py-24 bg-secondary">
        <div className="container">
          <SectionTitle
            title="Featured Artists"
            subtitle="No featured artists available at the moment"
          />
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 md:py-24 bg-secondary">
      <div className="container">
        <SectionTitle
          title="Featured Artists"
          subtitle="The creative minds behind our exceptional collection"
        />

        <div className="mt-10 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {artists.map((artist) => (
            <Link 
              key={artist.id}
              to={`/artists/${artist.id}`}
              className="group"
            >
              <div className="space-y-4">
                <div className="relative overflow-hidden rounded-full aspect-square bg-muted">
                  {artist.profiles?.avatar_url && (
                    <img
                      src={artist.profiles.avatar_url}
                      alt={artist.specialty || "Artist"}
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  )}
                </div>
                <div className="text-center">
                  <h3 className="font-serif text-xl font-medium group-hover:underline">
                    {artist.specialty || "Artist"}
                  </h3>
                  <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                    {artist.bio || "Contemporary artist"}
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>

        <div className="mt-12 text-center">
          <Button asChild>
            <Link to="/artists">View All Artists</Link>
          </Button>
        </div>
      </div>
    </section>
  );
};

export default FeaturedArtists;


import { Link } from "react-router-dom";

interface ArtistCardProps {
  artist: {
    id: string;
    profile_id: string;
    bio: string;
    specialty: string;
    website: string;
    social_media: any;
  };
}

const ArtistCard = ({ artist }: ArtistCardProps) => {
  return (
    <div className="border rounded-lg p-6 hover:shadow-lg transition-shadow">
      <h3 className="text-xl font-semibold mb-2">{artist.specialty}</h3>
      <p className="text-muted-foreground mb-4 line-clamp-3">{artist.bio}</p>
      {artist.website && (
        <Link 
          to={artist.website} 
          className="text-primary hover:underline"
          target="_blank"
          rel="noopener noreferrer"
        >
          Visit Website
        </Link>
      )}
    </div>
  );
};

export default ArtistCard;

import { Link } from "react-router-dom";

export interface AuthorCardProps {
  authorId?: string;
  name: string;
  avatarUrl?: string;
  bio?: string;
  role?: string;
}

export const AuthorCard = ({ authorId, name, avatarUrl, bio, role }: AuthorCardProps) => {
  return (
    <div className="flex items-start gap-4 p-6 rounded-xl bg-surface-2/30 border border-border-subtle mt-12">
      <div className="w-16 h-16 rounded-full overflow-hidden bg-surface-3 flex-shrink-0">
        <img 
          src={avatarUrl || "/placeholder.svg"} 
          alt={name}
          className="w-full h-full object-cover"
        />
      </div>
      <div>
        <h4 className="text-linen font-medium text-lg flex items-center gap-2">
          {name}
          {role === 'artist' && (
            <span className="text-[10px] uppercase tracking-wider bg-gold/10 text-gold px-2 py-0.5 rounded-full">
              Fameuxarte Artist
            </span>
          )}
        </h4>
        {bio ? (
          <p className="text-[#888] text-sm mt-2 leading-relaxed">{bio}</p>
        ) : (
          <p className="text-[#888] text-sm mt-1">Contributor to the Fameuxarte Journal.</p>
        )}
        
        {authorId && (
          <Link 
            to={`/artists/${authorId}`} 
            className="inline-block mt-3 text-sm text-gold hover:underline font-medium"
          >
            View Profile
          </Link>
        )}
      </div>
    </div>
  );
};

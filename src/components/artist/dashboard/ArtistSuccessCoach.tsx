import React from 'react';
import { Link } from 'react-router-dom';
import { 
  CheckCircle2, 
  Circle, 
  ChevronRight, 
  Zap, 
  Image as ImageIcon, 
  FileText,
  UserCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ProfileData {
  avatar_url?: string;
  cover_image?: string;
  bio?: string;
  country?: string;
  city?: string;
  full_name?: string;
  artist_statement?: string;
}

interface ArtistSuccessCoachProps {
  profile: ProfileData | null;
  artworksCount: number;
  draftsCount: number;
}

export const ArtistSuccessCoach = ({ profile, artworksCount, draftsCount }: ArtistSuccessCoachProps) => {
  const tasks = [
    {
      id: 'profile',
      title: 'Complete your profile',
      description: 'Add a bio, location, and avatar to build trust with collectors.',
      icon: UserCircle,
      isCompleted: !!(profile?.avatar_url && profile?.bio && profile?.country),
      link: '/artist/settings',
      actionText: 'Edit Profile'
    },
    {
      id: 'artwork',
      title: 'Upload your first artwork',
      description: 'Start building your portfolio to attract buyers.',
      icon: ImageIcon,
      isCompleted: artworksCount > 0,
      link: '/artist/artworks/new',
      actionText: 'Upload Art'
    },
    {
      id: 'drafts',
      title: 'Publish pending drafts',
      description: 'You have unpublished works waiting to be seen.',
      icon: FileText,
      isCompleted: draftsCount === 0 && artworksCount > 0, // Only matters if they have artworks
      isHidden: draftsCount === 0,
      link: '/artist/artworks',
      actionText: 'View Drafts'
    },
    {
      id: 'statement',
      title: 'Write an artist statement',
      description: 'Share the inspiration behind your creative process.',
      icon: Zap,
      isCompleted: !!profile?.artist_statement,
      link: '/artist/settings',
      actionText: 'Add Statement'
    }
  ];

  const visibleTasks = tasks.filter(t => !t.isHidden);
  const completedCount = visibleTasks.filter(t => t.isCompleted).length;
  const progress = Math.round((completedCount / visibleTasks.length) * 100) || 0;

  return (
    <div className="rounded-[8px] border border-border-subtle bg-surface-2 p-5 flex flex-col h-full">
      <div className="mb-4">
        <div className="flex items-center gap-2 mb-1">
          <Zap className="h-4 w-4 text-gold" />
          <h3 className="text-[14px] font-medium text-linen">Success Coach</h3>
        </div>
        <p className="text-[12px] text-stone mb-4">Complete these steps to increase your visibility and sales potential.</p>
        
        <div className="mb-2 flex items-center justify-between text-sm">
          <span className="text-stone text-[12px]">Completion</span>
          <span className="font-medium text-gold text-[12px]">{progress}%</span>
        </div>
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-obsidian">
          <div 
            className="h-full bg-gold transition-all duration-500" 
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <div className="space-y-3 flex-1 overflow-y-auto pr-1 -mr-1 custom-scrollbar">
        {visibleTasks.map(task => (
          <div 
            key={task.id} 
            className={`flex items-start gap-3 rounded-[6px] border p-3 transition-colors ${
              task.isCompleted 
                ? 'border-border-faint bg-surface-3/50' 
                : 'border-gold/20 bg-gold/5'
            }`}
          >
            <div className="mt-0.5 shrink-0">
              {task.isCompleted ? (
                <CheckCircle2 className="h-4 w-4 text-verified" />
              ) : (
                <Circle className="h-4 w-4 text-gold" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <h4 className={`text-[13px] font-medium ${task.isCompleted ? 'text-stone line-through' : 'text-linen'}`}>
                {task.title}
              </h4>
              {!task.isCompleted && (
                <>
                  <p className="mt-1 text-[11px] text-stone leading-relaxed">
                    {task.description}
                  </p>
                  <Button asChild variant="link" className="h-auto p-0 text-[11px] text-gold mt-2">
                    <Link to={task.link} className="flex items-center">
                      {task.actionText} <ChevronRight className="ml-1 h-3 w-3" />
                    </Link>
                  </Button>
                </>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

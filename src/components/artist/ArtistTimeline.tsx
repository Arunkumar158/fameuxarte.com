import React from 'react';
import { CheckCircle2, Star, Image, DollarSign, Calendar } from 'lucide-react';

interface TimelineEvent {
  date: string | null;
  title: string;
  description?: string;
  icon: React.ElementType;
  completed: boolean;
}

interface ArtistTimelineProps {
  joinedDate: string | null;
  verifiedDate: string | null;
  firstArtworkDate: string | null;
  firstSaleDate: string | null;
}

export function ArtistTimeline({
  joinedDate,
  verifiedDate,
  firstArtworkDate,
  firstSaleDate,
}: ArtistTimelineProps) {
  const events: TimelineEvent[] = [
    {
      date: joinedDate,
      title: 'Joined Fameuxarte',
      icon: Calendar,
      completed: !!joinedDate,
    },
    {
      date: verifiedDate,
      title: 'Verified Artist',
      description: 'Identity and portfolio authenticated',
      icon: CheckCircle2,
      completed: !!verifiedDate,
    },
    {
      date: firstArtworkDate,
      title: 'First Artwork Published',
      icon: Image,
      completed: !!firstArtworkDate,
    },
    {
      date: firstSaleDate,
      title: 'First Artwork Sold',
      description: 'Collected by a Fameuxarte patron',
      icon: DollarSign,
      completed: !!firstSaleDate,
    },
    {
      date: null,
      title: 'Milestone Achievements',
      description: 'More to come on this artistic journey',
      icon: Star,
      completed: false, // Future placeholder
    }
  ];

  return (
    <div className="space-y-6 py-4">
      <div className="relative border-l border-border-subtle ml-3 space-y-8">
        {events.map((event, idx) => {
          const Icon = event.icon;
          const isCompleted = event.completed;
          
          return (
            <div key={idx} className="relative pl-6">
              <div
                className={`absolute -left-[13px] top-1 flex h-6 w-6 items-center justify-center rounded-full border-2 ${
                  isCompleted 
                    ? 'border-emerald-500 bg-obsidian text-emerald-500' 
                    : 'border-border-subtle bg-surface-2 text-[#666]'
                }`}
              >
                <Icon className="h-3 w-3" />
              </div>
              <div className="flex flex-col">
                <h4 className={`text-[15px] font-medium ${isCompleted ? 'text-linen' : 'text-[#666]'}`}>
                  {event.title}
                </h4>
                {event.date && isCompleted && (
                  <span className="text-[12px] text-[#888] mt-0.5">
                    {new Date(event.date).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                    })}
                  </span>
                )}
                {event.description && (
                  <p className="text-[13px] text-[#666] mt-1">{event.description}</p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

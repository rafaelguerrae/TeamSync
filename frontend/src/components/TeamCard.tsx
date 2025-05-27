'use client';

import { useRouter } from 'next/navigation';
import { TeamMembership } from '@/lib/api';

interface TeamCardProps {
  membership: TeamMembership;
  variant?: 'default' | 'compact';
}

export function TeamCard({ membership, variant = 'default' }: TeamCardProps) {
  const { team, role, joinedAt } = membership;
  const joinDate = new Date(joinedAt).toLocaleDateString();
  const router = useRouter();
  
  const handleViewTeam = () => {
    // Navigate to team using alias instead of storing ID in sessionStorage
    if (team.alias) {
      router.push(`/dashboard/teams/${team.alias}`);
    } else {
      // Fallback to old route if no alias (shouldn't happen in normal cases)
      sessionStorage.setItem('currentTeamId', team.id.toString());
      router.push('/dashboard/teams/details');
    }
  };

  if (variant === 'compact') {
    return (
      <div 
        onClick={handleViewTeam}
        className="cursor-pointer hover:outline-2 hover:outline-primary-500 bg-card dark:bg-gray-900 border dark:border-gray-800 rounded-lg shadow-sm p-4 hover:shadow-md transition-shadow"
      >
        <div className="flex items-center space-x-3 mb-3">
          <div className="h-10 w-10 rounded-md overflow-hidden bg-primary/10 dark:bg-gray-800">
            {team.image && (
              <img 
                src={team.image} 
                alt={team.name} 
                className="h-full w-full object-cover"
              />
            )}
          </div>
          <div>
            <h3 className="font-medium">{team.name}</h3>
            {team.alias && (
              <p className="text-xs text-gray-500 dark:text-gray-400">@{team.alias}</p>
            )}
          </div>
        </div>
        <div className="text-sm text-gray-600 dark:text-gray-300 mb-4 line-clamp-2">
          {team.description || 'No description provided'}
        </div>
        <div className="flex justify-between items-center">
          <span className="text-xs bg-primary/10 text-primary dark:bg-gray-800 dark:text-primary px-2 py-1 rounded">
            {role}
          </span>
          <span className="text-xs text-gray-500 dark:text-gray-400">
            Joined {joinDate}
          </span>
        </div>
      </div>
    );
  }
  
  return (
    <div
      onClick={handleViewTeam} 
      className="cursor-pointer hover:outline-2 hover:outline-primary-500 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow"
    >
      <div className="h-32 bg-gray-200 dark:bg-gray-700 relative">
        {team.image && (
          <img 
            src={team.image} 
            alt={team.name} 
            className="h-full w-full object-cover"
          />
        )}
        <div className="absolute bottom-3 left-4">
          <span className="text-xs bg-green-100 dark:bg-green-900/60 text-green-800 dark:text-green-300 px-2 py-1 rounded font-medium">
            {role}
          </span>
        </div>
      </div>
      
      <div className="p-4">
        <h3 className="text-lg font-medium">{team.name}</h3>
        {team.alias && (
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">@{team.alias}</p>
        )}
        <p className="text-sm text-gray-600 dark:text-gray-300 mb-4 line-clamp-2">
          {team.description || 'No description provided'}
        </p>
        <div className="flex justify-between items-center">
          <span className="text-xs text-gray-500 dark:text-gray-400">
            Joined {joinDate}
          </span>
        </div>
      </div>
    </div>
  );
} 
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { User } from '@/lib/api';
import { TeamMembership } from '@/lib/api';
import { api } from '@/lib/api';

export default function TeamsPage() {
  const [user, setUser] = useState<User | null>(null);
  const [teams, setTeams] = useState<TeamMembership[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadTeams() {
      try {
        setLoading(true);
        const userData = await api.users.getCurrent();
        setUser(userData);
        
        const userTeams = await api.users.getUserTeams(userData.id);
        setTeams(userTeams);
        
        setError(null);
      } catch (err) {
        console.error('Error loading teams:', err);
        setError('Failed to load teams data');
      } finally {
        setLoading(false);
      }
    }

    loadTeams();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-pulse text-lg">Loading teams...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-4 rounded-md">
        <p className="text-red-700 dark:text-red-400">{error}</p>
        <button 
          className="mt-2 text-sm font-medium text-red-600 dark:text-red-400 hover:underline"
          onClick={() => window.location.reload()}
        >
          Try again
        </button>
      </div>
    );
  }

  const ownerTeams = teams.filter(team => team.role === 'OWNER');
  const memberTeams = teams.filter(team => team.role !== 'OWNER');

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">My Teams</h1>
        <Link 
          href="/dashboard/teams/create" 
          className="text-sm font-medium px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Create New Team
        </Link>
      </div>

      {teams.length === 0 ? (
        <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-8 text-center">
          <h2 className="text-xl font-medium mb-2">You don't belong to any teams yet</h2>
          <p className="text-gray-500 dark:text-gray-400 mb-6">
            Create your first team to start collaborating with others
          </p>
          <Link 
            href="/dashboard/teams/create" 
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Create a Team
          </Link>
        </div>
      ) : (
        <>
          {/* Teams you own */}
          {ownerTeams.length > 0 && (
            <div>
              <h2 className="text-xl font-semibold mb-4">Teams You Own</h2>
              <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                {ownerTeams.map((membership) => (
                  <TeamCard key={membership.team.id} membership={membership} />
                ))}
              </div>
            </div>
          )}
          
          {/* Teams you're a member of */}
          {memberTeams.length > 0 && (
            <div className="mt-8">
              <h2 className="text-xl font-semibold mb-4">Teams You're In</h2>
              <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                {memberTeams.map((membership) => (
                  <TeamCard key={membership.team.id} membership={membership} />
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

interface TeamCardProps {
  membership: TeamMembership;
}

function TeamCard({ membership }: TeamCardProps) {
  const { team, role, joinedAt } = membership;
  const joinDate = new Date(joinedAt).toLocaleDateString();
  
  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm overflow-hidden">
      <div className="h-32 bg-gray-200 dark:bg-gray-700 relative">
        {team.image && (
          <img 
            src={team.image} 
            alt={team.name} 
            className="h-full w-full object-cover"
          />
        )}
        <div className="absolute bottom-3 left-4">
          <span className="text-xs bg-blue-100 dark:bg-blue-900/60 text-blue-800 dark:text-blue-300 px-2 py-1 rounded font-medium">
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
          <Link 
            href={`/dashboard/teams/${team.id}`}
            className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 hover:underline"
          >
            View Details
          </Link>
        </div>
      </div>
    </div>
  );
} 
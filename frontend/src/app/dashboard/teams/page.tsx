'use client';

import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { TeamMembership } from '@/lib/api';
import { api } from '@/lib/api';
import TeamsLoading from './loading';
import { TeamCard } from '@/components/TeamCard';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
// Component that fetches data and can be wrapped in Suspense
function TeamsContent() { 
  const [teams, setTeams] = useState<TeamMembership[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadTeams() {
      try {
        setLoading(true);
        const userData = await api.users.getCurrent();
        
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
    return <TeamsLoading />;
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

  const adminTeams = teams.filter(team => team.role === 'Administrator');
  const memberTeams = teams.filter(team => team.role !== 'Administrator');

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">My Teams</h1>
        <Button size="sm" asChild>
        <Link 
          href="/dashboard/teams/create" 
          className="text-sm font-medium px-4 py-2 rounded-md"
        >
          <PlusCircle className="mr-1 h-4 w-4" />
          Create New Team
        </Link>
        </Button>
      </div>

      {teams.length === 0 ? (
        <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-8 text-center">
          <h2 className="text-xl font-medium mb-2">You don&apos;t belong to any teams yet</h2>
          <p className="text-gray-500 dark:text-gray-400 mb-6">
            Create your first team to start collaborating with others
          </p>
          <Button size="sm" asChild>
          <Link 
            href="/dashboard/teams/create" 
            className="px-4 py-2 text-white rounded-md"
          >
            Create a Team
          </Link>
          </Button>
        </div>
      ) : (
        <>
          {/* Teams you administer */}
          {adminTeams.length > 0 && (
            <div>
              <h2 className="text-xl font-semibold mb-4">Teams You Administer</h2>
              <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                {adminTeams.map((membership) => (
                  <TeamCard key={membership.team.id} membership={membership} />
                ))}
              </div>
            </div>
          )}
          
          {/* Teams you're a member of */}
          {memberTeams.length > 0 && (
            <div className="mt-8">
              <h2 className="text-xl font-semibold mb-4">Teams You&apos;re In</h2>
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



// Main component that uses Suspense
export default function TeamsPage() {
  return (
    <Suspense fallback={<TeamsLoading />}>
      <TeamsContent />
    </Suspense>
  );
} 
'use client';

import { useEffect, useState, Suspense } from 'react';
import Link from 'next/link';
import { api, TeamMembership } from '@/lib/api';
import { User } from '@/lib/api';
import DashboardLoading from './loading';
import { PlusCircle, Edit } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { TeamCard } from '@/components/TeamCard';
import Image from 'next/image';
// Component that fetches data and can be wrapped in Suspense
function DashboardContent() {
  const [user, setUser] = useState<User | null>(null);
  const [teams, setTeams] = useState<TeamMembership[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadDashboardData() {
      try {
        setLoading(true);
        const currentUser = await api.users.getCurrent();
        setUser(currentUser);
        
        const userTeams = await api.users.getUserTeams(currentUser.id);
        setTeams(userTeams);
        
        setError(null);
      } catch (err) {
        console.error('Error loading dashboard data:', err);
        setError('Failed to load dashboard data. Please try again.');
      } finally {
        setLoading(false);
      }
    }

    loadDashboardData();
  }, []);

  if (loading) {
    return <DashboardLoading />;
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

  return (
    <div className="space-y-6 md:space-y-8">
      <div>
        <h1 className="text-xl md:text-2xl font-bold">
          Welcome, <span className="text-primary">{ "@" + user?.alias}</span>
        </h1>
      </div>

      {/* User Profile Summary */}
      <div className="bg-card dark:bg-gray-900 rounded-lg p-4 md:p-6 shadow-sm border dark:border-gray-800">
        <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4">
          <div className="h-16 w-16 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-800 mb-4 sm:mb-0">
            {user?.image && (
              <img 
                src={user.image} 
                alt={user.name || 'Profile'} 
                className="h-full w-full object-cover"
              />
            )}
          </div>
          <div>
            <h2 className="text-xl font-semibold">{user?.name || 'No name set'}</h2>
            <p className="text-gray-500 dark:text-gray-400">{user?.email}</p>
            {user?.alias && (
              <p className="text-sm text-gray-500 dark:text-gray-400">@{user.alias}</p>
            )}
          </div>
        </div>
        <div className="mt-4">
          <Button variant="outline" size="sm" asChild>
            <Link href="/dashboard/profile" className="inline-flex items-center">
              <Edit className="mr-1 h-4 w-4" />
              Edit Profile
            </Link>
          </Button>
        </div>
      </div>

      {/* Teams Section */}
      <div>
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 gap-2">
          <h2 className="text-xl font-semibold">My Teams</h2>
          <Button size="sm" asChild>
            <Link href="/dashboard/teams/create" className="inline-flex items-center">
              <PlusCircle className="mr-1 h-4 w-4" />
              Create Team
            </Link>
          </Button>
        </div>
        
        {teams.length === 0 ? (
          <div className="bg-card dark:bg-gray-900 rounded-lg p-4 md:p-6 text-center border dark:border-gray-800 shadow-sm">
            <p className="text-gray-500 dark:text-gray-400 mb-4">You don&apos;t belong to any teams yet.</p>
            <Button variant="default" size="sm" asChild>
              <Link href="/dashboard/teams/create" className="inline-flex items-center">
                <PlusCircle className="mr-1 h-4 w-4" />
                Create your first team
              </Link>
            </Button>
          </div>
        ) : (
          <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            {teams.map((membership) => (
              <TeamCard 
                key={membership.team.id} 
                membership={membership} 
                variant="compact"
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// Main component that uses Suspense
export default function DashboardPage() {
  return (
    <Suspense fallback={<DashboardLoading />}>
      <DashboardContent />
    </Suspense>
  );
} 
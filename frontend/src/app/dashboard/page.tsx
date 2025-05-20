'use client';

import { useEffect, useState, Suspense } from 'react';
import Link from 'next/link';
import { api, TeamMembership } from '@/lib/api';
import { User } from '@/lib/api';
import dynamic from 'next/dynamic';
import DashboardLoading from './loading';
import { PlusCircle, Edit } from 'lucide-react';
import { Button } from '@/components/ui/button';

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
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">
          Welcome back, {user?.name || user?.alias || user?.email}
        </p>
      </div>

      {/* User Profile Summary */}
      <div className="bg-card dark:bg-gray-900 rounded-lg p-6 shadow-sm border dark:border-gray-800">
        <div className="flex items-center space-x-4">
          <div className="h-16 w-16 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-800">
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
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">My Teams</h2>
          <Button size="sm" asChild>
            <Link href="/dashboard/teams/create" className="inline-flex items-center">
              <PlusCircle className="mr-1 h-4 w-4" />
              Create Team
            </Link>
          </Button>
        </div>
        
        {teams.length === 0 ? (
          <div className="bg-card dark:bg-gray-900 rounded-lg p-6 text-center border dark:border-gray-800 shadow-sm">
            <p className="text-gray-500 dark:text-gray-400 mb-4">You don't belong to any teams yet.</p>
            <Button variant="default" size="sm" asChild>
              <Link href="/dashboard/teams/create" className="inline-flex items-center">
                <PlusCircle className="mr-1 h-4 w-4" />
                Create your first team
              </Link>
            </Button>
          </div>
        ) : (
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {teams.map((membership) => (
              <div 
                key={membership.team.id} 
                className="bg-card dark:bg-gray-900 border dark:border-gray-800 rounded-lg shadow-sm p-4"
              >
                <div className="flex items-center space-x-3 mb-3">
                  <div className="h-10 w-10 rounded-md overflow-hidden bg-primary/10 dark:bg-gray-800">
                    {membership.team.image && (
                      <img 
                        src={membership.team.image} 
                        alt={membership.team.name} 
                        className="h-full w-full object-cover"
                      />
                    )}
                  </div>
                  <div>
                    <h3 className="font-medium">{membership.team.name}</h3>
                    {membership.team.alias && (
                      <p className="text-xs text-gray-500 dark:text-gray-400">@{membership.team.alias}</p>
                    )}
                  </div>
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                  {membership.team.description || 'No description'}
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs bg-primary/10 text-primary dark:bg-gray-800 dark:text-primary px-2 py-1 rounded">
                    {membership.role}
                  </span>
                  <Button variant="link" size="sm" className="text-primary dark:text-primary p-0" asChild>
                    <Link href={`/dashboard/teams/${membership.team.id}`}>
                      View →
                    </Link>
                  </Button>
                </div>
              </div>
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
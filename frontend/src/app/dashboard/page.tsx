'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { api, User, TeamMembership } from '@/lib/api';

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null);
  const [teams, setTeams] = useState<TeamMembership[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadDashboardData() {
      try {
        setLoading(true);
        const currentUser = await api.getCurrentUser();
        setUser(currentUser);
        
        const userTeams = await api.getUserTeams(currentUser.id);
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
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-pulse text-lg">Loading dashboard...</div>
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

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">
          Welcome back, {user?.name || user?.alias || user?.email}
        </p>
      </div>

      {/* User Profile Summary */}
      <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-6">
        <div className="flex items-center space-x-4">
          <div className="h-16 w-16 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-700">
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
          <Link 
            href="/dashboard/profile" 
            className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:underline"
          >
            Edit Profile →
          </Link>
        </div>
      </div>

      {/* Teams Section */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">My Teams</h2>
          <Link 
            href="/dashboard/teams/create" 
            className="text-sm font-medium px-3 py-1.5 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Create Team
          </Link>
        </div>
        
        {teams.length === 0 ? (
          <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-6 text-center">
            <p className="text-gray-500 dark:text-gray-400 mb-4">You don't belong to any teams yet.</p>
            <Link 
              href="/dashboard/teams/create" 
              className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:underline"
            >
              Create your first team →
            </Link>
          </div>
        ) : (
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {teams.map((membership) => (
              <div 
                key={membership.team.id} 
                className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm p-4"
              >
                <div className="flex items-center space-x-3 mb-3">
                  <div className="h-10 w-10 rounded-md overflow-hidden bg-gray-200 dark:bg-gray-700">
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
                  <span className="text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 px-2 py-1 rounded">
                    {membership.role}
                  </span>
                  <Link 
                    href={`/dashboard/teams/${membership.team.id}`}
                    className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:underline"
                  >
                    View →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
} 
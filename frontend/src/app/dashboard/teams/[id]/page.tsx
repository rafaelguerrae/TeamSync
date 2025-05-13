'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { api, Team, TeamMember, User } from '@/lib/api';

export default function TeamDetailPage() {
  const params = useParams();
  const router = useRouter();
  const teamId = Number(params.id);
  
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [team, setTeam] = useState<Team | null>(null);
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteConfirmName, setDeleteConfirmName] = useState('');

  useEffect(() => {
    async function loadTeamData() {
      try {
        setLoading(true);
        
        // Load current user
        const user = await api.getCurrentUser();
        setCurrentUser(user);
        
        // Load team details
        const teamData = await api.getTeam(teamId);
        setTeam(teamData);
        
        // Load team members
        const teamMembers = await api.getTeamMembers(teamId);
        setMembers(teamMembers);
        
        // Find current user's role in this team
        const userMembership = teamMembers.find(member => member.user.id === user.id);
        if (userMembership) {
          setUserRole(userMembership.role);
        }
        
        setError(null);
      } catch (err) {
        console.error('Error loading team data:', err);
        setError('Failed to load team data. Please try again.');
      } finally {
        setLoading(false);
      }
    }

    if (teamId) {
      loadTeamData();
    }
  }, [teamId]);

  const handleDeleteTeam = async () => {
    if (!team || team.name !== deleteConfirmName) {
      return;
    }
    
    try {
      setIsDeleting(true);
      await api.deleteTeam(teamId);
      router.push('/dashboard/teams');
    } catch (err) {
      console.error('Error deleting team:', err);
      setError('Failed to delete team. Please try again.');
      setIsDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-pulse text-lg">Loading team details...</div>
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

  if (!team) {
    return (
      <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 p-4 rounded-md">
        <p className="text-yellow-700 dark:text-yellow-400">Team not found.</p>
        <Link 
          href="/dashboard/teams"
          className="mt-2 text-sm font-medium text-yellow-600 dark:text-yellow-400 hover:underline"
        >
          Go back to teams
        </Link>
      </div>
    );
  }

  const isOwner = userRole === 'OWNER';
  
  return (
    <div className="space-y-8">
      {/* Team Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center space-x-4">
          <div className="h-16 w-16 rounded-md overflow-hidden bg-gray-200 dark:bg-gray-700">
            {team.image && (
              <img 
                src={team.image} 
                alt={team.name} 
                className="h-full w-full object-cover"
              />
            )}
          </div>
          <div>
            <h1 className="text-2xl font-bold">{team.name}</h1>
            {team.alias && (
              <p className="text-gray-500 dark:text-gray-400">@{team.alias}</p>
            )}
          </div>
        </div>
        
        {isOwner && (
          <div className="flex space-x-3">
            <Link
              href={`/dashboard/teams/${team.id}/edit`}
              className="px-3 py-1.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-md hover:bg-blue-200 dark:hover:bg-blue-800/50 text-sm font-medium"
            >
              Edit Team
            </Link>
            <button
              onClick={() => setIsDeleting(true)}
              className="px-3 py-1.5 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-md hover:bg-red-200 dark:hover:bg-red-800/50 text-sm font-medium"
            >
              Delete Team
            </button>
          </div>
        )}
      </div>
      
      {/* Team Description */}
      {team.description && (
        <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4">
          <h2 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
            Description
          </h2>
          <p className="text-gray-700 dark:text-gray-300">
            {team.description}
          </p>
        </div>
      )}
      
      {/* Team Members */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Team Members</h2>
          {isOwner && (
            <Link
              href={`/dashboard/teams/${team.id}/members/add`}
              className="text-sm font-medium px-3 py-1.5 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Add Member
            </Link>
          )}
        </div>
        
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-800">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Role
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Joined
                </th>
                {isOwner && (
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Actions
                  </th>
                )}
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {members.map((member) => (
                <tr key={member.user.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-3">
                      <div className="h-8 w-8 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-700">
                        {member.user.image && (
                          <img 
                            src={member.user.image} 
                            alt={member.user.name || 'User'} 
                            className="h-full w-full object-cover"
                          />
                        )}
                      </div>
                      <div>
                        <div className="font-medium text-gray-900 dark:text-white">
                          {member.user.name || 'No name'}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {member.user.email}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      member.role === 'OWNER' 
                        ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300' 
                        : 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300'
                    }`}>
                      {member.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {new Date(member.joinedAt).toLocaleDateString()}
                  </td>
                  {isOwner && member.user.id !== currentUser?.id && (
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                      <button
                        className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 mr-3"
                        onClick={() => {
                          // Change role functionality would go here
                          alert('Change role functionality not implemented yet');
                        }}
                      >
                        Change Role
                      </button>
                      <button
                        className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300"
                        onClick={() => {
                          if (confirm(`Remove ${member.user.name || member.user.email} from this team?`)) {
                            api.removeTeamMember(teamId, member.user.id)
                              .then(() => {
                                setMembers(members.filter(m => m.user.id !== member.user.id));
                              })
                              .catch(err => {
                                console.error('Error removing member:', err);
                                setError('Failed to remove team member');
                              });
                          }
                        }}
                      >
                        Remove
                      </button>
                    </td>
                  )}
                  {(!isOwner || member.user.id === currentUser?.id) && isOwner && (
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                      {member.user.id === currentUser?.id ? (
                        <span className="text-gray-400 dark:text-gray-500">
                          You
                        </span>
                      ) : (
                        <span>-</span>
                      )}
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      
      {/* Delete Team Confirmation Modal */}
      {isDeleting && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-md w-full p-6">
            <h3 className="text-lg font-bold text-red-600 dark:text-red-400 mb-4">
              Delete Team
            </h3>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              This action cannot be undone. The team and all its data will be permanently deleted.
            </p>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              To confirm, please type the team name: <span className="font-bold">{team.name}</span>
            </p>
            <input
              type="text"
              value={deleteConfirmName}
              onChange={(e) => setDeleteConfirmName(e.target.value)}
              placeholder="Type team name to confirm"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500 dark:bg-gray-800 mb-4"
            />
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => {
                  setIsDeleting(false);
                  setDeleteConfirmName('');
                }}
                className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteTeam}
                disabled={team.name !== deleteConfirmName}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
              >
                Delete Team
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 
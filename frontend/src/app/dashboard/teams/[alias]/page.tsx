'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { Team, TeamMember, User, api } from '@/lib/api';
import Image from 'next/image';

export default function TeamDetailPage() {
  const router = useRouter();
  const params = useParams();
  const alias = params.alias as string;
  
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [team, setTeam] = useState<Team | null>(null);
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteConfirmName, setDeleteConfirmName] = useState('');
  
  // Add Member Modal state
  const [isAddingMembers, setIsAddingMembers] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<User[]>([]);
  const [selectedRole, setSelectedRole] = useState('Member');
  const [isSearching, setIsSearching] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [addMemberError, setAddMemberError] = useState<string | null>(null);

  // Add a ref for the modal
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function loadTeamData() {
      if (!alias) return;
      
      try {
        setLoading(true);
        
        // Load current user
        const user = await api.users.getCurrent();
        setCurrentUser(user);
        
        // Load team details by alias
        const teamData = await api.teams.getByAlias(alias);
        setTeam(teamData);
        
        // Load team members using the alias (more efficient)
        const teamMembers = await api.teams.members.getAllByAlias(alias);
        setMembers(teamMembers);
        
        // Find current user's role in this team
        const userMembership = teamMembers.find(member => member.user.id === user.id);
        if (userMembership) {
          setUserRole(userMembership.role);
        }
        
        setError(null);
      } catch (err) {
        console.error('Error loading team data:', err);
        const errorMessage = err instanceof Error ? err.message : 'Failed to load team data. Please try again.';
        
        // Handle access control errors specifically
        if (errorMessage.includes('permission') || errorMessage.includes('access')) {
          setError('You do not have access to this team. You must be a team member to view team details.');
        } else if (errorMessage.includes('not found')) {
          setError('Team not found. Please check the team alias and try again.');
        } else {
          setError(errorMessage);
        }
      } finally {
        setLoading(false);
      }
    }

    if (alias) {
      loadTeamData();
    }
  }, [alias]);

  const handleDeleteTeam = async () => {
    if (!team || team.name !== deleteConfirmName) {
      return;
    }
    
    try {
      setIsDeleting(true);
      await api.teams.delete(team.id);
      router.push('/dashboard/teams');
    } catch (err) {
      console.error('Error deleting team:', err);
      setError('Failed to delete team. Please try again.');
      setIsDeleting(false);
    }
  };  

  // Handler for searching users
  const handleSearch = async () => {
    if (!searchQuery.trim() || !team) return;
    
    try {
      setIsSearching(true);
      setAddMemberError(null);
      const users = await api.users.search(searchQuery);
      
      // Filter out users that are already team members
      const existingMemberIds = members.map(member => member.user.id);
      const filteredUsers = users.filter(user => !existingMemberIds.includes(user.id));
      
      setSearchResults(filteredUsers);
    } catch (err) {
      console.error('Error searching users:', err);
      setAddMemberError('Failed to search users. Please try again.');
    } finally {
      setIsSearching(false);
    }
  };
  
  // Handler for toggling user selection
  const toggleUserSelection = (user: User) => {
    if (selectedUsers.some(u => u.id === user.id)) {
      setSelectedUsers(selectedUsers.filter(u => u.id !== user.id));
    } else {
      setSelectedUsers([...selectedUsers, user]);
    }
  };
  
  // Handler for adding selected members
  const handleAddMembers = async () => {
    if (selectedUsers.length === 0 || !team) return;
    
    try {
      setIsSubmitting(true);
      setAddMemberError(null);
      
      // Add each selected user to the team
      const addPromises = selectedUsers.map(user => 
        api.teams.members.add(team.id, user.id, selectedRole)
      );
      
      await Promise.all(addPromises);
      
      // Reload team members
      const teamMembers = await api.teams.members.getAll(team.id);
      setMembers(teamMembers);
      
      // Reset state and close modal
      setSelectedUsers([]);
      setSearchResults([]);
      setSearchQuery('');
      setIsAddingMembers(false);
    } catch (err) {
      console.error('Error adding members:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to add members';
      
      if (errorMessage.includes('permission') || errorMessage.includes('access')) {
        setAddMemberError('You do not have permission to add members to this team. Only team administrators can add members.');
      } else {
        setAddMemberError('Failed to add one or more members. They might already be part of the team.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Close the add member modal
  const closeAddMemberModal = () => {
    setIsAddingMembers(false);
    setSearchQuery('');
    setSearchResults([]);
    setSelectedUsers([]);
    setAddMemberError(null);
  };

  // Add a click outside handler
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        closeAddMemberModal();
      }
    }
    
    if (isAddingMembers) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isAddingMembers]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-6 rounded-md">
        <h2 className="text-lg font-medium text-red-800 dark:text-red-400 mb-2">Error</h2>
        <p className="text-red-700 dark:text-red-400 mb-4">{error}</p>
        <div className="flex gap-2">
          <button 
            className="text-sm font-medium text-red-600 dark:text-red-400 hover:underline"
            onClick={() => window.location.reload()}
          >
            Try again
          </button>
          <Link 
            href="/dashboard/teams"
            className="text-sm font-medium text-red-600 dark:text-red-400 hover:underline"
          >
            Back to teams
          </Link>
        </div>
      </div>
    );
  }

  if (!team) {
    return (
      <div className="bg-gray-50 dark:bg-gray-800/50 p-6 rounded-md">
        <p className="text-gray-600 dark:text-gray-400">Team not found.</p>
        <Link 
          href="/dashboard/teams"
          className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:underline"
        >
          Back to teams
        </Link>
      </div>
    );
  }

  const isAdmin = userRole === 'Administrator';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center space-x-4">
          <Link 
            href="/dashboard/teams"
            className="text-blue-600 dark:text-blue-400 hover:underline text-sm"
          >
            ← Back to Teams
          </Link>
        </div>
      </div>

      {/* Team Info */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
        <div className="h-32 bg-gray-200 dark:bg-gray-700 relative">
          {team.image && (
            <img 
              src={team.image} 
              alt={team.name} 
              className="h-full w-full object-cover"
            />
          )}
        </div>
        
        <div className="p-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h1 className="text-2xl font-bold">{team.name}</h1>
              {team.alias && (
                <p className="text-gray-500 dark:text-gray-400">@{team.alias}</p>
              )}
              <p className="text-gray-600 dark:text-gray-300 mt-2">
                {team.description || 'No description provided'}
              </p>
            </div>
            
            {userRole && (
              <span className="text-sm bg-green-100 dark:bg-green-900/60 text-green-800 dark:text-green-300 px-3 py-1 rounded-full font-medium">
                {userRole}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Members Section */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">Team Members ({members.length})</h2>
          {isAdmin && (
            <button
              onClick={() => setIsAddingMembers(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium"
            >
              Add Members
            </button>
          )}
        </div>

        <div className="space-y-4">
          {members.map((member) => (
            <div key={member.user.id} className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="h-10 w-10 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center">
                  {member.user.image ? (
                    <img 
                      src={member.user.image} 
                      alt={member.user.name || member.user.email} 
                      className="h-10 w-10 rounded-full object-cover"
                    />
                  ) : (
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
                      {(member.user.name || member.user.email).charAt(0).toUpperCase()}
                    </span>
                  )}
                </div>
                <div>
                  <p className="font-medium">{member.user.name || member.user.email}</p>
                  {member.user.alias && (
                    <p className="text-sm text-gray-500 dark:text-gray-400">@{member.user.alias}</p>
                  )}
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Joined {new Date(member.joinedAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <span className="text-sm bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300 px-2 py-1 rounded font-medium">
                  {member.role}
                </span>
                {isAdmin && member.user.id !== currentUser?.id && (
                  <button
                    onClick={async () => {
                      try {
                        await api.teams.members.remove(team.id, member.user.id);
                        const updatedMembers = await api.teams.members.getAll(team.id);
                        setMembers(updatedMembers);
                      } catch (err) {
                        console.error('Error removing member:', err);
                        setError('Failed to remove member. Please try again.');
                      }
                    }}
                    className="text-red-600 hover:text-red-800 text-sm"
                  >
                    Remove
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Admin Actions */}
      {isAdmin && (
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4 text-red-600 dark:text-red-400">Danger Zone</h2>
          
          <div className="border border-red-200 dark:border-red-800 rounded-lg p-4">
            <h3 className="font-medium text-red-800 dark:text-red-400 mb-2">Delete Team</h3>
            <p className="text-sm text-red-600 dark:text-red-400 mb-4">
              This action cannot be undone. This will permanently delete the team and remove all members.
            </p>
            
            <div className="space-y-3">
              <input
                type="text"
                placeholder={`Type "${team.name}" to confirm`}
                value={deleteConfirmName}
                onChange={(e) => setDeleteConfirmName(e.target.value)}
                className="w-full px-3 py-2 border border-red-300 dark:border-red-700 rounded-md text-sm"
              />
              
              <button
                onClick={handleDeleteTeam}
                disabled={isDeleting || team.name !== deleteConfirmName}
                className="bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white px-4 py-2 rounded-md text-sm font-medium disabled:cursor-not-allowed"
              >
                {isDeleting ? 'Deleting...' : 'Delete Team'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Members Modal */}
      {isAddingMembers && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div ref={modalRef} className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold mb-4">Add Team Members</h3>
            
            {addMemberError && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-3 rounded-md mb-4">
                <p className="text-red-700 dark:text-red-400 text-sm">{addMemberError}</p>
              </div>
            )}
            
            <div className="space-y-4">
              <div className="flex space-x-2">
                <input
                  type="text"
                  placeholder="Search users by name or email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm"
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                />
                <button
                  onClick={handleSearch}
                  disabled={isSearching || !searchQuery.trim()}
                  className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-4 py-2 rounded-md text-sm font-medium"
                >
                  {isSearching ? 'Searching...' : 'Search'}
                </button>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Role</label>
                <select
                  value={selectedRole}
                  onChange={(e) => setSelectedRole(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm"
                >
                  <option value="Member">Member</option>
                  <option value="Administrator">Administrator</option>
                </select>
              </div>
              
              {searchResults.length > 0 && (
                <div>
                  <label className="block text-sm font-medium mb-2">Select Users</label>
                  <div className="max-h-40 overflow-y-auto space-y-2">
                    {searchResults.map((user) => (
                      <label key={user.id} className="flex items-center space-x-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={selectedUsers.some(u => u.id === user.id)}
                          onChange={() => toggleUserSelection(user)}
                          className="rounded"
                        />
                        <span className="text-sm">{user.name || user.email}</span>
                        {user.alias && (
                          <span className="text-xs text-gray-500">@{user.alias}</span>
                        )}
                      </label>
                    ))}
                  </div>
                </div>
              )}
              
              <div className="flex justify-end space-x-2 pt-4">
                <button
                  onClick={closeAddMemberModal}
                  className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddMembers}
                  disabled={isSubmitting || selectedUsers.length === 0}
                  className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-4 py-2 rounded-md text-sm font-medium"
                >
                  {isSubmitting ? 'Adding...' : `Add ${selectedUsers.length} Member${selectedUsers.length !== 1 ? 's' : ''}`}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 
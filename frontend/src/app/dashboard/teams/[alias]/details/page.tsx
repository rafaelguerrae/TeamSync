'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Team, TeamMember, User, api } from '@/lib/api';
import Image from 'next/image';
export default function TeamDetailPage() {
  const router = useRouter();
  const [teamId, setTeamId] = useState<number | null>(null);
  
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
  const [selectedRole, setSelectedRole] = useState('MEMBER');
  const [isSearching, setIsSearching] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [addMemberError, setAddMemberError] = useState<string | null>(null);

  // Add a ref for the modal
  const modalRef = useRef<HTMLDivElement>(null);
  
  // Get teamId from sessionStorage
  useEffect(() => {
    const id = sessionStorage.getItem('currentTeamId');
    if (id) {
      setTeamId(Number(id));
    } else {
      setError('Team ID not found. Please go back to the teams page.');
    }
  }, []);

  useEffect(() => {
    async function loadTeamData() {
      if (!teamId) return;
      
      try {
        setLoading(true);
        
        // Load current user
        const user = await api.users.getCurrent();
        setCurrentUser(user);
        
        // Load team details
        const teamData = await api.teams.getOne(teamId);
        setTeam(teamData);
        
        // Load team members
        const teamMembers = await api.teams.members.getAll(teamId);
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
    if (!team || teamId === null || team.name !== deleteConfirmName) {
      return;
    }
    
    try {
      setIsDeleting(true);
      await api.teams.delete(teamId);
      // Clear the sessionStorage before navigating back
      sessionStorage.removeItem('currentTeamId');
      router.push('/dashboard/teams');
    } catch (err) {
      console.error('Error deleting team:', err);
      setError('Failed to delete team. Please try again.');
      setIsDeleting(false);
    }
  };  
  // Handler for searching users
  const handleSearch = async () => {
    if (!searchQuery.trim() || teamId === null) return;
    
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
    if (selectedUsers.length === 0 || teamId === null) return;
    
    try {
      setIsSubmitting(true);
      setAddMemberError(null);
      
      // Add each selected user to the team
      const addPromises = selectedUsers.map(user => 
        api.teams.members.add(teamId, user.id, selectedRole)
      );
      
      await Promise.all(addPromises);
      
      // Reload team members
      const teamMembers = await api.teams.members.getAll(teamId);
      setMembers(teamMembers);
      
      // Reset state and close modal
      setSelectedUsers([]);
      setSearchResults([]);
      setSearchQuery('');
      setIsAddingMembers(false);
    } catch (err) {
      console.error('Error adding members:', err);
      setAddMemberError('Failed to add one or more members. They might already be part of the team.');
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

  const isOwner = userRole === 'Administrator';
  
    return (    <div className="space-y-8">      {/* Team Header */}      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">        <div className="flex items-center space-x-4">          <div className="h-16 w-16 rounded-md overflow-hidden bg-gray-200 dark:bg-gray-700">            {team.image && (              <img                 src={team.image}                 alt={team.name}                 className="h-full w-full object-cover"              />            )}          </div>          <div>            <h1 className="text-2xl font-bold">{team.name}</h1>            {team.alias && (              <p className="text-gray-500 dark:text-gray-400">@{team.alias}</p>            )}          </div>        </div>                {isOwner && (          <div className="flex space-x-3">            <Link              href={`/dashboard/teams/edit`}              onClick={() => sessionStorage.setItem('editTeamId', team.id.toString())}              className="px-3 py-1.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-md hover:bg-blue-200 dark:hover:bg-blue-800/50 text-sm font-medium"            >              Edit Team            </Link>
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
            <button
              onClick={() => setIsAddingMembers(true)}
              className="hover:cursor-pointer flex items-center gap-1 px-4 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path d="M8 9a3 3 0 100-6 3 3 0 000 6zM8 11a6 6 0 016 6H2a6 6 0 016-6zM16 7a1 1 0 10-2 0v1h-1a1 1 0 100 2h1v1a1 1 0 102 0v-1h1a1 1 0 100-2h-1V7z" />
              </svg>
            </button>
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
                                                onClick={() => {                          if (teamId === null) return;                          if (confirm(`Remove ${member.user.name || member.user.email} from this team?`)) {                            api.teams.members.remove(teamId, member.user.id)                              .then(() => {                                setMembers(members.filter(m => m.user.id !== member.user.id));                              })                              .catch(err => {                                console.error('Error removing member:', err);                                setError('Failed to remove team member');                              });                          }                        }}
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
        <div className="fixed inset-0 backdrop-blur-sm bg-white/30 dark:bg-black/30 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-md w-full p-6 shadow-xl">
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
      
      {/* Add Members Modal */}
      {isAddingMembers && (
        <div className="fixed inset-0 backdrop-blur-sm bg-white/30 dark:bg-black/30 flex items-center justify-center p-4 z-50">
          <div ref={modalRef} className="bg-white dark:bg-gray-800 rounded-lg max-w-2xl w-full p-6 shadow-xl">
            <div className="flex justify-end items-center mb-4">
              <button 
                onClick={closeAddMemberModal}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 hover:cursor-pointer"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            {addMemberError && (
              <div className="mb-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-3 rounded-md">
                <p className="text-red-700 dark:text-red-400 text-sm">{addMemberError}</p>
              </div>
            )}
            
            <div className="mb-4">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by name, email or username"
                  className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700"
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                />
                <button
                  onClick={handleSearch}
                  disabled={isSearching || !searchQuery.trim()}
                  className="px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 flex items-center"
                >
                  {isSearching ? (
                    <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                    </svg>
                  )}
                </button>
              </div>
            </div>
            
            {/* Search Results */}
            {searchResults.length > 0 && (
              <div className="mb-4">
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Search Results</h4>
                <div className="max-h-40 overflow-y-auto border border-gray-200 dark:border-gray-700 rounded-md">
                  <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                    {searchResults.map((user) => {
                      const isSelected = selectedUsers.some(u => u.id === user.id);
                      return (
                        <li 
                          key={user.id}
                          onClick={() => toggleUserSelection(user)}
                          className={`p-3 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer ${
                            isSelected ? 'bg-blue-50 dark:bg-blue-900/30' : ''
                          }`}
                        >
                          <div className="flex items-center">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => {}}
                              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded mr-3"
                            />
                            <div className="flex items-center space-x-3 flex-1">
                              <div className="h-8 w-8 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-700">
                                {user.image && (
                                  <img 
                                    src={user.image} 
                                    alt={user.name || 'User'} 
                                    className="h-full w-full object-cover"
                                  />
                                )}
                              </div>
                              <div>
                                <p className="font-medium">{user.name || 'No name'}</p>
                                <p className="text-sm text-gray-500 dark:text-gray-400">{user.email}</p>
                                {user.alias && (
                                  <p className="text-xs text-gray-400 dark:text-gray-500">@{user.alias}</p>
                                )}
                              </div>
                            </div>
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              </div>
            )}
            
            {searchResults.length === 0 && searchQuery && !isSearching && (
              <p className="text-gray-500 dark:text-gray-400 text-sm mb-4">No users found matching your search criteria.</p>
            )}
            
            {/* Selected Users */}
            {selectedUsers.length > 0 && (
              <div className="mb-4">
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Selected Users ({selectedUsers.length})
                </h4>
                <div className="flex flex-wrap gap-2">
                  {selectedUsers.map(user => (
                    <div 
                      key={user.id}
                      className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 rounded-full flex items-center text-sm"
                    >
                      <span>{"@" + user.alias}</span>
                      <button 
                        onClick={() => toggleUserSelection(user)}
                        className="ml-2 text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {/* Role Selection */}
            {selectedUsers.length > 0 && (
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Role for new members
                </label>
                <select
                  value={selectedRole}
                  onChange={(e) => setSelectedRole(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700"
                >
                  <option value="Member">Member</option>
                  <option value="Administrator">Administrator</option>
                </select>
              </div>
            )}
            
            <div className="flex justify-end space-x-3 mt-4">
              <button
                onClick={handleAddMembers}
                disabled={selectedUsers.length === 0 || isSubmitting}
                className=" flex items-center gap-2 p-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 hover:cursor-pointer focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M8 9a3 3 0 100-6 3 3 0 000 6zM8 11a6 6 0 016 6H2a6 6 0 016-6zM16 7a1 1 0 10-2 0v1h-1a1 1 0 100 2h1v1a1 1 0 102 0v-1h1a1 1 0 100-2h-1V7z" />
                  </svg>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 
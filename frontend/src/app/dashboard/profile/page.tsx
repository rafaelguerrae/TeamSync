'use client';

import { api, User } from '@/lib/api';
import { useState, useEffect, FormEvent, Suspense } from 'react';
import dynamic from 'next/dynamic';
import ProfileLoading from './loading';
import { User as UserIcon, KeyRound } from 'lucide-react';

// Component that fetches data and can be wrapped in Suspense
function ProfileContent() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [savingInfo, setSavingInfo] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  
  const [userInfoForm, setUserInfoForm] = useState({
    name: '',
    alias: '',
    email: '',
  });

  const [passwordForm, setPasswordForm] = useState({
    password: '',
    confirmPassword: '',
  });

  // Default avatar URL using UI Avatars
  const getDefaultAvatarUrl = (name: string) => {
    const formattedName = encodeURIComponent(name || "User");
    return `https://ui-avatars.com/api/?name=${formattedName}&background=0D8ABC&color=fff`;
  };

  useEffect(() => {
    async function loadProfile() {
      try {
        setLoading(true);
        const userData = await api.users.getCurrent();
        setUser(userData);
        
        // Initialize form with user data
        setUserInfoForm({
          name: userData.name || '',
          alias: userData.alias || '',
          email: userData.email,
        });
        
        setError(null);
      } catch (err) {
        console.error('Error loading profile:', err);
        setError('Failed to load profile data');
      } finally {
        setLoading(false);
      }
    }

    loadProfile();
  }, []);

  const handleUserInfoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setUserInfoForm(prev => ({ ...prev, [name]: value }));
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswordForm(prev => ({ ...prev, [name]: value }));
  };

  const handleUserInfoSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    // Clear previous messages
    setError(null);
    setSuccessMessage(null);
    
    try {
      setSavingInfo(true);
      
      // Only send the fields that have changed
      const updateData: Partial<User> = {};
      
      if (userInfoForm.name !== user?.name) {
        updateData.name = userInfoForm.name;
        // Automatically generate image URL based on name
        updateData.image = getDefaultAvatarUrl(userInfoForm.name);
      }
      if (userInfoForm.alias !== user?.alias) updateData.alias = userInfoForm.alias;
      if (userInfoForm.email !== user?.email) updateData.email = userInfoForm.email;
      
      if (Object.keys(updateData).length === 0) {
        setSuccessMessage('No changes to save');
        return;
      }
      
      const updatedUser = await api.users.update(user!.id, updateData);
      setUser(updatedUser);
      
      setSuccessMessage('Profile information updated successfully');
    } catch (err) {
      console.error('Error updating profile:', err);
      setError('Failed to update profile information');
    } finally {
      setSavingInfo(false);
    }
  };

  const handlePasswordSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    // Clear previous messages
    setError(null);
    setSuccessMessage(null);
    
    // Validate passwords match if provided
    if (!passwordForm.password) {
      setError('Please enter a new password');
      return;
    }
    
    if (passwordForm.password !== passwordForm.confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    
    try {
      setSavingPassword(true);
      
      const updateData: Partial<User> = {
        password: passwordForm.password
      };
      
      await api.users.update(user!.id, updateData);
      
      // Reset password fields
      setPasswordForm({
        password: '',
        confirmPassword: '',
      });
      
      setSuccessMessage('Password updated successfully');
    } catch (err) {
      console.error('Error updating password:', err);
      setError('Failed to update password');
    } finally {
      setSavingPassword(false);
    }
  };

  if (loading) {
    return <ProfileLoading />;
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Edit Profile</h1>
      
      {error && (
        <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded text-red-700 dark:text-red-400">
          {error}
        </div>
      )}
      
      {successMessage && (
        <div className="mb-4 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded text-green-700 dark:text-green-400">
          {successMessage}
        </div>
      )}
      
      <div className="grid grid-cols-1 gap-12 lg:grid-cols-2">
        {/* User Info Column */}
        <div className="space-y-6">
          <div>
            <h2 className="text-lg font-medium mb-4 flex items-center">
              <UserIcon className="h-5 w-5 mr-2" />
              User Information
            </h2>
          </div>
          
          <form onSubmit={handleUserInfoSubmit} className="space-y-6">
            <div className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Name
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  value={userInfoForm.name}
                  onChange={handleUserInfoChange}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800"
                />
              </div>
              
              <div>
                <label htmlFor="alias" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Username
                </label>
                <input
                  id="alias"
                  name="alias"
                  type="text"
                  value={userInfoForm.alias}
                  onChange={handleUserInfoChange}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800"
                />
              </div>
              
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Email Address
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={userInfoForm.email}
                  onChange={handleUserInfoChange}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800"
                  required
                />
              </div>
            </div>
            
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={savingInfo}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
              >
                {savingInfo ? 'Saving...' : 'Save Information'}
              </button>
            </div>
          </form>
        </div>
        
        {/* Password Column */}
        <div className="space-y-6 lg:border-l lg:border-gray-200 lg:dark:border-gray-700 lg:pl-12">
          <div>
            <h2 className="text-lg font-medium mb-4 flex items-center">
              <KeyRound className="h-5 w-5 mr-2" />
              Password Reset
            </h2>
          </div>
          
          <form onSubmit={handlePasswordSubmit} className="space-y-6">
            <div className="space-y-4">
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                Enter your new password below.
              </p>
              
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  New Password
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  value={passwordForm.password}
                  onChange={handlePasswordChange}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800"
                />
              </div>
              
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Confirm New Password
                </label>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  value={passwordForm.confirmPassword}
                  onChange={handlePasswordChange}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800"
                />
              </div>
            </div>
            
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={savingPassword}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
              >
                {savingPassword ? 'Updating...' : 'Update Password'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

// Main component that uses Suspense
export default function ProfilePage() {
  return (
    <Suspense fallback={<ProfileLoading />}>
      <ProfileContent />
    </Suspense>
  );
} 
'use client';

import { api, User } from '@/lib/api';
import { useState, useEffect, FormEvent, Suspense } from 'react';
import ProfileLoading from './loading';
import { User as UserIcon, KeyRound, Save } from 'lucide-react';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

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
      
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        {/* User Info Column */}
        <Card className="dark:bg-gray-900 dark:border-gray-800">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg font-medium flex items-center">
              <UserIcon className="h-5 w-5 mr-2 text-primary" />
              User Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleUserInfoSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  name="name"
                  type="text"
                  value={userInfoForm.name}
                  onChange={handleUserInfoChange}
                  className="dark:bg-gray-800 dark:border-gray-700"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="alias">Username</Label>
                <div className="flex">
                  <div className="inline-flex items-center px-3 border border-r-0 rounded-l-md border-input bg-muted dark:bg-gray-800 dark:border-gray-700">
                    @
                  </div>
                  <Input
                    id="alias"
                    name="alias"
                    type="text"
                    value={userInfoForm.alias}
                    onChange={handleUserInfoChange}
                    className="rounded-l-none dark:bg-gray-800 dark:border-gray-700"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={userInfoForm.email}
                  onChange={handleUserInfoChange}
                  className="dark:bg-gray-800 dark:border-gray-700"
                />
              </div>
              
              <Button 
                type="submit" 
                disabled={savingInfo}
                className="w-full"
              >
                {savingInfo ? (
                  <span className="flex items-center">
                    <span className="animate-spin mr-2">
                      <svg className="h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                    </span>
                    Saving...
                  </span>
                ) : (
                  <span className="flex items-center">
                    <Save className="mr-2 h-4 w-4" />
                    Save Information
                  </span>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Password Column */}
        <Card className="dark:bg-gray-900 dark:border-gray-800">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg font-medium flex items-center">
              <KeyRound className="h-5 w-5 mr-2 text-primary" />
              Change Password
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="password">New Password</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  value={passwordForm.password}
                  onChange={handlePasswordChange}
                  className="dark:bg-gray-800 dark:border-gray-700"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  value={passwordForm.confirmPassword}
                  onChange={handlePasswordChange}
                  className="dark:bg-gray-800 dark:border-gray-700"
                />
              </div>
              
              <Button 
                type="submit" 
                disabled={savingPassword}
                className="w-full"
              >
                {savingPassword ? (
                  <span className="flex items-center">
                    <span className="animate-spin mr-2">
                      <svg className="h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                    </span>
                    Updating...
                  </span>
                ) : (
                  <span className="flex items-center">
                    <Save className="mr-2 h-4 w-4" />
                    Update Password
                  </span>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
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
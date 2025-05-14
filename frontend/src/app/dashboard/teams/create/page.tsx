'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { apiClient } from '@/lib/api-client';

export default function CreateTeamPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    name: '',
    alias: '',
    description: '',
    image: 'https://ui-avatars.com/api/?background=0D8ABC&color=fff&name=Team',
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    
    if (!formData.name.trim()) {
      setError('Team name is required');
      return;
    }
    
    // Auto-generate image if empty
    if (!formData.image.trim()) {
      const encodedName = encodeURIComponent(formData.name);
      formData.image = `https://ui-avatars.com/api/?background=0D8ABC&color=fff&name=${encodedName}`;
    }
    
    try {
      setLoading(true);
      
      // Create a clean payload, only including alias if it has a value
      const payload: {
        name: string;
        description?: string;
        image: string;
        alias?: string;
      } = {
        name: formData.name,
        description: formData.description || undefined,
        image: formData.image,
      };
      
      // Only add alias if it's not empty
      if (formData.alias.trim()) {
        payload.alias = formData.alias.trim();
      }
      
      const team = await apiClient.createTeam(payload);
      
      // Redirect to the team page - fix the path to match the API structure
      router.push(`/dashboard/teams/${team.id}`);
    } catch (err) {
      console.error('Error creating team:', err);
      setError('Failed to create team. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Create New Team</h1>
      
      {error && (
        <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded text-red-700 dark:text-red-400">
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Team Name <span className="text-red-500">*</span>
          </label>
          <input
            id="name"
            name="name"
            type="text"
            value={formData.name}
            onChange={handleChange}
            placeholder="My Awesome Team"
            required
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800"
          />
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            This is the display name of your team
          </p>
        </div>
        
        <div>
          <label htmlFor="alias" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Team Handle
          </label>
          <div className="flex">
            <span className="inline-flex items-center px-3 bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 border border-r-0 border-gray-300 dark:border-gray-600 rounded-l-md">
              @
            </span>
            <input
              id="alias"
              name="alias"
              type="text"
              value={formData.alias}
              onChange={handleChange}
              placeholder="my-team"
              className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-r-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800"
            />
          </div>
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            Optional unique identifier for your team (no spaces)
          </p>
        </div>
        
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Description
          </label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="A short description of your team and its purpose"
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800"
          />
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            Briefly describe your team's purpose or mission
          </p>
        </div>
        
        <div>
          <label htmlFor="image" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Team Image URL
          </label>
          <input
            id="image"
            name="image"
            type="url"
            value={formData.image}
            onChange={handleChange}
            placeholder="https://example.com/image.png"
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800"
          />
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            URL to an image representing your team. We'll generate one if you don't provide an image.
          </p>
        </div>
        
        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={() => router.push('/dashboard/teams')}
            className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          >
            {loading ? 'Creating...' : 'Create Team'}
          </button>
        </div>
      </form>
    </div>
  );
} 
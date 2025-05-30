'use client';

import { useState, FormEvent, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import CreateTeamLoading from './loading';
import { Button } from '@/components/ui/button';

// Main component with Suspense
export default function CreateTeamPage() {
  return (
    <Suspense fallback={<CreateTeamLoading />}>
      <CreateTeamContent />
    </Suspense>
  );
}

// Component wrapped in Suspense
function CreateTeamContent() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    name: '',
    alias: '',
    description: '',
    image: 'https://ui-avatars.com/api/?background=42984C&color=fff&name=Team',
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
      formData.image = `https://ui-avatars.com/api/?background=42984C&color=fff&name=${formData.name}`;
    }
    
    try {
      setLoading(true);
      
      // Create a clean payload, only including alias if it has a value
      const payload: {
        name: string;
        description?: string;
        alias: string;
        image: string;
      } = {
        name: formData.name.trim(),
        description: formData.description.trim() || undefined,
        alias: formData.alias.trim() || formData.name.trim().toLowerCase().replace(/\s+/g, '-'),
        image: formData.image,
      };
      
      const team = await api.teams.create(payload);
      
      // Store the team ID in sessionStorage for the details page
      sessionStorage.setItem('currentTeamId', team.id.toString());
      
      // Redirect to the team details page
      router.push('/dashboard/teams/details');
    } catch (err) {
      console.error('Error creating team:', err);
      setError('Failed to create team. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Create New Team</h1>
      
      <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-md">
        <div className="flex items-start">
          <svg className="h-5 w-5 text-green-400 mt-0.5 mr-3" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
          </svg>
          <div>
            <h3 className="text-sm font-medium text-green-800 dark:text-green-300">
              Team Creator Benefits
            </h3>
            <p className="mt-1 text-sm text-green-700 dark:text-green-400">
              As the team creator, you will automatically be added as an administrator with full permissions to manage the team, add members, and modify team settings.
            </p>
          </div>
        </div>
      </div>
      
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
            Briefly describe your team&apos;s purpose or mission
          </p>
        </div>
        
        <div className="flex justify-end space-x-3">
          <Button
            type="button"
            size="lg"
            variant="outline"
            onClick={() => router.push('/dashboard/teams')}
            className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
          >
            Cancel
          </Button>

          <Button
            type="submit"
            disabled={loading}
            size="lg"
          >
            {loading ? 'Creating...' : 'Create Team'}
          </Button>

        </div>
      </form>
    </div>
  );
} 
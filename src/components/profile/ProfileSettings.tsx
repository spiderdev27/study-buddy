'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useSession } from 'next-auth/react';
import Image from 'next/image';
import { useTheme } from '@/app/theme-selector';

interface User {
  id: string;
  name: string | null;
  email: string;
  image: string | null;
  createdAt?: string;
}

interface ProfileSettingsProps {
  user: User;
  onUpdate: (updatedData: Partial<User>) => Promise<void>;
}

export function ProfileSettings({ user, onUpdate }: ProfileSettingsProps) {
  const { data: session } = useSession();
  const { theme, toggleColorMode, colorMode } = useTheme();
  const [name, setName] = useState(user.name || '');
  const [image, setImage] = useState(user.image || '');
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    
    try {
      await onUpdate({ name, image });
      setIsEditing(false);
    } catch (error) {
      console.error('Failed to update profile:', error);
    } finally {
      setIsSaving(false);
    }
  };
  
  return (
    <div className="glass-card p-6 rounded-xl">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">Profile Settings</h3>
        {!isEditing && (
          <motion.button
            className="px-3 py-1 text-sm border border-primary rounded-lg hover:bg-white/5 transition-colors"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsEditing(true)}
          >
            Edit Profile
          </motion.button>
        )}
      </div>
      
      <div className="flex items-center mb-6">
        <div className="relative w-20 h-20 overflow-hidden rounded-full border border-white/10">
          {user.image ? (
            <Image
              src={user.image}
              alt={user.name || 'User'}
              fill
              className="object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-r from-primary to-secondary flex items-center justify-center text-white text-2xl font-bold">
              {user.name ? user.name[0].toUpperCase() : 'U'}
            </div>
          )}
        </div>
        <div className="ml-4">
          <h2 className="text-xl font-bold">{user.name || 'User'}</h2>
          <p className="text-text-secondary text-sm">{user.email}</p>
        </div>
      </div>
      
      {isEditing ? (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-text-secondary mb-1">Display Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2"
              placeholder="Your name"
            />
          </div>
          
          <div>
            <label className="block text-sm text-text-secondary mb-1">Profile Image URL</label>
            <input
              type="text"
              value={image}
              onChange={(e) => setImage(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2"
              placeholder="https://example.com/your-image.jpg"
            />
          </div>
          
          <div className="flex justify-end space-x-3 pt-2">
            <motion.button
              type="button"
              className="px-3 py-1 border border-white/10 rounded-lg hover:bg-white/5 transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                setName(user.name || '');
                setImage(user.image || '');
                setIsEditing(false);
              }}
            >
              Cancel
            </motion.button>
            <motion.button
              type="submit"
              className="px-3 py-1 border border-primary rounded-lg hover:bg-white/5 transition-colors flex items-center space-x-2"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              disabled={isSaving}
            >
              {isSaving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                  <span>Saving...</span>
                </>
              ) : (
                'Save Changes'
              )}
            </motion.button>
          </div>
        </form>
      ) : (
        <div className="space-y-4">
          <div>
            <h4 className="text-sm text-text-secondary">Member Since</h4>
            <p className="text-text-primary">
              {user.createdAt 
                ? new Date(user.createdAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })
                : 'Recently joined'
              }
            </p>
          </div>
          
          <div>
            <h4 className="text-sm text-text-secondary">Theme Preference</h4>
            <div className="flex items-center mt-1">
              <button
                onClick={toggleColorMode}
                className="flex items-center space-x-2 px-3 py-1 bg-white/5 rounded-lg border border-white/10"
              >
                <div className="w-8 h-8 rounded-full bg-bg-card flex items-center justify-center">
                  {colorMode === 'dark' ? (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12 17C14.7614 17 17 14.7614 17 12C17 9.23858 14.7614 7 12 7C9.23858 7 7 9.23858 7 12C7 14.7614 9.23858 17 12 17Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M12 1V3M12 21V23M4.22 4.22L5.64 5.64M18.36 18.36L19.78 19.78M1 12H3M21 12H23M4.22 19.78L5.64 18.36M18.36 5.64L19.78 4.22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  ) : (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M21 12.79A9 9 0 1 1 11.21 3A7 7 0 0 0 21 12.79Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  )}
                </div>
                <span>{colorMode === 'dark' ? 'Dark Mode' : 'Light Mode'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 
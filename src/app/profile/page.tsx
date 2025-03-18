'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useSession, signIn } from 'next-auth/react';
import { Logo } from '@/components/ui/Logo';
import { NavBar } from '@/components/navigation/NavBar';
import { StatisticsCard } from '@/components/profile/StatisticsCard';
import { ProfileSettings } from '@/components/profile/ProfileSettings';
import { ActivityCalendar } from '@/components/profile/ActivityCalendar';
import { RecentActivity } from '@/components/profile/RecentActivity';
import { useTheme } from '@/app/theme-selector';
import { Header } from '@/components/navigation/Header';

export default function ProfilePage() {
  const { theme } = useTheme();
  const { data: session, status } = useSession();
  const [userData, setUserData] = useState<any>(null);
  const [userActivity, setUserActivity] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch user data and activity
  useEffect(() => {
    const fetchUserData = async () => {
      if (status === 'loading') return;
      
      if (status === 'unauthenticated') {
        setIsLoading(false);
        setError('You must be signed in to view your profile');
        return;
      }
      
      setIsLoading(true);
      setError(null);
      
      try {
        // Fetch user profile data
        const profileResponse = await fetch('/api/user');
        if (!profileResponse.ok) {
          const profileText = await profileResponse.text();
          console.error('Profile API error response:', profileText);
          throw new Error(`Failed to fetch user profile: ${profileText}`);
        }
        const profileData = await profileResponse.json();
        setUserData(profileData);
        
        try {
          // Fetch user activity data
          const activityResponse = await fetch('/api/user/activity');
          if (!activityResponse.ok) {
            const activityText = await activityResponse.text();
            console.error('Activity API error response:', activityText);
            throw new Error(`Failed to fetch user activity: ${activityText}`);
          }
          const activityData = await activityResponse.json();
          console.log('Activity data received:', activityData);
          setUserActivity(activityData);
        } catch (activityErr) {
          console.error('Error fetching activity data:', activityErr);
          // Don't fail the entire profile page if only the activity data fails
          setUserActivity({ studySessions: [], stats: { totalStudyTime: 0, currentStreak: 0 } });
        }
      } catch (err) {
        console.error('Error fetching user data:', err);
        setError('Failed to load user data. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchUserData();
  }, [status]);
  
  // Update user profile data
  const handleUpdateProfile = async (updatedData: Partial<any>) => {
    try {
      const response = await fetch('/api/user', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedData),
      });
      
      if (!response.ok) {
        throw new Error('Failed to update profile');
      }
      
      const data = await response.json();
      setUserData({ ...userData, ...data });
      
      return Promise.resolve();
    } catch (err) {
      console.error('Error updating profile:', err);
      return Promise.reject(err);
    }
  };

  // Handle unauthenticated state
  const handleSignIn = () => {
    window.location.href = '/login';
  };

  return (
    <div className="min-h-screen bg-background text-text-primary flex flex-col">
      {/* Ambient background effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-0 left-0 w-full h-full opacity-60">
          <div className="absolute -top-40 -left-40 w-96 h-96 rounded-full bg-primary/5 blur-3xl" />
          <div className="absolute top-1/4 right-10 w-80 h-80 rounded-full bg-secondary/5 blur-3xl" />
          <div className="absolute bottom-0 left-1/3 w-[30rem] h-[30rem] rounded-full bg-accent/5 blur-3xl" />
        </div>
      </div>
      
      {/* Common Header */}
      <Header />
      
      {/* Main Content */}
      <main className="flex-1 overflow-y-auto pb-24 relative z-10">
        <div className="container mx-auto px-4 py-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-6"
          >
            <h1 className="text-3xl font-bold">Your Profile</h1>
            <p className="text-text-secondary">Manage your account and track your study progress</p>
          </motion.div>
          
          {status === 'loading' || isLoading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              <p className="ml-3 text-text-secondary">Loading your profile...</p>
            </div>
          ) : error ? (
            <div className="p-6 glass-card rounded-xl text-center">
              <p className="text-red-500 mb-4">{error}</p>
              
              {status === 'unauthenticated' ? (
                <button
                  onClick={handleSignIn}
                  className="px-4 py-2 bg-gradient-to-r from-primary to-secondary text-white rounded-xl hover:opacity-90 transition-opacity"
                >
                  Sign In
                </button>
              ) : (
                <button
                  onClick={() => window.location.reload()}
                  className="mt-4 px-4 py-2 border border-primary rounded-xl hover:bg-white/5 transition-colors"
                >
                  Try Again
                </button>
              )}
            </div>
          ) : userData ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Left Column - Profile Settings */}
              <div className="md:col-span-1 space-y-6">
                <ProfileSettings 
                  user={userData} 
                  onUpdate={handleUpdateProfile} 
                />
                
                {/* Statistics */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-1 gap-4">
                  <StatisticsCard
                    title="Study Time"
                    value={`${userData?.totalStudyHours?.toFixed(1) || 0}`}
                    subtitle="hours"
                    icon={
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <polyline points="12 6 12 12 16 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    }
                  />
                  
                  <StatisticsCard
                    title="Current Streak"
                    value={userData?.currentStreak || 0}
                    subtitle="days"
                    icon={
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    }
                  />
                  
                  <StatisticsCard
                    title="Resources"
                    value={userData?._count?.resources || 0}
                    icon={
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    }
                  />
                  
                  <StatisticsCard
                    title="Flashcards"
                    value={userData?._count?.flashcards || 0}
                    icon={
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <rect x="2" y="3" width="20" height="14" rx="2" ry="2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <line x1="8" y1="21" x2="16" y2="21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <line x1="12" y1="17" x2="12" y2="21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    }
                  />
                </div>
              </div>
              
              {/* Middle & Right Columns - Activity Data */}
              <div className="md:col-span-2 space-y-6">
                {/* Activity Calendar */}
                <ActivityCalendar 
                  activityData={userActivity?.activityMap}
                  studySessions={userActivity?.studySessions}
                />
                
                {/* Recent Activity Feed */}
                <RecentActivity
                  studySessions={userActivity?.studySessions || []}
                  recentResources={userActivity?.recentResources || []}
                  recentFlashcards={userActivity?.recentFlashcards || []}
                />
              </div>
            </div>
          ) : (
            <div className="p-6 glass-card rounded-xl text-center">
              <p className="text-text-secondary">No profile data available.</p>
            </div>
          )}
        </div>
      </main>
      
      {/* Navigation Bar */}
      <NavBar />
    </div>
  );
} 
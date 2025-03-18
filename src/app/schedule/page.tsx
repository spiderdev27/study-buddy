'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Header } from '@/components/navigation/Header';

interface ClassSchedule {
  day: string;
  startTime: string;
  endTime: string;
  className: string;
  location: string;
}

export default function SchedulePage() {
  const router = useRouter();
  const { data: session } = useSession();
  const [schedule, setSchedule] = useState<ClassSchedule[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editingClass, setEditingClass] = useState<ClassSchedule | null>(null);
  const [isConfirming, setIsConfirming] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch saved schedule when component mounts
  useEffect(() => {
    const fetchSchedule = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('/api/schedule', {
          method: 'GET',
        });

        if (!response.ok) {
          throw new Error('Failed to fetch schedule');
        }

        const data = await response.json();
        
        if (data.schedule && data.schedule.length > 0) {
          setSchedule(data.schedule);
          setImagePreview(null); // Clear any image preview
        }
      } catch (error) {
        console.error('Error fetching schedule:', error);
        setError('Failed to fetch your saved schedule. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    if (session?.user) {
      fetchSchedule();
    } else {
      setIsLoading(false);
    }
  }, [session]);

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Check if file is an image
    if (!file.type.startsWith('image/')) {
      setError('Please upload an image file');
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);

      // Create form data
      const formData = new FormData();
      formData.append('image', file);

      // Send to backend for processing
      const response = await fetch('/api/schedule/process', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to process schedule');
      }

      const data = await response.json();
      setSchedule(data.schedule);
    } catch (error) {
      console.error('Error processing schedule:', error);
      setError('Failed to process schedule. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleScheduleConfirm = async () => {
    try {
      setIsConfirming(true);
      setError(null);
      setSuccessMessage(null);

      const response = await fetch('/api/schedule', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ schedule }),
      });

      if (!response.ok) {
        throw new Error('Failed to save schedule');
      }

      setSuccessMessage('Schedule saved successfully!');
      
      // Redirect to dashboard after a brief delay
      setTimeout(() => {
        router.push('/dashboard');
      }, 1500);
    } catch (error) {
      console.error('Error saving schedule:', error);
      setError('Failed to save schedule. Please try again.');
    } finally {
      setIsConfirming(false);
    }
  };

  const handleEdit = (index: number) => {
    setEditingIndex(index);
    setEditingClass({ ...schedule[index] });
  };

  const handleSaveEdit = () => {
    if (editingIndex === null || !editingClass) return;

    const newSchedule = [...schedule];
    newSchedule[editingIndex] = editingClass;
    setSchedule(newSchedule);
    setEditingIndex(null);
    setEditingClass(null);
  };

  const handleCancelEdit = () => {
    setEditingIndex(null);
    setEditingClass(null);
  };

  const handleAddClass = () => {
    const newClass: ClassSchedule = {
      day: '',
      startTime: '',
      endTime: '',
      className: '',
      location: ''
    };
    setSchedule([...schedule, newClass]);
    setEditingIndex(schedule.length);
    setEditingClass(newClass);
  };

  const handleDeleteClass = (index: number) => {
    const newSchedule = schedule.filter((_, i) => i !== index);
    setSchedule(newSchedule);
  };

  return (
    <div className="min-h-screen bg-background text-text-primary">
      <Header />
      <div className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-4xl mx-auto"
        >
          <div className="mb-6">
            <Link href="/dashboard" className="text-text-secondary hover:text-text-primary flex items-center gap-1 text-sm">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M15.41 7.41L14 6L8 12L14 18L15.41 16.59L10.83 12L15.41 7.41Z" fill="currentColor"/>
              </svg>
              Back to Dashboard
            </Link>
            <h1 className="text-2xl font-bold mt-2">Your Class Schedule</h1>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              <p className="ml-3 text-text-secondary">Loading your schedule...</p>
            </div>
          ) : schedule.length === 0 ? (
            <div className="border border-white/10 rounded-xl p-8 text-center">
              <h2 className="text-xl font-semibold mb-4">Upload Your Schedule</h2>
              <p className="text-text-secondary mb-6">
                Take a photo or screenshot of your class schedule and upload it here. We'll automatically process it for you.
              </p>
              
              <div className="space-y-4">
                <label className="cursor-pointer inline-flex items-center px-4 py-2 border border-primary rounded-xl hover:bg-white/5 transition-colors">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                    capture="environment"
                  />
                  <span>{isProcessing ? 'Processing...' : 'Upload Schedule Image'}</span>
                </label>

                {imagePreview && (
                  <div className="mt-4">
                    <p className="text-sm text-text-secondary mb-2">Preview:</p>
                    <div className="relative w-full max-w-md mx-auto aspect-[4/3] rounded-lg overflow-hidden">
                      <Image
                        src={imagePreview}
                        alt="Schedule preview"
                        fill
                        className="object-contain"
                      />
                    </div>
                  </div>
                )}

                {isProcessing && (
                  <div className="flex items-center justify-center space-x-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                    <p className="text-text-secondary">Processing your schedule...</p>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="border border-white/10 rounded-xl p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold">Your Schedule</h2>
                  <button
                    onClick={handleAddClass}
                    className="px-3 py-1 text-sm border border-primary rounded-lg hover:bg-white/5 transition-colors"
                  >
                    Add Class
                  </button>
                </div>
                <div className="space-y-4">
                  {schedule.map((item, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-4 border border-white/10 rounded-lg"
                    >
                      {editingIndex === index && editingClass ? (
                        <div className="w-full space-y-3">
                          <div className="grid grid-cols-2 gap-3">
                            <input
                              type="text"
                              value={editingClass.className}
                              onChange={(e) => setEditingClass({ ...editingClass, className: e.target.value })}
                              placeholder="Class Name"
                              className="bg-white/5 border border-white/10 rounded-lg px-3 py-2"
                            />
                            <input
                              type="text"
                              value={editingClass.location}
                              onChange={(e) => setEditingClass({ ...editingClass, location: e.target.value })}
                              placeholder="Location"
                              className="bg-white/5 border border-white/10 rounded-lg px-3 py-2"
                            />
                          </div>
                          <div className="grid grid-cols-3 gap-3">
                            <select
                              value={editingClass.day}
                              onChange={(e) => setEditingClass({ ...editingClass, day: e.target.value })}
                              className="bg-white/5 border border-white/10 rounded-lg px-3 py-2"
                            >
                              <option value="">Select Day</option>
                              <option value="Monday">Monday</option>
                              <option value="Tuesday">Tuesday</option>
                              <option value="Wednesday">Wednesday</option>
                              <option value="Thursday">Thursday</option>
                              <option value="Friday">Friday</option>
                              <option value="Saturday">Saturday</option>
                              <option value="Sunday">Sunday</option>
                            </select>
                            <input
                              type="time"
                              value={editingClass.startTime}
                              onChange={(e) => setEditingClass({ ...editingClass, startTime: e.target.value })}
                              className="bg-white/5 border border-white/10 rounded-lg px-3 py-2"
                            />
                            <input
                              type="time"
                              value={editingClass.endTime}
                              onChange={(e) => setEditingClass({ ...editingClass, endTime: e.target.value })}
                              className="bg-white/5 border border-white/10 rounded-lg px-3 py-2"
                            />
                          </div>
                          <div className="flex justify-end space-x-3">
                            <button
                              onClick={handleCancelEdit}
                              className="px-3 py-1 border border-white/10 rounded-lg hover:bg-white/5 transition-colors"
                            >
                              Cancel
                            </button>
                            <button
                              onClick={handleSaveEdit}
                              className="px-3 py-1 border border-primary rounded-lg hover:bg-white/5 transition-colors"
                            >
                              Save
                            </button>
                          </div>
                        </div>
                      ) : (
                        <>
                          <div>
                            <h3 className="font-medium">{item.className}</h3>
                            <p className="text-sm text-text-secondary">
                              {item.day} • {item.startTime} - {item.endTime}
                            </p>
                            <p className="text-sm text-text-secondary">{item.location}</p>
                          </div>
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleEdit(index)}
                              className="p-2 text-text-secondary hover:text-text-primary transition-colors"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDeleteClass(index)}
                              className="p-2 text-text-secondary hover:text-red-500 transition-colors"
                            >
                              Delete
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-end space-x-4">
                <button
                  onClick={() => {
                    setSchedule([]);
                    setImagePreview(null);
                    setError(null);
                    setSuccessMessage(null);
                  }}
                  className="px-4 py-2 border border-white/10 rounded-xl hover:bg-white/5 transition-colors"
                >
                  Clear Schedule
                </button>
                <button
                  onClick={handleScheduleConfirm}
                  disabled={isConfirming || schedule.length === 0}
                  className={`px-4 py-2 border border-primary rounded-xl transition-colors flex items-center space-x-2
                    ${isConfirming ? 'opacity-50 cursor-not-allowed' : 'hover:bg-white/5'}`}
                >
                  {isConfirming ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                      <span>Saving...</span>
                    </>
                  ) : (
                    'Update Schedule'
                  )}
                </button>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
} 
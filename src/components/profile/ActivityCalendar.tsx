'use client';

import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';

interface ActivityCalendarProps {
  activityData?: Record<string, number>; // date -> hours studied
  studySessions?: Array<{
    createdAt: string;
    duration?: number | null;
  }>;
}

export function ActivityCalendar({ activityData = {}, studySessions = [] }: ActivityCalendarProps) {
  const [hoveredDay, setHoveredDay] = useState<string | null>(null);
  const [generatedActivityData, setGeneratedActivityData] = useState<Record<string, number>>({});
  
  // Process study sessions to create a heatmap
  useEffect(() => {
    // Only update if we have new data or if the activity data changes
    const newData = {...activityData};
    
    if (studySessions?.length) {
      // Convert study sessions to activity data
      studySessions.forEach(session => {
        if (session.createdAt && session.duration) {
          try {
            const date = new Date(session.createdAt).toISOString().split('T')[0];
            newData[date] = (newData[date] || 0) + (session.duration / 60); // Convert minutes to hours
          } catch (e) {
            console.error('Error processing session date:', e);
          }
        }
      });
    }
    
    // Only update state if the data is different to avoid infinite renders
    if (Object.keys(newData).length > 0) {
      setGeneratedActivityData(newData);
    }
  }, [studySessions, activityData]);
  
  // Function to get color based on activity level
  const getActivityColor = (hours: number) => {
    if (hours === 0) return 'bg-white/5';
    if (hours < 1) return 'bg-primary/20';
    if (hours < 2) return 'bg-primary/40';
    if (hours < 4) return 'bg-primary/60';
    return 'bg-primary/80';
  };
  
  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };
  
  // Format hours for display
  const formatHours = (hours: number) => {
    if (hours === 0) return 'No study activity';
    if (hours === 1) return '1 hour of study';
    if (hours < 1) {
      const minutes = Math.round(hours * 60);
      return `${minutes} minutes of study`;
    }
    return `${hours.toFixed(1)} hours of study`;
  };

  // Memoize the calendar days calculation to prevent infinite renders
  const { days, weeks } = useMemo(() => {
    // Generate days for the last 3 months
    const calendarDays = [];
    const today = new Date();
    const threeMonthsAgo = new Date();
    threeMonthsAgo.setDate(today.getDate() - 90);
    
    for (let d = new Date(threeMonthsAgo); d <= today; d.setDate(d.getDate() + 1)) {
      const dateString = d.toISOString().split('T')[0];
      calendarDays.push({
        date: dateString,
        activity: generatedActivityData[dateString] || 0
      });
    }
    
    // Group days by week for display
    const calendarWeeks: Array<typeof calendarDays> = [];
    for (let i = 0; i < calendarDays.length; i += 7) {
      calendarWeeks.push(calendarDays.slice(i, i + 7));
    }
    
    return { days: calendarDays, weeks: calendarWeeks };
  }, [generatedActivityData]);  // Only recalculate when generatedActivityData changes

  return (
    <div className="glass-card p-6 rounded-xl">
      <h3 className="text-lg font-semibold mb-4">Study Activity</h3>
      
      {hoveredDay && (
        <div className="mb-4 text-sm">
          <p className="text-text-primary">{formatDate(hoveredDay)}</p>
          <p className="text-text-secondary">{formatHours(generatedActivityData[hoveredDay] || 0)}</p>
        </div>
      )}
      
      <div className="flex flex-col gap-1">
        {weeks.map((week, weekIndex) => (
          <div key={weekIndex} className="flex gap-1">
            {week.map((day) => (
              <motion.div
                key={day.date}
                className={`w-4 h-4 rounded-sm ${getActivityColor(day.activity)} cursor-pointer`}
                whileHover={{ scale: 1.2 }}
                onHoverStart={() => setHoveredDay(day.date)}
                onHoverEnd={() => setHoveredDay(null)}
              />
            ))}
          </div>
        ))}
      </div>
      
      <div className="flex items-center justify-end mt-4 text-xs text-text-secondary">
        <span className="mr-1">Less</span>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 bg-white/5 rounded-sm" />
          <div className="w-3 h-3 bg-primary/20 rounded-sm" />
          <div className="w-3 h-3 bg-primary/40 rounded-sm" />
          <div className="w-3 h-3 bg-primary/60 rounded-sm" />
          <div className="w-3 h-3 bg-primary/80 rounded-sm" />
        </div>
        <span className="ml-1">More</span>
      </div>
    </div>
  );
} 
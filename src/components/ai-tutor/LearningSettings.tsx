'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useTheme } from 'next-themes';
import { 
  Settings, Clock, Brain, LineChart, Star, 
  RotateCcw, PenLine, Lightbulb, GraduationCap 
} from 'lucide-react';

interface LearningSettingsProps {
  onSettingsChange: (settings: LearningPreferences) => void;
}

export interface LearningPreferences {
  difficulty: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  learningStyle: 'visual' | 'verbal' | 'active' | 'reflective';
  sessionDuration: 15 | 30 | 45 | 60;
  includeExamples: boolean;
  includePracticeQuestions: boolean;
  explainInDepth: boolean;
}

export function LearningSettings({ onSettingsChange }: LearningSettingsProps) {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';
  
  const [settings, setSettings] = useState<LearningPreferences>({
    difficulty: 'intermediate',
    learningStyle: 'visual',
    sessionDuration: 30,
    includeExamples: true,
    includePracticeQuestions: true,
    explainInDepth: true
  });

  // Update settings and call the callback
  const updateSettings = (newSettings: Partial<LearningPreferences>) => {
    const updatedSettings = { ...settings, ...newSettings };
    setSettings(updatedSettings);
    onSettingsChange(updatedSettings);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className={cn(
        "rounded-xl border p-4",
        isDark ? "bg-gray-800/50 border-gray-700" : "bg-white border-gray-200"
      )}
    >
      <div className="flex items-center gap-2 mb-4">
        <Settings className={cn(
          "h-5 w-5",
          isDark ? "text-indigo-400" : "text-indigo-600"
        )} />
        <h3 className={cn(
          "font-medium",
          isDark ? "text-white" : "text-gray-800"
        )}>
          Learning Preferences
        </h3>
      </div>
      
      {/* Difficulty Level */}
      <div className="mb-4">
        <div className={cn(
          "text-sm font-medium mb-2 flex items-center gap-1.5",
          isDark ? "text-gray-300" : "text-gray-600"
        )}>
          <LineChart className="h-4 w-4" />
          <span>Difficulty Level</span>
        </div>
        <div className="grid grid-cols-4 gap-2">
          {(['beginner', 'intermediate', 'advanced', 'expert'] as const).map((level) => (
            <button
              key={level}
              onClick={() => updateSettings({ difficulty: level })}
              className={cn(
                "py-1.5 px-3 rounded-lg text-sm transition-colors",
                settings.difficulty === level
                  ? isDark
                    ? "bg-indigo-500/20 text-indigo-300 border-indigo-500/40 border"
                    : "bg-indigo-50 text-indigo-700 border-indigo-200 border"
                  : isDark
                    ? "bg-gray-700 text-gray-300 border-gray-600 border hover:bg-gray-600"
                    : "bg-gray-100 text-gray-700 border-gray-200 border hover:bg-gray-200"
              )}
            >
              {level.charAt(0).toUpperCase() + level.slice(1)}
            </button>
          ))}
        </div>
      </div>
      
      {/* Learning Style */}
      <div className="mb-4">
        <div className={cn(
          "text-sm font-medium mb-2 flex items-center gap-1.5",
          isDark ? "text-gray-300" : "text-gray-600"
        )}>
          <Brain className="h-4 w-4" />
          <span>Learning Style</span>
        </div>
        <div className="grid grid-cols-2 gap-2 mb-2">
          {([
            { id: 'visual', label: 'Visual', icon: <Lightbulb className="h-3.5 w-3.5" /> },
            { id: 'verbal', label: 'Verbal', icon: <PenLine className="h-3.5 w-3.5" /> }
          ] as const).map((style) => (
            <button
              key={style.id}
              onClick={() => updateSettings({ learningStyle: style.id })}
              className={cn(
                "py-2 px-3 rounded-lg text-sm flex items-center gap-2 transition-colors",
                settings.learningStyle === style.id
                  ? isDark
                    ? "bg-indigo-500/20 text-indigo-300 border-indigo-500/40 border"
                    : "bg-indigo-50 text-indigo-700 border-indigo-200 border"
                  : isDark
                    ? "bg-gray-700 text-gray-300 border-gray-600 border hover:bg-gray-600"
                    : "bg-gray-100 text-gray-700 border-gray-200 border hover:bg-gray-200"
              )}
            >
              {style.icon}
              <span>{style.label}</span>
            </button>
          ))}
        </div>
        <div className="grid grid-cols-2 gap-2">
          {([
            { id: 'active', label: 'Active', icon: <Star className="h-3.5 w-3.5" /> },
            { id: 'reflective', label: 'Reflective', icon: <RotateCcw className="h-3.5 w-3.5" /> }
          ] as const).map((style) => (
            <button
              key={style.id}
              onClick={() => updateSettings({ learningStyle: style.id })}
              className={cn(
                "py-2 px-3 rounded-lg text-sm flex items-center gap-2 transition-colors",
                settings.learningStyle === style.id
                  ? isDark
                    ? "bg-indigo-500/20 text-indigo-300 border-indigo-500/40 border"
                    : "bg-indigo-50 text-indigo-700 border-indigo-200 border"
                  : isDark
                    ? "bg-gray-700 text-gray-300 border-gray-600 border hover:bg-gray-600"
                    : "bg-gray-100 text-gray-700 border-gray-200 border hover:bg-gray-200"
              )}
            >
              {style.icon}
              <span>{style.label}</span>
            </button>
          ))}
        </div>
      </div>
      
      {/* Session Duration */}
      <div className="mb-4">
        <div className={cn(
          "text-sm font-medium mb-2 flex items-center gap-1.5",
          isDark ? "text-gray-300" : "text-gray-600"
        )}>
          <Clock className="h-4 w-4" />
          <span>Session Duration (minutes)</span>
        </div>
        <div className="grid grid-cols-4 gap-2">
          {([15, 30, 45, 60] as const).map((duration) => (
            <button
              key={duration}
              onClick={() => updateSettings({ sessionDuration: duration })}
              className={cn(
                "py-1.5 px-3 rounded-lg text-sm transition-colors",
                settings.sessionDuration === duration
                  ? isDark
                    ? "bg-indigo-500/20 text-indigo-300 border-indigo-500/40 border"
                    : "bg-indigo-50 text-indigo-700 border-indigo-200 border"
                  : isDark
                    ? "bg-gray-700 text-gray-300 border-gray-600 border hover:bg-gray-600"
                    : "bg-gray-100 text-gray-700 border-gray-200 border hover:bg-gray-200"
              )}
            >
              {duration}
            </button>
          ))}
        </div>
      </div>
      
      {/* Additional Options */}
      <div>
        <div className={cn(
          "text-sm font-medium mb-2 flex items-center gap-1.5",
          isDark ? "text-gray-300" : "text-gray-600"
        )}>
          <GraduationCap className="h-4 w-4" />
          <span>Additional Options</span>
        </div>
        <div className="space-y-2">
          {[
            { id: 'includeExamples', label: 'Include Examples' },
            { id: 'includePracticeQuestions', label: 'Include Practice Questions' },
            { id: 'explainInDepth', label: 'Explain In-Depth' }
          ].map((option) => (
            <label
              key={option.id}
              className={cn(
                "flex items-center gap-3 p-2 rounded-lg cursor-pointer",
                isDark ? "hover:bg-gray-700/50" : "hover:bg-gray-100"
              )}
            >
              <div className="relative flex items-center">
                <input
                  type="checkbox"
                  className="peer sr-only"
                  checked={settings[option.id as keyof typeof settings] as boolean}
                  onChange={(e) => updateSettings({
                    [option.id]: e.target.checked
                  } as unknown as Partial<LearningPreferences>)}
                />
                <div className={cn(
                  "w-5 h-5 border rounded transition-colors",
                  isDark 
                    ? "border-gray-600 peer-checked:border-indigo-500 peer-checked:bg-indigo-500" 
                    : "border-gray-300 peer-checked:border-indigo-600 peer-checked:bg-indigo-600"
                )}></div>
                <div className="absolute inset-0 flex items-center justify-center text-white pointer-events-none opacity-0 peer-checked:opacity-100">
                  <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M7 13L10 16L17 9" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
              </div>
              <span className={isDark ? "text-gray-300" : "text-gray-700"}>
                {option.label}
              </span>
            </label>
          ))}
        </div>
      </div>
    </motion.div>
  );
} 
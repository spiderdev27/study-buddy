import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Brain, Clock, Trophy, TrendingUp } from 'lucide-react';

interface StudyStats {
  totalCards: number;
  masteredCards: number;
  studyTime: number; // in minutes
  streak: number;
}

interface StudyStatsProps {
  stats: StudyStats;
  className?: string;
}

export function StudyStats({ stats, className }: StudyStatsProps) {
  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  const metrics = [
    {
      label: 'Total Cards',
      value: stats.totalCards,
      icon: Brain,
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/10',
    },
    {
      label: 'Mastered',
      value: `${Math.round((stats.masteredCards / stats.totalCards) * 100)}%`,
      icon: Trophy,
      color: 'text-yellow-500',
      bgColor: 'bg-yellow-500/10',
    },
    {
      label: 'Study Time',
      value: formatTime(stats.studyTime),
      icon: Clock,
      color: 'text-green-500',
      bgColor: 'bg-green-500/10',
    },
    {
      label: 'Day Streak',
      value: stats.streak,
      icon: TrendingUp,
      color: 'text-purple-500',
      bgColor: 'bg-purple-500/10',
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4',
        className
      )}
    >
      {metrics.map((metric, index) => {
        const Icon = metric.icon;
        return (
          <motion.div
            key={metric.label}
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: index * 0.1 }}
            className={cn(
              'p-4 rounded-xl border border-primary/10',
              'bg-gradient-to-br from-background/50 to-background/30',
              'backdrop-blur-md shadow-lg'
            )}
          >
            <div className="flex items-start justify-between mb-2">
              <div
                className={cn(
                  'p-2 rounded-lg',
                  metric.bgColor
                )}
              >
                <Icon className={cn('w-5 h-5', metric.color)} />
              </div>
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{
                  type: 'spring',
                  stiffness: 200,
                  damping: 10,
                  delay: index * 0.1 + 0.2,
                }}
                className={cn(
                  'w-2 h-2 rounded-full',
                  metric.bgColor
                )}
              />
            </div>
            
            <div className="space-y-1">
              <h3 className="text-sm font-medium text-muted-foreground">
                {metric.label}
              </h3>
              <p className="text-2xl font-bold tracking-tight">
                {metric.value}
              </p>
            </div>

            {/* Progress indicator */}
            {metric.label === 'Mastered' && (
              <div className="mt-4 h-1 bg-primary/10 rounded-full overflow-hidden">
                <motion.div
                  className={cn('h-full', metric.bgColor)}
                  initial={{ width: 0 }}
                  animate={{
                    width: `${(stats.masteredCards / stats.totalCards) * 100}%`,
                  }}
                  transition={{ duration: 1, type: 'spring' }}
                />
              </div>
            )}
          </motion.div>
        );
      })}
    </motion.div>
  );
} 
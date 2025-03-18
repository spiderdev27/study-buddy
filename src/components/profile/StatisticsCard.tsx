'use client';

import { motion } from 'framer-motion';

interface StatisticsCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  change?: string;
  isPositive?: boolean;
  subtitle?: string;
}

export function StatisticsCard({
  title,
  value,
  icon,
  change,
  isPositive = true,
  subtitle,
}: StatisticsCardProps) {
  return (
    <motion.div
      className="glass-card p-4 rounded-xl"
      whileHover={{ y: -5, transition: { duration: 0.2 } }}
    >
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-text-secondary text-xs font-medium mb-1">{title}</h3>
          <div className="flex items-end">
            <span className="text-2xl font-bold text-text-primary">{value}</span>
            {subtitle && (
              <span className="text-text-secondary text-xs ml-1 mb-1">{subtitle}</span>
            )}
          </div>
          {change && (
            <div
              className={`text-xs mt-1 ${
                isPositive ? 'text-green-500' : 'text-red-500'
              }`}
            >
              {isPositive ? '↑' : '↓'} {change}
            </div>
          )}
        </div>
        <div className="p-2 rounded-full bg-primary/10 text-primary">{icon}</div>
      </div>
    </motion.div>
  );
} 
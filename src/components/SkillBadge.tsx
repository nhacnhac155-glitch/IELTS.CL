import React from 'react';
import { BookOpen, Headphones, PenTool, Mic, BookA } from 'lucide-react';
import { SkillType } from '../types';

interface SkillBadgeProps {
  skill: SkillType;
  showIcon?: boolean;
  className?: string;
  size?: 'sm' | 'md' | 'lg' | string;
}

export const SkillBadge: React.FC<SkillBadgeProps> = ({ skill, showIcon = true, className = '', size = 'md' }) => {
  const configs: Record<SkillType, { label: string; bg: string; text: string; border: string; icon: React.ReactNode }> = {
    reading: {
      label: 'Reading',
      bg: 'bg-blue-50 dark:bg-blue-950/40',
      text: 'text-blue-700 dark:text-blue-300',
      border: 'border-blue-200 dark:border-blue-800',
      icon: <BookOpen className="w-3.5 h-3.5" />,
    },
    listening: {
      label: 'Listening',
      bg: 'bg-purple-50 dark:bg-purple-950/40',
      text: 'text-purple-700 dark:text-purple-300',
      border: 'border-purple-200 dark:border-purple-800',
      icon: <Headphones className="w-3.5 h-3.5" />,
    },
    writing: {
      label: 'Writing',
      bg: 'bg-amber-50 dark:bg-amber-950/40',
      text: 'text-amber-700 dark:text-amber-300',
      border: 'border-amber-200 dark:border-amber-800',
      icon: <PenTool className="w-3.5 h-3.5" />,
    },
    speaking: {
      label: 'Speaking',
      bg: 'bg-emerald-50 dark:bg-emerald-950/40',
      text: 'text-emerald-700 dark:text-emerald-300',
      border: 'border-emerald-200 dark:border-emerald-800',
      icon: <Mic className="w-3.5 h-3.5" />,
    },
    vocabulary: {
      label: 'Vocabulary',
      bg: 'bg-teal-50 dark:bg-teal-950/40',
      text: 'text-teal-700 dark:text-teal-300',
      border: 'border-teal-200 dark:border-teal-800',
      icon: <BookA className="w-3.5 h-3.5" />,
    },
  };

  const config = configs[skill] || configs.writing;

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold border ${config.bg} ${config.text} ${config.border} ${className}`}
    >
      {showIcon && config.icon}
      <span>{config.label}</span>
    </span>
  );
};

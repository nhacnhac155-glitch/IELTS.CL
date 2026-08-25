import React from 'react';
import { getClassTheme } from '../utils/classColors';
import { ClassGroup } from '../types';

interface ClassBadgeProps {
  classId?: string;
  classNameStr?: string;
  classCode?: string;
  classes?: ClassGroup[];
  color?: string;
  size?: 'sm' | 'md' | 'lg';
  showDot?: boolean;
  showCodeOnly?: boolean;
  fallbackText?: string;
}

export const ClassBadge: React.FC<ClassBadgeProps> = ({
  classId,
  classNameStr,
  classCode,
  classes = [],
  color,
  size = 'md',
  showDot = true,
  showCodeOnly = false,
  fallbackText,
}) => {
  const matchedClass = classes.find((c) => c.id === classId);
  const effectiveColor = color || matchedClass?.color;
  const theme = getClassTheme(effectiveColor || classId, classes);

  const displayCode =
    classCode ||
    matchedClass?.code ||
    (classNameStr?.toUpperCase().includes('INTENSIVE')
      ? 'INT-88'
      : classNameStr?.toUpperCase().includes('FOUNDATION')
      ? 'FND-12'
      : classNameStr?.toUpperCase().includes('MASTER')
      ? 'MAS-75'
      : fallbackText || 'IEL');

  const displayName = classNameStr || matchedClass?.name || fallbackText || 'Lớp IELTS';

  const sizeClasses = {
    sm: 'text-[10px] px-1.5 py-0.5 gap-1',
    md: 'text-xs px-2 py-0.5 gap-1.5',
    lg: 'text-xs sm:text-sm px-2.5 py-1 gap-2',
  };

  const dotSizes = {
    sm: 'w-1.5 h-1.5',
    md: 'w-2 h-2',
    lg: 'w-2.5 h-2.5',
  };

  if (showCodeOnly) {
    return (
      <span
        className={`inline-flex items-center font-mono font-bold rounded-md border ${theme.badge} ${sizeClasses[size]}`}
        title={displayName}
      >
        {showDot && <span className={`rounded-full shrink-0 ${theme.dot} ${dotSizes[size]}`} />}
        <span>{displayCode}</span>
      </span>
    );
  }

  return (
    <span
      className={`inline-flex items-center font-bold rounded-lg border shadow-2xs ${theme.badge} ${sizeClasses[size]}`}
    >
      {showDot && <span className={`rounded-full shrink-0 ${theme.dot} ${dotSizes[size]}`} />}
      <span className="truncate max-w-[180px]">{displayName}</span>
      {displayCode && (
        <span
          className="font-mono text-[9px] uppercase px-1 py-0.2 rounded bg-black/10 text-current font-black shrink-0"
        >
          {displayCode}
        </span>
      )}
    </span>
  );
};

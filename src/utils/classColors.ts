export interface ClassColorTheme {
  id: string;
  name: string;
  bg: string;
  text: string;
  border: string;
  badge: string;
  chipBg: string;
  chipText: string;
  chipBorder: string;
  dot: string;
  lightBg: string;
  accent: string;
  hex: string;
}

export const CLASS_COLOR_THEMES: Record<string, ClassColorTheme> = {
  indigo: {
    id: 'indigo',
    name: 'Xanh Indigo',
    bg: 'bg-indigo-50',
    text: 'text-indigo-700',
    border: 'border-indigo-200',
    badge: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    chipBg: 'bg-indigo-50',
    chipText: 'text-indigo-800',
    chipBorder: 'border-indigo-200',
    dot: 'bg-indigo-500',
    lightBg: 'bg-indigo-50/50',
    accent: '#4f46e5',
    hex: '#6366f1',
  },
  emerald: {
    id: 'emerald',
    name: 'Ngọc Lục Bảo',
    bg: 'bg-emerald-50',
    text: 'text-emerald-800',
    border: 'border-emerald-200',
    badge: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    chipBg: 'bg-emerald-50',
    chipText: 'text-emerald-900',
    chipBorder: 'border-emerald-200',
    dot: 'bg-emerald-500',
    lightBg: 'bg-emerald-50/50',
    accent: '#059669',
    hex: '#10b981',
  },
  amber: {
    id: 'amber',
    name: 'Cam Hổ Phách',
    bg: 'bg-amber-50',
    text: 'text-amber-800',
    border: 'border-amber-200',
    badge: 'bg-amber-50 text-amber-800 border-amber-200',
    chipBg: 'bg-amber-50',
    chipText: 'text-amber-900',
    chipBorder: 'border-amber-200',
    dot: 'bg-amber-500',
    lightBg: 'bg-amber-50/50',
    accent: '#d97706',
    hex: '#f59e0b',
  },
  rose: {
    id: 'rose',
    name: 'Hồng Crimson',
    bg: 'bg-rose-50',
    text: 'text-rose-800',
    border: 'border-rose-200',
    badge: 'bg-rose-50 text-rose-800 border-rose-200',
    chipBg: 'bg-rose-50',
    chipText: 'text-rose-900',
    chipBorder: 'border-rose-200',
    dot: 'bg-rose-500',
    lightBg: 'bg-rose-50/50',
    accent: '#e11d48',
    hex: '#f43f5e',
  },
  violet: {
    id: 'violet',
    name: 'Tím Violet',
    bg: 'bg-violet-50',
    text: 'text-violet-800',
    border: 'border-violet-200',
    badge: 'bg-violet-50 text-violet-800 border-violet-200',
    chipBg: 'bg-violet-50',
    chipText: 'text-violet-900',
    chipBorder: 'border-violet-200',
    dot: 'bg-violet-500',
    lightBg: 'bg-violet-50/50',
    accent: '#7c3aed',
    hex: '#8b5cf6',
  },
  cyan: {
    id: 'cyan',
    name: 'Xanh Biển Cyan',
    bg: 'bg-cyan-50',
    text: 'text-cyan-800',
    border: 'border-cyan-200',
    badge: 'bg-cyan-50 text-cyan-800 border-cyan-200',
    chipBg: 'bg-cyan-50',
    chipText: 'text-cyan-900',
    chipBorder: 'border-cyan-200',
    dot: 'bg-cyan-500',
    lightBg: 'bg-cyan-50/50',
    accent: '#0891b2',
    hex: '#06b6d4',
  },
  fuchsia: {
    id: 'fuchsia',
    name: 'Hồng Fuchsia',
    bg: 'bg-fuchsia-50',
    text: 'text-fuchsia-800',
    border: 'border-fuchsia-200',
    badge: 'bg-fuchsia-50 text-fuchsia-800 border-fuchsia-200',
    chipBg: 'bg-fuchsia-50',
    chipText: 'text-fuchsia-900',
    chipBorder: 'border-fuchsia-200',
    dot: 'bg-fuchsia-500',
    lightBg: 'bg-fuchsia-50/50',
    accent: '#c026d3',
    hex: '#d946ef',
  },
  teal: {
    id: 'teal',
    name: 'Xanh Teal',
    bg: 'bg-teal-50',
    text: 'text-teal-800',
    border: 'border-teal-200',
    badge: 'bg-teal-50 text-teal-800 border-teal-200',
    chipBg: 'bg-teal-50',
    chipText: 'text-teal-900',
    chipBorder: 'border-teal-200',
    dot: 'bg-teal-500',
    lightBg: 'bg-teal-50/50',
    accent: '#0d9488',
    hex: '#14b8a6',
  },
  blue: {
    id: 'blue',
    name: 'Xanh Royal Blue',
    bg: 'bg-blue-50',
    text: 'text-blue-800',
    border: 'border-blue-200',
    badge: 'bg-blue-50 text-blue-800 border-blue-200',
    chipBg: 'bg-blue-50',
    chipText: 'text-blue-900',
    chipBorder: 'border-blue-200',
    dot: 'bg-blue-500',
    lightBg: 'bg-blue-50/50',
    accent: '#2563eb',
    hex: '#3b82f6',
  },
  orange: {
    id: 'orange',
    name: 'Cam Sunset',
    bg: 'bg-orange-50',
    text: 'text-orange-800',
    border: 'border-orange-200',
    badge: 'bg-orange-50 text-orange-800 border-orange-200',
    chipBg: 'bg-orange-50',
    chipText: 'text-orange-900',
    chipBorder: 'border-orange-200',
    dot: 'bg-orange-500',
    lightBg: 'bg-orange-50/50',
    accent: '#ea580c',
    hex: '#f97316',
  },
};

export const COLOR_KEYS = Object.keys(CLASS_COLOR_THEMES);

/**
 * Get distinct class color theme by class ID or color string.
 * If class has a color configured, uses it. Otherwise deterministic fallback by index/hash.
 */
export function getClassTheme(
  classIdOrColor?: string,
  classesList?: Array<{ id: string; color?: string }>
): ClassColorTheme {
  if (!classIdOrColor) return CLASS_COLOR_THEMES.indigo;

  // If directly a color theme key
  if (CLASS_COLOR_THEMES[classIdOrColor]) {
    return CLASS_COLOR_THEMES[classIdOrColor];
  }

  // Look up class in list
  if (classesList) {
    const matched = classesList.find((c) => c.id === classIdOrColor);
    if (matched?.color && CLASS_COLOR_THEMES[matched.color]) {
      return CLASS_COLOR_THEMES[matched.color];
    }
    const idx = classesList.findIndex((c) => c.id === classIdOrColor);
    if (idx >= 0) {
      const key = COLOR_KEYS[idx % COLOR_KEYS.length];
      return CLASS_COLOR_THEMES[key];
    }
  }

  // Deterministic fallback based on string hash
  let hash = 0;
  for (let i = 0; i < classIdOrColor.length; i++) {
    hash = (hash << 5) - hash + classIdOrColor.charCodeAt(i);
    hash |= 0;
  }
  const colorIndex = Math.abs(hash) % COLOR_KEYS.length;
  return CLASS_COLOR_THEMES[COLOR_KEYS[colorIndex]];
}

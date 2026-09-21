export const LIGHT_THEMES = [
  {
    id: 'light-pearl',
    name: 'Clean Pearl',
    category: 'light',
    className: 'bg-gradient-to-br from-slate-50 via-white to-slate-100',
    accent: '#6366f1',
    isLight: true,
    preview: 'linear-gradient(135deg, #f8fafc 0%, #ffffff 50%, #f1f5f9 100%)'
  },
  {
    id: 'light-lavender',
    name: 'Soft Lavender',
    category: 'light',
    className: 'bg-gradient-to-br from-purple-50 via-white to-indigo-50',
    accent: '#8b5cf6',
    isLight: true,
    preview: 'linear-gradient(135deg, #faf5ff 0%, #ffffff 50%, #eef2ff 100%)'
  },
  {
    id: 'light-sky',
    name: 'Sky Breeze',
    category: 'light',
    className: 'bg-gradient-to-br from-sky-50 via-white to-cyan-50',
    accent: '#0284c7',
    isLight: true,
    preview: 'linear-gradient(135deg, #f0f9ff 0%, #ffffff 50%, #ecfeff 100%)'
  },
  {
    id: 'light-mint',
    name: 'Fresh Sage',
    category: 'light',
    className: 'bg-gradient-to-br from-emerald-50 via-teal-50/40 to-green-50',
    accent: '#059669',
    isLight: true,
    preview: 'linear-gradient(135deg, #ecfdf5 0%, #f0fdfa 50%, #f0fdf4 100%)'
  },
  {
    id: 'light-peach',
    name: 'Peach Sunrise',
    category: 'light',
    className: 'bg-gradient-to-br from-orange-50 via-rose-50/40 to-amber-50',
    accent: '#ea580c',
    isLight: true,
    preview: 'linear-gradient(135deg, #fff7ed 0%, #fff1f2 50%, #fffbeb 100%)'
  },
  {
    id: 'light-ivory',
    name: 'Warm Linen',
    category: 'light',
    className: 'bg-gradient-to-br from-amber-50/80 via-yellow-50/40 to-stone-100',
    accent: '#d97706',
    isLight: true,
    preview: 'linear-gradient(135deg, #fffbeb 0%, #fefce8 50%, #f5f5f4 100%)'
  },
  {
    id: 'light-platinum',
    name: 'Ice Platinum',
    category: 'light',
    className: 'bg-gradient-to-br from-slate-100 via-zinc-50 to-slate-200/60',
    accent: '#475569',
    isLight: true,
    preview: 'linear-gradient(135deg, #f1f5f9 0%, #fafafa 50%, #e2e8f0 100%)'
  },
  {
    id: 'light-lilac',
    name: 'Lilac Glow',
    category: 'light',
    className: 'bg-gradient-to-br from-fuchsia-50 via-purple-50 to-pink-50',
    accent: '#c026d3',
    isLight: true,
    preview: 'linear-gradient(135deg, #fdf4ff 0%, #faf5ff 50%, #fdf2f8 100%)'
  }
];

export const DARK_THEMES = [
  {
    id: 'cosmic',
    name: 'Cosmic Purple',
    category: 'dark',
    className: 'bg-gradient-to-br from-slate-950 via-[#181135] to-purple-950',
    accent: '#a855f7',
    isLight: false,
    preview: 'linear-gradient(135deg, #020617 0%, #181135 50%, #3b0764 100%)'
  },
  {
    id: 'ocean',
    name: 'Deep Ocean',
    category: 'dark',
    className: 'bg-gradient-to-br from-slate-950 via-blue-950 to-indigo-950',
    accent: '#38bdf8',
    isLight: false,
    preview: 'linear-gradient(135deg, #020617 0%, #172554 50%, #1e1b4b 100%)'
  },
  {
    id: 'emerald',
    name: 'Emerald Aurora',
    category: 'dark',
    className: 'bg-gradient-to-br from-slate-950 via-emerald-950 to-teal-950',
    accent: '#34d399',
    isLight: false,
    preview: 'linear-gradient(135deg, #020617 0%, #064e3b 50%, #134e4a 100%)'
  },
  {
    id: 'sunset',
    name: 'Sunset Magma',
    category: 'dark',
    className: 'bg-gradient-to-br from-slate-950 via-rose-950 to-orange-950',
    accent: '#fb7185',
    isLight: false,
    preview: 'linear-gradient(135deg, #020617 0%, #4c0519 50%, #431407 100%)'
  },
  {
    id: 'cyberpunk',
    name: 'Neon Cyber',
    category: 'dark',
    className: 'bg-gradient-to-br from-indigo-950 via-purple-900 to-pink-950',
    accent: '#ec4899',
    isLight: false,
    preview: 'linear-gradient(135deg, #1e1b4b 0%, #581c87 50%, #500724 100%)'
  },
  {
    id: 'oled',
    name: 'OLED Midnight',
    category: 'dark',
    className: 'bg-gradient-to-br from-black via-slate-950 to-black',
    accent: '#94a3b8',
    isLight: false,
    preview: 'linear-gradient(135deg, #000000 0%, #020617 50%, #000000 100%)'
  },
  {
    id: 'slate',
    name: 'Executive Slate',
    category: 'dark',
    className: 'bg-gradient-to-br from-slate-900 via-slate-800 to-slate-950',
    accent: '#cbd5e1',
    isLight: false,
    preview: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #020617 100%)'
  },
  {
    id: 'midnight-blue',
    name: 'Royal Midnight',
    category: 'dark',
    className: 'bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950',
    accent: '#818cf8',
    isLight: false,
    preview: 'linear-gradient(135deg, #020617 0%, #0f172a 50%, #1e1b4b 100%)'
  }
];

export const BACKGROUND_PRESETS = [...LIGHT_THEMES, ...DARK_THEMES];

export function resolveSlideBackground(background) {
  if (!background) {
    return {
      className: 'bg-gradient-to-br from-slate-950 via-[#181135] to-purple-950',
      style: {},
      isLight: false
    };
  }

  // Match predefined preset
  const preset = BACKGROUND_PRESETS.find(
    p => p.id === background || p.className === background || p.name === background
  );
  if (preset) {
    return {
      className: preset.className,
      style: {},
      isLight: preset.isLight || false
    };
  }

  // Custom CSS color/gradient
  if (
    background.startsWith('#') || 
    background.startsWith('rgb') || 
    background.startsWith('linear-gradient') || 
    background.startsWith('radial-gradient')
  ) {
    // Basic heuristic to detect light hex colors
    let isLight = false;
    if (background.startsWith('#') && (background.length === 7 || background.length === 4)) {
      const hex = background.replace('#', '');
      const r = parseInt(hex.length === 3 ? hex[0] + hex[0] : hex.substring(0, 2), 16);
      const g = parseInt(hex.length === 3 ? hex[1] + hex[1] : hex.substring(2, 4), 16);
      const b = parseInt(hex.length === 3 ? hex[2] + hex[2] : hex.substring(4, 6), 16);
      const brightness = (r * 299 + g * 587 + b * 114) / 1000;
      isLight = brightness > 160;
    }
    return {
      className: '',
      style: { background },
      isLight
    };
  }

  // Tailwind class strings
  if (background.includes('from-') || background.includes('bg-')) {
    const isLight = 
      background.includes('-50') || 
      background.includes('white') || 
      background.includes('-100') ||
      background.includes('light');
    return {
      className: background.startsWith('bg-') ? background : `bg-gradient-to-br ${background}`,
      style: {},
      isLight
    };
  }

  return {
    className: 'bg-gradient-to-br from-slate-950 via-[#181135] to-purple-950',
    style: {},
    isLight: false
  };
}

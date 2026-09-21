export const BACKGROUND_PRESETS = [
  {
    id: 'cosmic',
    name: 'Cosmic Purple',
    className: 'bg-gradient-to-br from-slate-950 via-[#181135] to-purple-950',
    accent: '#a855f7',
    preview: 'linear-gradient(135deg, #020617 0%, #181135 50%, #3b0764 100%)'
  },
  {
    id: 'ocean',
    name: 'Deep Ocean',
    className: 'bg-gradient-to-br from-slate-950 via-blue-950 to-indigo-950',
    accent: '#38bdf8',
    preview: 'linear-gradient(135deg, #020617 0%, #172554 50%, #1e1b4b 100%)'
  },
  {
    id: 'emerald',
    name: 'Emerald Aurora',
    className: 'bg-gradient-to-br from-slate-950 via-emerald-950 to-teal-950',
    accent: '#34d399',
    preview: 'linear-gradient(135deg, #020617 0%, #064e3b 50%, #134e4a 100%)'
  },
  {
    id: 'sunset',
    name: 'Sunset Magma',
    className: 'bg-gradient-to-br from-slate-950 via-rose-950 to-orange-950',
    accent: '#fb7185',
    preview: 'linear-gradient(135deg, #020617 0%, #4c0519 50%, #431407 100%)'
  },
  {
    id: 'cyberpunk',
    name: 'Neon Cyber',
    className: 'bg-gradient-to-br from-indigo-950 via-purple-900 to-pink-950',
    accent: '#ec4899',
    preview: 'linear-gradient(135deg, #1e1b4b 0%, #581c87 50%, #500724 100%)'
  },
  {
    id: 'oled',
    name: 'OLED Midnight',
    className: 'bg-gradient-to-br from-black via-slate-950 to-black',
    accent: '#94a3b8',
    preview: 'linear-gradient(135deg, #000000 0%, #020617 50%, #000000 100%)'
  },
  {
    id: 'slate',
    name: 'Executive Slate',
    className: 'bg-gradient-to-br from-slate-900 via-slate-800 to-slate-950',
    accent: '#cbd5e1',
    preview: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #020617 100%)'
  },
  {
    id: 'light',
    name: 'Clean Light',
    className: 'bg-gradient-to-br from-slate-100 via-white to-purple-50 text-slate-900',
    accent: '#7c3aed',
    isLight: true,
    preview: 'linear-gradient(135deg, #f1f5f9 0%, #ffffff 50%, #faf5ff 100%)'
  }
];

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
    return {
      className: '',
      style: { background },
      isLight: false
    };
  }

  // Tailwind class strings
  if (background.includes('from-') || background.includes('bg-')) {
    return {
      className: background.startsWith('bg-') ? background : `bg-gradient-to-br ${background}`,
      style: {},
      isLight: background.includes('white') || background.includes('slate-100')
    };
  }

  return {
    className: 'bg-gradient-to-br from-slate-950 via-[#181135] to-purple-950',
    style: {},
    isLight: false
  };
}

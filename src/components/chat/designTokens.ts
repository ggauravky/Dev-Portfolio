/**
 * Apple × Notion × Linear Design Tokens for Gaurav AI Chat Components.
 * Centralizes UI constants for glassmorphism, surface elevations, borders,
 * custom easing curves, typography, and interactive state styles.
 */

export const CHAT_TOKENS = {
  // Motion & Animation Easing Curves (Apple / Linear style)
  easing: {
    smooth: 'cubic-bezier(0.16, 1, 0.3, 1)', // Smooth expansion & modal entrance
    micro: 'cubic-bezier(0.4, 0, 0.2, 1)',   // Quick hover & press feedback
  },
  duration: {
    fast: '150ms',
    normal: '250ms',
    slow: '350ms',
  },

  // Surface Elevations (Dark Obsidian Design System)
  surfaces: {
    root: 'bg-[#070708]',
    card: 'bg-[#0e0e11]',
    cardHover: 'bg-[#141418]',
    glassHeader: 'bg-[#0e0e11]/85 backdrop-blur-xl',
    glassInput: 'bg-[#070708]/90 backdrop-blur-md',
    userBubble: 'bg-[#121820] border-[#223042]',
    assistantBubble: 'bg-[#0e0e11] border-[#1a1a22]',
  },

  // Borders & Dividers
  borders: {
    default: 'border-[#1a1a22]',
    hover: 'hover:border-toxic/35',
    active: 'border-toxic/50',
    cyber: 'border-cyber/30',
  },

  // Interactive Badges & Keyboard Shortcuts
  kbd: 'px-1.5 py-0.5 rounded bg-[#18181c] border border-[#262630] font-mono text-[10px] text-zinc-400 shadow-sm',
  chip: 'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#0e0e11] border border-[#1a1a22] hover:border-toxic/30 text-zinc-300 text-xs font-mono transition-all duration-200',

  // Color Palette
  colors: {
    toxic: '#c5f82a',
    cyber: '#38bdf8',
    obsidian: '#070708',
  },
};

'use client';

import { useEffect, useState } from 'react';

export default function ThemeToggle() {
  const [dark, setDark] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const isDark = saved ? saved === 'dark' : prefersDark;
    setDark(isDark);
    document.documentElement.classList.toggle('dark', isDark);
    setMounted(true);
  }, []);

  const toggle = () => {
    const next = !dark;
    setDark(next);
    const html = document.documentElement;
    html.classList.toggle('dark', next);
    
    if (next) {
      html.style.setProperty('--bg', '#0d0a08');
      html.style.setProperty('--bg-subtle', '#140f0c');
      html.style.setProperty('--surface', 'rgba(24, 18, 14, 0.8)');
      html.style.setProperty('--surface-solid', '#18120e');
      html.style.setProperty('--surface2', '#241c16');
      html.style.setProperty('--border', 'rgba(212, 175, 55, 0.2)');
      html.style.setProperty('--border-strong', 'rgba(240, 98, 146, 0.3)');
      html.style.setProperty('--text', '#f7f0eb');
      html.style.setProperty('--text2', '#b8a396');
      html.style.setProperty('--text3', '#806e63');
      html.style.setProperty('--accent', '#f06292');
      html.style.setProperty('--accent-gold', '#f3ce70');
      html.style.setProperty('--accent-rose', '#f48fb1');
      html.style.setProperty('--accent-rose-dark', '#ec407a');
    } else {
      html.style.setProperty('--bg', '#fbf7f4');
      html.style.setProperty('--bg-subtle', '#f5eee8');
      html.style.setProperty('--surface', 'rgba(255, 255, 255, 0.85)');
      html.style.setProperty('--surface-solid', '#ffffff');
      html.style.setProperty('--surface2', '#f4ece6');
      html.style.setProperty('--border', 'rgba(212, 175, 55, 0.22)');
      html.style.setProperty('--border-strong', 'rgba(194, 24, 91, 0.25)');
      html.style.setProperty('--text', '#1c1512');
      html.style.setProperty('--text2', '#6e5c52');
      html.style.setProperty('--text3', '#9a887d');
      html.style.setProperty('--accent', '#d4af37');
      html.style.setProperty('--accent-gold', '#e5c158');
      html.style.setProperty('--accent-rose', '#e91e63');
      html.style.setProperty('--accent-rose-dark', '#c2185b');
    }

    localStorage.setItem('theme', next ? 'dark' : 'light');
  };

  if (!mounted) return null;

  return (
    <button
      onClick={toggle}
      title={dark ? 'Açık temaya geç' : 'Koyu temaya geç'}
      className="fixed top-4 right-4 z-50 flex items-center gap-2 px-3.5 py-2 rounded-full text-xs font-semibold transition-all duration-300 shadow-lg hover:scale-105 active:scale-95 glass"
      style={{
        background: dark ? 'color-mix(in srgb, var(--surface) 80%, transparent)' : 'color-mix(in srgb, #fff 80%, transparent)',
        border: '1px solid var(--border)',
        color: 'var(--text2)',
      }}
    >
      <span className="text-sm transition-transform duration-500" style={{ transform: dark ? 'rotate(360deg)' : 'rotate(0deg)' }}>
        {dark ? '☀️' : '🌙'}
      </span>
      <span>{dark ? 'Açık' : 'Koyu'}</span>
    </button>
  );
}
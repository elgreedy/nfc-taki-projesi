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
    document.documentElement.classList.toggle('dark', next);
    document.body.classList.toggle('dark', next);
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
'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export default function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const nextPath = searchParams.get('next') || '/admin';

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });

      const data = await response.json();
      if (!response.ok || !data.ok) {
        throw new Error(data.error || 'Giriş başarısız.');
      }

      router.replace(nextPath);
    } catch (err: any) {
      setError(err.message || 'Giriş başarısız.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center p-4" style={{ background: 'var(--bg)' }}>
      <div className="w-full max-w-md rounded-3xl border p-8 shadow-2xl" style={{ background: 'var(--surface-solid)', borderColor: 'var(--border)' }}>
        <div className="space-y-2 text-center">
          <p className="text-[11px] font-semibold uppercase tracking-[0.24em]" style={{ color: 'var(--text3)' }}>Yönetim Girişi</p>
          <h1 className="text-2xl font-semibold" style={{ color: 'var(--text)' }}>Admin Paneline Giriş</h1>
          <p className="text-sm" style={{ color: 'var(--text2)' }}>Yetkili erişim için şifreyi girin.</p>
        </div>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Şifre"
            className="w-full rounded-2xl border px-4 py-3 text-sm"
            style={{ borderColor: 'var(--border)', background: 'var(--surface2)', color: 'var(--text)' }}
            required
          />

          {error && <p className="text-sm" style={{ color: '#be123c' }}>{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-2xl py-3 text-sm font-semibold text-white"
            style={{ background: 'var(--accent-gradient)' }}
          >
            {loading ? 'Giriş yapılıyor...' : 'Giriş Yap'}
          </button>
        </form>
      </div>
    </main>
  );
}

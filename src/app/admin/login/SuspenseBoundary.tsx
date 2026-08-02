'use client';

import { Suspense } from 'react';
import LoginForm from './LoginForm';

export default function AdminLoginWithSuspense() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg)' }}><div className="text-sm" style={{ color: 'var(--text2)' }}>Yükleniyor...</div></div>}>
      <LoginForm />
    </Suspense>
  );
}

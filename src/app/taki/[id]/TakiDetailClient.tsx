'use client';

import { useEffect, useRef, useState } from 'react';
import { supabase } from '@/lib/supabase';

interface Jewelry {
  id: string;
  nfc_tag_id: string;
  title: string;
  recipient_name: string;
  message: string;
  media_url: string;
  music_url?: string;
  bg_color?: string;
  is_active: boolean;
}

interface TakiDetailClientProps {
  taki: Jewelry;
}

function isVideo(url: string) {
  return /\.(mp4|webm|ogg|mov)(\?|$)/i.test(url);
}

export default function TakiDetailClient({ taki }: TakiDetailClientProps) {
  const [isClient, setIsClient] = useState(false);
  const [mediaUrl, setMediaUrl] = useState(taki.media_url || '');
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const triggerConfetti = () => {
    if (!isClient) return;
    import('canvas-confetti')
      .then((confetti) => {
        confetti.default({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          zIndex: 9999,
        });
      })
      .catch(() => {});
  };

  useEffect(() => {
    if (!isClient || !mediaUrl) return;
    const timer = window.setTimeout(() => triggerConfetti(), 300);
    return () => window.clearTimeout(timer);
  }, [isClient, mediaUrl]);

  const handleUpload = async (file: File) => {
    setUploadError('');
    const maxSize = 50 * 1024 * 1024;
    if (file.size > maxSize) {
      setUploadError('Dosya 50 MB\'dan büyük olamaz.');
      return;
    }

    const isVideoFile = file.type.startsWith('video/');
    const isImageFile = file.type.startsWith('image/');
    if (!isVideoFile && !isImageFile) {
      setUploadError('Sadece fotoğraf veya video yükleyebilirsiniz.');
      return;
    }

    setUploading(true);
    try {
      const ext = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from('jewelry-media')
        .upload(fileName, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data } = supabase.storage
        .from('jewelry-media')
        .getPublicUrl(fileName);

      const publicUrl = data.publicUrl;

      const res = await fetch('/api/update-media', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: taki.id, media_url: publicUrl }),
      });

      if (!res.ok) {
        const { error } = await res.json();
        throw new Error(error || 'Güncelleme başarısız.');
      }

      setMediaUrl(publicUrl);
      setUploadSuccess(true);
    } catch (err: any) {
      setUploadError(err.message || 'Yükleme sırasında bir hata oluştu.');
    } finally {
      setUploading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleUpload(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleUpload(file);
  };

  return (
    <main
      className="min-h-screen flex flex-col items-center justify-center p-4 sm:p-6 transition-all duration-500"
      style={{ backgroundColor: taki.bg_color || '#fff0f3' }}
    >
      <div className="max-w-md w-full bg-white/90 dark:bg-gray-900/90 backdrop-blur-md rounded-3xl shadow-2xl overflow-hidden p-6 space-y-6 border border-white/50 dark:border-gray-700/50 relative">

        {mediaUrl ? (
          <>
            {taki.recipient_name && (
              <div className="text-center pt-2">
                <span className="inline-block px-3 py-1 bg-rose-100 text-rose-600 rounded-full text-xs font-bold tracking-wider uppercase">
                  🎁 {taki.recipient_name} İçin Özel
                </span>
              </div>
            )}

            <div
              className="relative w-full h-72 rounded-2xl overflow-hidden bg-gray-100 shadow-md group"
            >
              {isVideo(mediaUrl) ? (
                <video
                  src={mediaUrl}
                  className="w-full h-full object-cover"
                  controls
                  playsInline
                />
              ) : (
                <img
                  src={mediaUrl}
                  alt={taki.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  onError={(e) => {
                    (e.target as HTMLElement).parentElement!.style.display = 'none';
                  }}
                />
              )}
            </div>

            <h1 className="text-2xl font-extrabold text-center text-gray-800 dark:text-gray-100 tracking-tight">
              {taki.title}
            </h1>

            {taki.message && (
              <div className="bg-rose-50/70 dark:bg-rose-950/40 p-5 rounded-2xl border border-rose-100/80 dark:border-rose-800/50 text-center relative">
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-white dark:bg-gray-900 px-2 text-rose-400 text-xs font-semibold rounded-full border border-rose-100 dark:border-rose-800">
                  💌 Özel Mesaj
                </span>
                <p className="text-gray-700 dark:text-gray-300 italic leading-relaxed font-serif text-base pt-1">
                  "{taki.message}"
                </p>
              </div>
            )}


            <div className="text-center pt-2 text-[10px] text-gray-400 dark:text-gray-500 tracking-widest uppercase font-semibold">
              ✨ NFC Takı Anı Portalı
            </div>
            <div className="text-center pt-2 text-[10px] text-gray-400 dark:text-gray-500 tracking-widest uppercase font-semibold">
              ✨ NFC Takı Anı Portalı
            </div>
          </>
        ) : (
          <>
            <div className="text-center pt-2 space-y-1">
              <div className="text-4xl">📸</div>
              <h1 className="text-xl font-extrabold text-gray-800 dark:text-gray-100 tracking-tight">
                {taki.title}
              </h1>
              {taki.recipient_name && (
                <p className="text-sm text-rose-500 font-semibold">
                  🎁 {taki.recipient_name} İçin Özel
                </p>
              )}
            </div>

            <div className="bg-rose-50/60 dark:bg-rose-950/30 rounded-2xl p-4 text-center text-sm text-gray-600 dark:text-gray-300 border border-rose-100 dark:border-rose-900">
              Bu takıya henüz bir anı yüklenmemiş. İlk anıyı sen ekle!
            </div>

            <div
              onClick={() => !uploading && inputRef.current?.click()}
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
              className={`relative border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all duration-200 select-none
                ${dragOver
                  ? 'border-rose-400 bg-rose-50 dark:bg-rose-950/30 scale-[1.02]'
                  : 'border-gray-300 dark:border-gray-600 hover:border-rose-400 hover:bg-rose-50/50 dark:hover:bg-rose-950/20'
                }
                ${uploading ? 'opacity-60 cursor-not-allowed' : ''}
              `}
            >
              <input
                ref={inputRef}
                type="file"
                accept="image/*,video/*"
                className="hidden"
                onChange={handleFileChange}
                disabled={uploading}
              />

              {uploading ? (
                <div className="space-y-3">
                  <div className="text-3xl animate-bounce">⏳</div>
                  <p className="text-sm font-semibold text-rose-500">Yükleniyor, lütfen bekleyin...</p>
                </div>
              ) : uploadSuccess ? (
                <div className="space-y-2">
                  <div className="text-3xl">✅</div>
                  <p className="text-sm font-semibold text-green-600">Anı başarıyla yüklendi!</p>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="text-4xl">{dragOver ? '🎯' : '📁'}</div>
                  <div>
                    <p className="text-sm font-semibold text-gray-700 dark:text-gray-200">
                      Fotoğraf veya video yükle
                    </p>
                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                      Sürükle bırak veya tıkla • Maks. 50 MB
                    </p>
                  </div>
                  <div className="flex justify-center gap-2 text-xs text-gray-400">
                    <span className="bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded-full">JPG</span>
                    <span className="bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded-full">PNG</span>
                    <span className="bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded-full">MP4</span>
                    <span className="bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded-full">MOV</span>
                  </div>
                </div>
              )}
            </div>

            {uploadError && (
              <div className="text-sm text-red-500 text-center bg-red-50 dark:bg-red-950/30 rounded-xl p-3 border border-red-200 dark:border-red-800">
                ⚠️ {uploadError}
              </div>
            )}

            {taki.message && (
              <div className="bg-rose-50/70 dark:bg-rose-950/40 p-5 rounded-2xl border border-rose-100/80 dark:border-rose-800/50 text-center relative">
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-white dark:bg-gray-900 px-2 text-rose-400 text-xs font-semibold rounded-full border border-rose-100 dark:border-rose-800">
                  💌 Özel Mesaj
                </span>
                <p className="text-gray-700 dark:text-gray-300 italic leading-relaxed font-serif text-base pt-1">
                  "{taki.message}"
                </p>
              </div>
            )}

            <div className="text-center pt-2 text-[10px] text-gray-400 dark:text-gray-500 tracking-widest uppercase font-semibold">
              ✨ NFC Takı Anı Portalı
            </div>
          </>
        )}
      </div>
    </main>
  );
}
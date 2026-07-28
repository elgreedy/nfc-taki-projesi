'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useParams } from 'next/navigation';

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

export default function TakiPage() {
  const params = useParams();
  const id = params?.id as string;

  const [taki, setTaki] = useState<Jewelry | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Safe Confetti Runner
  const triggerConfetti = () => {
    if (typeof window !== 'undefined') {
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
    }
  };

  useEffect(() => {
    if (!id) return;

    async function fetchTaki() {
      try {
        setLoading(true);
        setErrorMsg(null);

        const { data, error } = await supabase
          .from('jewelries')
          .select('*')
          .eq('nfc_tag_id', id)
          .single();

        if (error) {
          console.error('Supabase hatası:', error);
          setErrorMsg('Anı bilgisi alınamadı.');
          setLoading(false);
          return;
        }

        if (!data || !data.is_active) {
          setErrorMsg('Bu NFC takısına ait bir kayıt bulunamadı.');
          setLoading(false);
          return;
        }

        setTaki(data);
        setLoading(false);

        // Sayfa yüklendikten hemen sonra konfeti çalıştır
        setTimeout(() => triggerConfetti(), 300);
      } catch (err: any) {
        setErrorMsg('Bir hata oluştu: ' + err.message);
        setLoading(false);
      }
    }

    fetchTaki();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-rose-50 flex items-center justify-center p-4">
        <div className="animate-pulse text-rose-500 font-medium text-lg">
          ✨ Sürpriz Yükleniyor...
        </div>
      </div>
    );
  }

  if (errorMsg || !taki) {
    return (
      <div className="min-h-screen bg-rose-50 flex items-center justify-center p-4">
        <div className="bg-white p-6 rounded-2xl shadow-xl max-w-sm text-center space-y-3">
          <div className="text-3xl">⚠️</div>
          <h2 className="text-lg font-bold text-gray-800">Sürpriz Açılamadı</h2>
          <p className="text-sm text-gray-500">{errorMsg || 'Kayıt bulunamadı.'}</p>
        </div>
      </div>
    );
  }

  return (
    <main
      className="min-h-screen flex flex-col items-center justify-center p-4 sm:p-6 transition-all duration-500"
      style={{ backgroundColor: taki.bg_color || '#fff0f3' }}
    >
      <div className="max-w-md w-full bg-white/90 backdrop-blur-md rounded-3xl shadow-2xl overflow-hidden p-6 space-y-6 border border-white/50 relative">
        
        {/* Üst Kalp Butonu */}
        <button
          onClick={triggerConfetti}
          className="absolute top-4 right-4 text-2xl hover:scale-125 transition-transform cursor-pointer active:scale-95"
          title="Sürpriz Konfeti Patlat!"
        >
          💖
        </button>

        {/* Alıcı Başlığı */}
        {taki.recipient_name && (
          <div className="text-center pt-2">
            <span className="inline-block px-3 py-1 bg-rose-100 text-rose-600 rounded-full text-xs font-bold tracking-wider uppercase">
              🎁 {taki.recipient_name} İçin Özel
            </span>
          </div>
        )}

        {/* Görsel / Fotoğraf */}
        {taki.media_url && (
          <div
            onClick={triggerConfetti}
            className="relative w-full h-72 rounded-2xl overflow-hidden bg-gray-100 shadow-md cursor-pointer group"
          >
            <img
              src={taki.media_url}
              alt={taki.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              onError={(e) => {
                // Görsel erişilemez durumdaysa kapsayıcıyı saklar
                (e.target as HTMLElement).parentElement!.style.display = 'none';
              }}
            />
          </div>
        )}

        {/* Başlık */}
        <h1 className="text-2xl font-extrabold text-center text-gray-800 tracking-tight">
          {taki.title}
        </h1>

        {/* Özel Mesaj Kutusu */}
        {taki.message && (
          <div className="bg-rose-50/70 p-5 rounded-2xl border border-rose-100/80 text-center relative">
            <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-white px-2 text-rose-400 text-xs font-semibold rounded-full border border-rose-100">
              💌 Özel Mesaj
            </span>
            <p className="text-gray-700 italic leading-relaxed font-serif text-base pt-1">
              "{taki.message}"
            </p>
          </div>
        )}

        {/* Kutlama Butonu */}
        <button
          onClick={triggerConfetti}
          className="w-full py-3 bg-gradient-to-r from-rose-500 to-pink-500 text-white rounded-xl font-bold shadow-lg shadow-rose-200 hover:shadow-xl hover:opacity-95 transition active:scale-98 text-sm flex items-center justify-center gap-2"
        >
          <span>🎉</span> Anıyı Kutla (Konfeti)
        </button>

        {/* Footer */}
        <div className="text-center pt-2 text-[10px] text-gray-400 tracking-widest uppercase font-semibold">
          ✨ NFC Takı Anı Portalı
        </div>
      </div>
    </main>
  );
}

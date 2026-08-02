'use client';

import { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import NextImage from 'next/image';
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

interface MediaItem {
  id: string;
  url: string;
  media_type: string;
  order_index: number;
}

interface Props {
  taki: Jewelry;
}

function isVideo(url: string) {
  return /\.(mp4|webm|ogg|mov)(\?|$)/i.test(url);
}

export default function TakiDetailClient({ taki }: Props) {
  const searchParams = useSearchParams();
  const isEditMode = searchParams.get('edit') === 'true';
  const [isClient, setIsClient] = useState(false);
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
  const [mediaLoading, setMediaLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [trackIndex, setTrackIndex] = useState(1);
  const [isTransitioning, setIsTransitioning] = useState(true);
  const carouselRef = useRef<HTMLDivElement>(null);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<{ done: number; total: number } | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [storyMode, setStoryMode] = useState(false);
  const [storyIndex, setStoryIndex] = useState(0);
  const [fontStyle, setFontStyle] = useState<'serif' | 'sans' | 'cursive'>('serif');
  const [showParticles, setShowParticles] = useState(() => {
    // Disable particles on mobile for better performance
    if (typeof window !== 'undefined') {
      return window.innerWidth > 768;
    }
    return true;
  });
  const [editForm, setEditForm] = useState({ title: taki.title, recipient_name: taki.recipient_name || '', message: taki.message || '' });
  const [editSaving, setEditSaving] = useState(false);
  const [editFeedback, setEditFeedback] = useState<string | null>(null);
  const [particles, setParticles] = useState<Array<{ id: number; icon: string; left: string; delay: string; duration: string; size: string }>>([]);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const inputRef = useRef<HTMLInputElement>(null);
  const thumbsRef = useRef<HTMLDivElement>(null);
  const touchStartX = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);

  useEffect(() => { setIsClient(true); }, []);

  useEffect(() => {
    if (!isClient) return;
    const theme = localStorage.getItem('theme');
    const darkPreferred = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const isDark = theme === 'dark' || (theme === null && darkPreferred);
    const html = document.documentElement;
    
    html.classList.toggle('dark', isDark);
    
    if (isDark) {
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
    }
  }, [isClient]);

  useEffect(() => {
    setEditForm({ title: taki.title, recipient_name: taki.recipient_name || '', message: taki.message || '' });
  }, [taki.title, taki.recipient_name, taki.message]);

  useEffect(() => {
    if (!storyMode || mediaItems.length <= 1) return;
    const timer = window.setInterval(() => {
      setStoryIndex((prev) => (prev + 1) % mediaItems.length);
    }, 4200);
    return () => window.clearInterval(timer);
  }, [storyMode, mediaItems.length]);

  useEffect(() => {
    setParticles(Array.from({ length: 18 }, (_, index) => ({
      id: index,
      icon: ['💖', '✨', '💫', '🌸'][index % 4],
      left: `${Math.random() * 100}%`,
      delay: `${Math.random() * 4}s`,
      duration: `${8 + Math.random() * 6}s`,
      size: `${12 + Math.random() * 18}px`,
    })));
  }, []);

  useEffect(() => {
    if (!taki.id) return;
    setMediaLoading(true);
    fetch(`/api/get-media?jewelry_id=${taki.id}`)
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setMediaItems(data);
        } else if (taki.media_url) {
          setMediaItems([{ id: 'legacy', url: taki.media_url, media_type: isVideo(taki.media_url) ? 'video' : 'image', order_index: 0 }]);
        }
      })
      .catch(() => {
        if (taki.media_url) {
          setMediaItems([{ id: 'legacy', url: taki.media_url, media_type: isVideo(taki.media_url) ? 'video' : 'image', order_index: 0 }]);
        }
      })
      .finally(() => setMediaLoading(false));
  }, [taki.id, taki.media_url]);

  const hasMedia = mediaItems.length > 0;

  const triggerConfetti = () => {
    if (!isClient) return;
    import('canvas-confetti').then((m) => {
      m.default({
        particleCount: 140,
        spread: 90,
        origin: { y: 0.55 },
        zIndex: 9999,
        colors: ['#d4af37', '#f48fb1', '#e91e63', '#ffffff', '#f3ce70']
      });
    }).catch(() => {});
  };

  useEffect(() => {
    if (!isClient || !hasMedia) return;
    const t = window.setTimeout(() => triggerConfetti(), 600);
    return () => window.clearTimeout(t);
  }, [isClient, hasMedia]);

  // Keyboard navigation for Lightbox
  useEffect(() => {
    if (lightboxIndex === null) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setLightboxIndex(null);
      if (e.key === 'ArrowLeft') setLightboxIndex((i) => (i! > 0 ? i! - 1 : mediaItems.length - 1));
      if (e.key === 'ArrowRight') setLightboxIndex((i) => (i! < mediaItems.length - 1 ? i! + 1 : 0));
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [lightboxIndex, mediaItems.length]);

  const goTo = (realIndex: number, track?: number) => {
    const t = track ?? realIndex + 1;
    setCurrentIndex(realIndex);
    setTrackIndex(t);
    setIsTransitioning(true);
    setTimeout(() => {
      const el = thumbsRef.current?.children[realIndex] as HTMLElement;
      el?.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
    }, 50);
  };

  const prev = () => {
    if (mediaItems.length <= 1) return;
    const nextReal = currentIndex > 0 ? currentIndex - 1 : mediaItems.length - 1;
    goTo(nextReal, trackIndex - 1);
  };
  const next = () => {
    if (mediaItems.length <= 1) return;
    const nextReal = currentIndex < mediaItems.length - 1 ? currentIndex + 1 : 0;
    goTo(nextReal, trackIndex + 1);
  };

  const handleTransitionEnd = () => {
    if (!isTransitioning) return;
    const n = mediaItems.length;
    if (trackIndex === 0) {
      setIsTransitioning(false);
      setTrackIndex(n);
    } else if (trackIndex === n + 1) {
      setIsTransitioning(false);
      setTrackIndex(1);
    }
  };

  useEffect(() => {
    if (!isTransitioning && carouselRef.current) {
      const frame = requestAnimationFrame(() => {
        setIsTransitioning(true);
      });
      return () => cancelAnimationFrame(frame);
    }
  }, [isTransitioning, trackIndex]);

  const onTouchStart = (e: React.TouchEvent) => {
    if (!multiPhoto) return; // Disable swipe if only one photo
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
  };
  const onTouchEnd = (e: React.TouchEvent) => {
    if (!multiPhoto || touchStartX.current === null) return;
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    const dy = e.changedTouches[0].clientY - (touchStartY.current || 0);
    
    // Prioritize vertical scroll - if vertical movement is larger, ignore horizontal swipe
    if (Math.abs(dy) > Math.abs(dx)) {
      touchStartX.current = null;
      touchStartY.current = null;
      return;
    }
    
    // Only trigger swipe if horizontal movement is significant (60px+)
    if (dx < -60) next();
    else if (dx > 60) prev();
    touchStartX.current = null;
    touchStartY.current = null;
  };

  const toggleAudio = () => {
    if (!audioRef.current) return;
    if (isPlayingAudio) {
      audioRef.current.pause();
      setIsPlayingAudio(false);
    } else {
      audioRef.current.play().then(() => setIsPlayingAudio(true)).catch(() => {});
    }
  };

  const uploadSingle = async (file: File): Promise<boolean> => {
    if (file.size > 50 * 1024 * 1024) {
      setUploadError(`${file.name}: 50 MB'dan büyük olamaz.`);
      return false;
    }
    if (!file.type.startsWith('image/') && !file.type.startsWith('video/')) {
      setUploadError(`${file.name}: Sadece fotoğraf veya video yükleyebilirsiniz.`);
      return false;
    }
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('jewelry_id', taki.id);
      const uploadRes = await fetch('/api/upload-to-r2', { method: 'POST', body: formData });
      if (!uploadRes.ok) { const { error } = await uploadRes.json(); throw new Error(error || 'Yükleme başarısız.'); }
      const { url: publicUrl } = await uploadRes.json();
      const mediaType = file.type.startsWith('video/') ? 'video' : 'image';
      const res = await fetch('/api/add-media', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jewelry_id: taki.id, url: publicUrl, media_type: mediaType }),
      });
      if (!res.ok) { const { error } = await res.json(); throw new Error(error || 'Kayıt başarısız.'); }
      const newItem = await res.json();
      setMediaItems((prev) => {
        const nextItems = [...prev, newItem];
        setCurrentIndex(nextItems.length - 1);
        return nextItems;
      });
      return true;
    } catch (err: any) {
      setUploadError(`${file.name}: ${err.message || 'Yükleme hatası.'}`);
      return false;
    }
  };

  const handleUploadFiles = async (files: File[]) => {
    if (files.length === 0) return;
    setUploadError('');
    setUploading(true);
    setUploadProgress({ done: 0, total: files.length });
    for (let i = 0; i < files.length; i++) {
      await uploadSingle(files[i]);
      setUploadProgress({ done: i + 1, total: files.length });
    }
    setUploading(false);
    setUploadProgress(null);
    setUploadSuccess(true);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    e.target.value = '';
    handleUploadFiles(files);
  };

  const handleSaveEdit = async () => {
    setEditSaving(true);
    setEditFeedback(null);
    try {
      const { error } = await supabase.from('jewelries').update({
        title: editForm.title,
        recipient_name: editForm.recipient_name,
        message: editForm.message,
      }).eq('id', taki.id);
      if (error) throw new Error(error.message);
      setEditFeedback('Anınız başarıyla güncellendi.');
    } catch (err: any) {
      setEditFeedback(err.message || 'Güncelleme başarısız.');
    } finally {
      setEditSaving(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    handleUploadFiles(Array.from(e.dataTransfer.files || []));
  };

  if (mediaLoading) {
    return (
      <main className="min-h-screen flex items-center justify-center p-4" style={{ background: 'var(--bg)' }}>
        <div className="w-full max-w-sm lg:max-w-5xl animate-fade-in">
          <div className="glass-card flex flex-col lg:flex-row lg:min-h-[540px] overflow-hidden">
            <div className="lg:w-[62%] lg:flex-shrink-0 flex items-center justify-center p-12"
              style={{ background: 'var(--surface2)', minHeight: 320 }}>
              <div className="flex flex-col items-center gap-4">
                <div className="w-14 h-14 rounded-full border-4 border-t-transparent animate-spin"
                  style={{ borderColor: 'var(--accent)', borderTopColor: 'transparent' }} />
                <p className="text-sm font-semibold tracking-wide font-serif gold-text animate-pulse">
                  Özel Anılar Yükleniyor...
                </p>
              </div>
            </div>
            <div className="flex flex-col gap-5 p-6 lg:p-10 lg:flex-1 lg:justify-center">
              <div className="space-y-3">
                <div className="h-8 rounded-xl animate-pulse" style={{ background: 'var(--surface2)', width: '75%' }} />
                <div className="h-4 rounded-lg animate-pulse" style={{ background: 'var(--surface2)', width: '45%' }} />
              </div>
              <div className="h-24 rounded-2xl animate-pulse" style={{ background: 'var(--surface2)' }} />
              <div className="h-12 rounded-2xl animate-pulse" style={{ background: 'var(--surface2)' }} />
            </div>
          </div>
        </div>
      </main>
    );
  }

  const currentMedia = mediaItems[currentIndex];
  const multiPhoto = mediaItems.length > 1;

  if (hasMedia && currentMedia) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center p-4 sm:p-8 relative selection:bg-rose-500 selection:text-white" style={{ background: 'var(--bg)' }}>
        {/* Background Blobs */}
        <div className="blob animate-glow-pulse" style={{ width: 400, height: 400, background: 'var(--accent-gold)', top: '5%', right: '-8%', opacity: 0.1 }} />
        <div className="blob animate-float-slow" style={{ width: 350, height: 350, background: 'var(--accent-rose)', bottom: '5%', left: '-8%', opacity: 0.12 }} />

        {showParticles && (
          <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
            {particles.map((particle) => (
              <span
                key={particle.id}
                className="particle"
                style={{ left: particle.left, top: '-10vh', fontSize: particle.size, animationDelay: particle.delay, animationDuration: particle.duration }}
              >
                {particle.icon}
              </span>
            ))}
          </div>
        )}

        <div className="relative z-10 w-full max-w-sm lg:max-w-5xl animate-fade-up">

          {/* Recipient Ribbon */}
          {taki.recipient_name && (
            <div className="flex justify-center mb-5">
              <span className="inline-flex items-center gap-2 px-5 py-2 rounded-full glass text-xs font-bold tracking-widest uppercase shadow-md font-sans"
                style={{ color: 'var(--accent)', border: '1px solid var(--border)' }}>
                <span className="text-sm">✦</span> {taki.recipient_name} İçin Özel Dijital Portal
              </span>
            </div>
          )}

          <div className="mb-5 flex flex-wrap items-center justify-between gap-3 rounded-full border px-4 py-3 glass-3d gold-foil-glow" style={{ borderColor: 'var(--border)' }}>
            <div className="text-[11px] font-bold uppercase tracking-[0.3em]" style={{ color: 'var(--accent)' }}>Anı Portalı</div>
            <div className="flex flex-wrap gap-2">
              <button onClick={() => setStoryMode((prev) => !prev)} className="rounded-full border px-3 py-1.5 text-[11px] font-semibold" style={{ borderColor: 'var(--border)', background: 'var(--surface2)', color: 'var(--text)' }}>
                {storyMode ? '📸 Hikaye Açık' : '📖 Hikaye Modu'}
              </button>
              <button onClick={() => setShowParticles((prev) => !prev)} className="rounded-full border px-3 py-1.5 text-[11px] font-semibold" style={{ borderColor: 'var(--border)', background: 'var(--surface2)', color: 'var(--text)' }}>
                {showParticles ? '✨ Efektler Açık' : '🌙 Efektler Kapalı'}
              </button>
            </div>
          </div>

          {/* Main Memory Card */}
          <div className="glass-card glass-3d holographic-border flex flex-col lg:flex-row lg:min-h-[560px] overflow-hidden">

            {/* LEFT: Carousel Container */}
            <div className="relative flex flex-col lg:w-[62%] lg:flex-shrink-0"
              onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}>

              {/* Infinite carousel */}
              {(() => {
                const slides = mediaItems.length > 1
                  ? [mediaItems[mediaItems.length - 1], ...mediaItems, mediaItems[0]]
                  : mediaItems;
                const total = slides.length;
                const pct = 100 / total;
                return (
                  <div className="overflow-hidden h-[52vh] lg:h-[68vh] relative" style={{ background: '#0a0807' }}>
                    <div
                      ref={carouselRef}
                      onTransitionEnd={handleTransitionEnd}
                      style={{
                        display: 'flex',
                        width: `${total * 100}%`,
                        height: '100%',
                        transform: `translateX(-${(mediaItems.length > 1 ? trackIndex : 0) * pct}%)`,
                        transition: isTransitioning ? 'transform 0.45s cubic-bezier(0.16, 1, 0.3, 1)' : 'none',
                        willChange: 'transform',
                      }}>
                      {slides.map((item, i) => (
                        <div key={i} style={{ width: `${pct}%`, flexShrink: 0, height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          {isVideo(item.url) ? (
                            <video
                              src={item.url}
                              controls
                              playsInline
                              preload="metadata"
                              style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
                            />
                          ) : (
                            <div 
                              onClick={() => setLightboxIndex(currentIndex)}
                              style={{ position: 'relative', width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'zoom-in' }}>
                              <NextImage
                                src={item.url}
                                alt="Media"
                                fill
                                sizes="(max-width: 768px) 100vw, 70vw"
                                priority={i === 0}
                                loading={i === 0 ? 'eager' : 'lazy'}
                                style={{ objectFit: 'contain', pointerEvents: 'none' }}
                                unoptimized={!item.url.includes('r2.dev') && !item.url.includes('unsplash.com')}
                              />
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })()}

              {storyMode && mediaItems.length > 1 && (
                <div className="absolute inset-0 z-20 flex flex-col justify-between p-4">
                  <div className="flex items-center justify-between">
                    <div className="rounded-full bg-black/50 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.3em] text-white">Story Mode</div>
                    <div className="flex gap-1">
                      {mediaItems.map((_, idx) => (
                        <div key={idx} className="h-1.5 w-12 rounded-full overflow-hidden bg-white/25">
                          <div className="h-full rounded-full bg-white" style={{ width: idx === storyIndex ? '100%' : '0%', transition: 'width 0.4s ease' }} />
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center justify-end">
                    <button onClick={() => setStoryMode(false)} className="rounded-full bg-black/50 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.3em] text-white">Kapat</button>
                  </div>
                </div>
              )}

              {/* Navigation Arrows */}
              {multiPhoto && (
                <>
                  <button onClick={prev}
                    aria-label="Önceki Medya"
                    className="absolute left-4 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full flex items-center justify-center font-black text-2xl text-white transition-all duration-200 active:scale-90 hover:scale-110 glass"
                    style={{ background: 'rgba(0,0,0,0.5)', borderColor: 'rgba(255,255,255,0.2)' }}>
                    ‹
                  </button>
                  <button onClick={next}
                    aria-label="Sonraki Medya"
                    className="absolute right-4 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full flex items-center justify-center font-black text-2xl text-white transition-all duration-200 active:scale-90 hover:scale-110 glass"
                    style={{ background: 'rgba(0,0,0,0.5)', borderColor: 'rgba(255,255,255,0.2)' }}>
                    ›
                  </button>
                </>
              )}

              {/* Media Counter */}
              {multiPhoto && (
                <div className="absolute top-4 right-4 pointer-events-none">
                  <span className="text-xs font-bold px-3 py-1.5 rounded-full glass text-white tracking-wider"
                    style={{ background: 'rgba(0,0,0,0.6)', borderColor: 'rgba(255,255,255,0.2)' }}>
                    {currentIndex + 1} / {mediaItems.length}
                  </span>
                </div>
              )}

              {/* Thumbnails Row */}
              {multiPhoto && (
                <div
                  ref={thumbsRef}
                  className="flex gap-2.5 px-4 py-3 overflow-x-auto border-t"
                  style={{ scrollbarWidth: 'none', msOverflowStyle: 'none', background: 'var(--surface2)', borderColor: 'var(--border)' }}>
                  {mediaItems.map((item, i) => (
                    <button
                      key={item.id}
                      onClick={() => goTo(i)}
                      className="flex-shrink-0 rounded-2xl overflow-hidden transition-all duration-300 relative group"
                      style={{
                        width: '64px',
                        height: '64px',
                        border: i === currentIndex ? '3px solid var(--accent)' : '2px solid var(--border)',
                        opacity: i === currentIndex ? 1 : 0.6,
                        transform: i === currentIndex ? 'scale(1.05)' : 'scale(1)',
                        boxShadow: i === currentIndex ? '0 4px 15px rgba(212, 175, 55, 0.4)' : 'none'
                      }}>
                      {item.media_type === 'video' ? (
                        <div className="w-full h-full flex items-center justify-center text-lg text-white font-bold"
                          style={{ background: '#1c1512' }}>▶</div>
                      ) : (
                        <div style={{ position: 'relative', width: '100%', height: '100%' }}>
                          <NextImage
                            src={item.url} alt="" fill sizes="64px"
                            style={{ objectFit: 'cover' }}
                            unoptimized={!item.url.includes('r2.dev') && !item.url.includes('unsplash.com')}
                          />
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* RIGHT: Memory Content & Actions */}
            <div className="flex flex-col justify-between gap-6 p-6 lg:p-10 lg:flex-1">

              <div className="space-y-4">
                <div className="space-y-1">
                  <h1 className={`text-3xl lg:text-4xl font-extrabold tracking-tight ${fontStyle === 'cursive' ? 'font-serif' : fontStyle === 'sans' ? 'font-sans' : 'font-serif'} shimmer-text`}>
                    {taki.title}
                  </h1>
                  {taki.recipient_name && (
                    <p className="text-sm font-semibold gold-text">
                      ✦ {taki.recipient_name}
                    </p>
                  )}
                </div>

                {isEditMode && (
                  <div className="rounded-2xl border p-4 space-y-3" style={{ borderColor: 'var(--border)', background: 'var(--surface2)' }}>
                    <div className="text-[11px] font-bold uppercase tracking-[0.3em]" style={{ color: 'var(--accent)' }}>Kişisel Düzenleme</div>
                    <div className="space-y-2">
                      <input value={editForm.title} onChange={(e) => setEditForm({ ...editForm, title: e.target.value })} className="w-full rounded-xl border px-3 py-2 text-sm" style={{ borderColor: 'var(--border)', background: 'var(--surface-solid)', color: 'var(--text)' }} placeholder="Başlık" />
                      <input value={editForm.recipient_name} onChange={(e) => setEditForm({ ...editForm, recipient_name: e.target.value })} className="w-full rounded-xl border px-3 py-2 text-sm" style={{ borderColor: 'var(--border)', background: 'var(--surface-solid)', color: 'var(--text)' }} placeholder="Alıcı adı" />
                      <textarea value={editForm.message} onChange={(e) => setEditForm({ ...editForm, message: e.target.value })} rows={3} className="w-full rounded-xl border px-3 py-2 text-sm resize-none" style={{ borderColor: 'var(--border)', background: 'var(--surface-solid)', color: 'var(--text)' }} placeholder="Mesajınız" />
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <button onClick={handleSaveEdit} disabled={editSaving} className="rounded-xl px-3 py-2 text-sm font-semibold text-white" style={{ background: 'var(--accent-gradient)' }}>
                        {editSaving ? 'Kaydediliyor...' : 'Kaydet'}
                      </button>
                      <button onClick={() => setFontStyle(fontStyle === 'serif' ? 'cursive' : fontStyle === 'cursive' ? 'sans' : 'serif')} className="rounded-xl border px-3 py-2 text-sm font-semibold" style={{ borderColor: 'var(--border)', color: 'var(--text)' }}>
                        {fontStyle === 'serif' ? 'Yazı Tipi: Serif' : fontStyle === 'cursive' ? 'Yazı Tipi: El Yazısı' : 'Yazı Tipi: Sans'}
                      </button>
                    </div>
                    {editFeedback && <p className="text-xs" style={{ color: 'var(--accent)' }}>{editFeedback}</p>}
                  </div>
                )}

                {/* Personal Message Card */}
                {taki.message && (
                  <div className="relative rounded-2xl p-5 border transition-all" style={{ background: 'var(--surface2)', borderColor: 'var(--border)' }}>
                    <div className="absolute -top-3 left-6 px-3 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-widest glass"
                      style={{ color: 'var(--accent)', borderColor: 'var(--border)' }}>
                      💌 Özel Mesaj
                    </div>
                    <p className={`text-sm sm:text-base leading-relaxed pt-1 ${fontStyle === 'cursive' ? 'font-serif italic' : fontStyle === 'sans' ? 'font-sans' : 'font-serif'}`} style={{ color: 'var(--text2)' }}>
                      "{taki.message}"
                    </p>
                  </div>
                )}

                {/* Background Music Player (If Present) */}
                {taki.music_url && (
                  <div className="rounded-2xl p-4 glass flex items-center justify-between gap-3">
                    <audio ref={audioRef} src={taki.music_url} loop />
                    <div className="flex items-center gap-3">
                      <button
                        onClick={toggleAudio}
                        className="w-10 h-10 rounded-full flex items-center justify-center text-white text-lg font-bold transition-transform hover:scale-110 active:scale-95"
                        style={{ background: 'var(--accent-gradient)' }}>
                        {isPlayingAudio ? '⏸' : '▶'}
                      </button>
                      <div>
                        <p className="text-xs font-bold" style={{ color: 'var(--text)' }}>Özel Fon Müziği</p>
                        <p className="text-[11px]" style={{ color: 'var(--text2)' }}>{isPlayingAudio ? 'Çalıyor...' : 'Dinlemek için tıklayın'}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col gap-3 pt-2">
                <input ref={inputRef} type="file" accept="image/*,video/*" multiple className="hidden" onChange={handleFileChange} disabled={uploading} />

                <button
                  onClick={() => !uploading && inputRef.current?.click()}
                  disabled={uploading}
                  className="w-full py-3.5 rounded-2xl text-sm font-bold tracking-wide transition-all duration-300 active:scale-95 flex items-center justify-center gap-2 glass hover:border-rose-400 disabled:opacity-50"
                  style={{ color: 'var(--text)' }}>
                  {uploading ? (
                    <>
                      <div className="w-4 h-4 rounded-full border-2 border-t-transparent animate-spin"
                        style={{ borderColor: 'var(--accent)', borderTopColor: 'transparent' }} />
                      {uploadProgress && uploadProgress.total > 1
                        ? `Anılar Yükleniyor... (${uploadProgress.done + 1}/${uploadProgress.total})`
                        : 'Yükleniyor...'}
                    </>
                  ) : (
                    <>📸 Yeni Anı / Medya Yükle</>
                  )}
                </button>

                {uploadError && (
                  <p className="text-xs text-center font-medium" style={{ color: '#be123c' }}>⚠️ {uploadError}</p>
                )}

                <button
                  onClick={triggerConfetti}
                  className="w-full py-4 rounded-2xl text-sm font-bold tracking-wide transition-all duration-300 active:scale-95 hover-lift flex items-center justify-center gap-2 text-white"
                  style={{
                    background: 'var(--accent-gradient)',
                    boxShadow: '0 8px 25px -6px rgba(233, 30, 99, 0.4)',
                  }}>
                  <span className="text-lg">💝</span> Anıyı Kutla & Confetti
                </button>
              </div>
            </div>
          </div>

          <p className="text-center text-[11px] font-bold tracking-[0.25em] uppercase mt-6 font-sans" style={{ color: 'var(--text3)' }}>
            ✦ NFC Takı Dijital Anı Portalı
          </p>
        </div>

        {/* Lightbox Overlay */}
        {lightboxIndex !== null && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in"
            style={{ background: 'rgba(10, 8, 7, 0.95)', backdropFilter: 'blur(12px)' }}
            onClick={() => setLightboxIndex(null)}>
            <div
              className="relative w-full h-full max-w-6xl max-h-[90vh] flex items-center justify-center"
              onClick={(e) => e.stopPropagation()}>
              <NextImage
                src={mediaItems[lightboxIndex].url}
                alt=""
                fill
                sizes="100vw"
                style={{ objectFit: 'contain', userSelect: 'none' }}
                unoptimized={!mediaItems[lightboxIndex].url.includes('r2.dev') && !mediaItems[lightboxIndex].url.includes('unsplash.com')}
              />
            </div>

            <button
              className="absolute top-6 right-6 w-12 h-12 rounded-full flex items-center justify-center text-white text-xl font-bold glass transition-transform hover:scale-110"
              onClick={() => setLightboxIndex(null)}>
              ✕
            </button>

            {mediaItems.length > 1 && (
              <>
                <button
                  className="absolute left-6 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full flex items-center justify-center text-white font-black text-2xl glass transition-transform hover:scale-110"
                  onClick={(e) => { e.stopPropagation(); setLightboxIndex((i) => (i! > 0 ? i! - 1 : mediaItems.length - 1)); }}>
                  ‹
                </button>
                <button
                  className="absolute right-6 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full flex items-center justify-center text-white font-black text-2xl glass transition-transform hover:scale-110"
                  onClick={(e) => { e.stopPropagation(); setLightboxIndex((i) => (i! < mediaItems.length - 1 ? i! + 1 : 0)); }}>
                  ›
                </button>
                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-xs font-bold text-white glass px-4 py-1.5 rounded-full tracking-widest">
                  {lightboxIndex + 1} / {mediaItems.length}
                </div>
              </>
            )}
          </div>
        )}
      </main>
    );
  }

  // Medya yoksa — Özel Drag & Drop Anı Yükleme Ekranı
  return (
    <main className="relative min-h-screen flex flex-col items-center justify-center p-4 sm:p-6 overflow-hidden selection:bg-rose-500 selection:text-white" style={{ background: 'var(--bg)' }}>
      {/* Background Blobs */}
      <div className="blob animate-glow-pulse" style={{ width: 300, height: 300, background: 'var(--accent-gold)', top: '10%', left: '-8%', opacity: 0.12 }} />
      <div className="blob animate-float-slow" style={{ width: 260, height: 260, background: 'var(--accent-rose)', bottom: '8%', right: '-5%', opacity: 0.15 }} />

      <div className="relative z-10 w-full max-w-md animate-fade-up space-y-6">

        <div className="text-center space-y-3">
          <div className="w-20 h-20 rounded-3xl mx-auto flex items-center justify-center text-4xl shadow-xl glass-card animate-float">
            📸
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight font-serif shimmer-text">
            {taki.title}
          </h1>
          {taki.recipient_name && (
            <p className="text-sm font-semibold gold-text">
              ✦ {taki.recipient_name} İçin Özel
            </p>
          )}
        </div>

        <div className="glass-card p-5 text-center text-sm font-sans" style={{ color: 'var(--text2)' }}>
          Bu takıya henüz bir fotoğraf veya video yüklenmemiş.<br />
          <span className="font-bold text-base gold-text">İlk anıyı sen ekle!</span>
        </div>

        {/* Drag & Drop Upload Zone */}
        <div
          onClick={() => !uploading && inputRef.current?.click()}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          className="glass-card p-10 text-center cursor-pointer transition-all duration-300 select-none border-2 border-dashed group hover:border-rose-400"
          style={{
            borderColor: dragOver ? 'var(--accent-rose)' : 'var(--border)',
            background: dragOver ? 'color-mix(in srgb, var(--accent-rose) 12%, transparent)' : 'var(--surface)',
            transform: dragOver ? 'scale(1.02)' : 'scale(1)',
            opacity: uploading ? 0.7 : 1,
            cursor: uploading ? 'not-allowed' : 'pointer',
          }}>
          <input ref={inputRef} type="file" accept="image/*,video/*" multiple className="hidden" onChange={handleFileChange} disabled={uploading} />

          {uploading ? (
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-full mx-auto border-4 border-t-transparent animate-spin"
                style={{ borderColor: 'var(--accent)', borderTopColor: 'transparent' }} />
              <p className="text-sm font-semibold font-serif gold-text animate-pulse">
                {uploadProgress && uploadProgress.total > 1
                  ? `Yükleniyor... ${uploadProgress.done + 1}/${uploadProgress.total}`
                  : 'Anınız Depolanıyor...'}
              </p>
            </div>
          ) : uploadSuccess ? (
            <div className="space-y-2">
              <div className="text-5xl">✨</div>
              <p className="text-base font-bold font-serif gold-text">Anı Başarıyla Yüklendi!</p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="text-5xl transition-transform group-hover:scale-110">{dragOver ? '🎯' : '☁️'}</div>
              <div>
                <p className="text-base font-bold font-serif" style={{ color: 'var(--text)' }}>Fotoğraf veya Video Yükle</p>
                <p className="text-xs mt-1 font-sans" style={{ color: 'var(--text2)' }}>Sürükle bırak veya dokun · Maks. 50 MB</p>
              </div>
              <div className="flex justify-center gap-2 flex-wrap pt-1">
                {['JPG', 'PNG', 'MP4', 'MOV'].map((f) => (
                  <span key={f} className="text-[10px] font-bold px-2.5 py-1 rounded-full glass"
                    style={{ color: 'var(--text2)' }}>
                    {f}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {uploadError && (
          <div className="rounded-2xl p-4 text-xs text-center font-medium glass border-rose-500/30 text-rose-600">
            ⚠️ {uploadError}
          </div>
        )}

        {taki.message && (
          <div className="relative glass-card p-5">
            <div className="absolute -top-3 left-6 px-3 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-widest glass"
              style={{ color: 'var(--accent)' }}>
              💌 Özel Mesaj
            </div>
            <p className="text-sm leading-relaxed italic font-serif pt-1 text-center" style={{ color: 'var(--text2)' }}>
              "{taki.message}"
            </p>
          </div>
        )}

        <p className="text-center text-[10px] font-bold tracking-[0.25em] uppercase font-sans" style={{ color: 'var(--text3)' }}>
          ✦ NFC Takı Anı Portalı
        </p>
      </div>
    </main>
  );
}


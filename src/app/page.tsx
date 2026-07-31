import Link from 'next/link';

export default function Home() {
  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center px-4 py-16 sm:py-24 overflow-hidden selection:bg-rose-500 selection:text-white" style={{ background: 'var(--bg)' }}>
      {/* Dynamic Animated Ambient Blobs */}
      <div className="blob animate-glow-pulse" style={{ width: 420, height: 420, background: 'var(--accent)', top: '2%', left: '-8%', opacity: 0.15 }} />
      <div className="blob animate-float-slow" style={{ width: 380, height: 380, background: 'var(--accent-rose)', bottom: '5%', right: '-6%', opacity: 0.12 }} />
      <div className="blob animate-float" style={{ width: 280, height: 280, background: 'var(--accent-gold)', top: '45%', left: '50%', transform: 'translate(-50%, -50%)', opacity: 0.08 }} />

      <main className="relative z-10 w-full max-w-4xl flex flex-col items-center text-center gap-14 animate-fade-up">

        {/* Top Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass text-xs font-bold tracking-widest uppercase transition-all hover:scale-105" style={{ color: 'var(--accent-rose)', border: '1px solid var(--border)' }}>
          <span className="animate-pulse">✦</span> PREMİUM DİJİTAL ANI PORTALI
        </div>

        {/* Hero Section */}
        <div className="flex flex-col items-center gap-6">
          <div className="relative group cursor-pointer">
            {/* Dual Pulse Rings */}
            <div className="absolute -inset-3 rounded-full animate-float opacity-30 blur-md transition-all group-hover:opacity-60" style={{ background: 'var(--accent-gradient)' }} />
            <div className="relative w-28 h-28 rounded-3xl flex items-center justify-center text-6xl glass-card transition-transform duration-500 group-hover:scale-110">
              <span className="filter drop-shadow-lg animate-float">💎</span>
            </div>
          </div>

          <div className="space-y-4 max-w-2xl">
            <h1 className="text-5xl sm:text-7xl font-extrabold tracking-tight font-serif shimmer-text leading-tight">
              NFC Takı Anı Portalı
            </h1>
            <p className="text-base sm:text-lg leading-relaxed font-sans" style={{ color: 'var(--text2)' }}>
              Sevdiklerinize hediye ettiğiniz özel takının içinde dijital anılar saklayın. 
              NFC etiketi veya QR kod ile telefonunuzu yakınlaştırın, unutulmaz fotoğraflar, videolar ve sesler anında açılsın.
            </p>
          </div>
        </div>

        {/* Action Buttons (CTA) */}
        <div className="flex flex-col sm:flex-row gap-4 w-full max-w-md">
          <Link
            href="/admin"
            className="group flex-1 py-4 px-6 rounded-2xl text-sm font-bold tracking-wide transition-all duration-300 active:scale-95 text-center hover-lift flex items-center justify-center gap-2"
            style={{
              background: 'var(--accent-gradient)',
              color: '#ffffff',
              boxShadow: '0 10px 30px -8px rgba(233, 30, 99, 0.4)',
            }}
          >
            <span>🛠 Yönetim Paneli</span>
            <span className="transition-transform group-hover:translate-x-1">→</span>
          </Link>
          <Link
            href="/taki/demo"
            className="flex-1 py-4 px-6 rounded-2xl text-sm font-bold tracking-wide transition-all duration-300 active:scale-95 text-center hover-lift glass flex items-center justify-center gap-2"
            style={{ color: 'var(--text)' }}
          >
            <span>👁 Örnek Portal Demo</span>
          </Link>
        </div>

        {/* How It Works Section */}
        <div className="w-full pt-6 space-y-8">
          <div className="flex items-center justify-center gap-3">
            <div className="h-[1px] w-12" style={{ background: 'var(--border)' }} />
            <h2 className="text-xs font-bold uppercase tracking-[0.3em] font-sans" style={{ color: 'var(--text3)' }}>
              Üç Adımda Büyülü Deneyim
            </h2>
            <div className="h-[1px] w-12" style={{ background: 'var(--border)' }} />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {[
              { step: '01', icon: '✨', title: 'Takıyı Tanımla', desc: 'Yönetim panelinden takınıza isim verin, duygusal mesajınızı ve fotoğraflarınızı ekleyin.' },
              { step: '02', icon: '📡', title: 'NFC Etiketi Yaz', desc: 'Takıya gömülü NFC etiketinize veya QR koda özel portal bağlantınızı aktarın.' },
              { step: '03', icon: '🎁', title: 'Dokundur & Yaşa', desc: 'Akıllı telefonu takıya dokundurun, sürpriz müzik ve medya galerisi anında açılsın.' },
            ].map((s) => (
              <div
                key={s.step}
                className="relative glass-card p-6 text-left hover-lift flex flex-col justify-between overflow-hidden group"
              >
                <div
                  className="absolute top-0 right-0 w-24 h-24 rounded-full filter blur-2xl opacity-10 transition-opacity group-hover:opacity-25"
                  style={{ background: 'var(--accent-gradient)' }}
                />
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-3xl p-2 rounded-2xl glass inline-block">{s.icon}</span>
                    <span className="text-2xl font-extrabold font-serif gold-text opacity-70 group-hover:opacity-100 transition-opacity">
                      {s.step}
                    </span>
                  </div>
                  <h3 className="text-base font-bold mb-2 font-serif" style={{ color: 'var(--text)' }}>
                    {s.title}
                  </h3>
                  <p className="text-xs leading-relaxed font-sans" style={{ color: 'var(--text2)' }}>
                    {s.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Features Showcase */}
        <div className="w-full pt-4 space-y-6">
          <h2 className="text-xs font-bold uppercase tracking-[0.3em] font-sans" style={{ color: 'var(--text3)' }}>
            Öne Çıkan Ayrıcalıklar
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { icon: '📸', title: 'HD Foto & Video', desc: 'Yüksek çözünürlüklü medya galerisi' },
              { icon: '💌', title: 'Kişisel Mesaj', desc: 'Özel yazılı notlar ve anılar' },
              { icon: '🎵', title: 'Fon Müziği', desc: 'Sevdiklerinize özel melodiler' },
              { icon: '🎉', title: 'Kutlama Efekti', desc: 'İnteraktif konfeti animasyonları' },
            ].map((f) => (
              <div
                key={f.title}
                className="glass-card p-5 text-center hover-lift flex flex-col items-center justify-center gap-2 group"
              >
                <div className="text-3xl transition-transform duration-300 group-hover:scale-125">{f.icon}</div>
                <p className="text-xs font-bold font-serif" style={{ color: 'var(--text)' }}>{f.title}</p>
                <p className="text-[11px]" style={{ color: 'var(--text2)' }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="pt-10 flex flex-col items-center gap-3 border-t w-full" style={{ borderColor: 'var(--border)' }}>
          <div className="flex items-center gap-2">
            <span className="text-xl">💎</span>
            <p className="text-sm font-bold font-serif gold-text">NFC Takı Anı Portalı</p>
          </div>
          <p className="text-[11px] tracking-[0.25em] uppercase font-sans" style={{ color: 'var(--text3)' }}>
            Sonsuz Anılar &nbsp;•&nbsp; Değerli Dokunuşlar
          </p>
        </div>
      </main>
    </div>
  );
}
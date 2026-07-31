'use client';

import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import QRCode from 'qrcode';

interface Jewelry {
  id: string;
  nfc_tag_id: string;
  title: string;
  recipient_name: string;
  message: string;
  media_url: string;
  is_active: boolean;
}

interface MediaItem {
  id: string;
  url: string;
  media_type: string;
  order_index: number;
}

const inp = "w-full px-4 py-2.5 rounded-xl text-sm font-medium outline-none transition-all duration-200";
const inpStyle = { background: 'var(--surface2)', border: '1px solid var(--border)', color: 'var(--text)' };

const PRESET_TITLES = [
  { emoji: '💍', label: 'Evlilik Teklifi', value: 'Evlilik Teklifim ❤️' },
  { emoji: '💑', label: 'Yıl Dönümü', value: 'Yıl Dönümümüz 🥂' },
  { emoji: '🌍', label: 'Tatil Anısı', value: 'Tatil Anımız ✈️' },
  { emoji: '🎂', label: 'Doğum Günü', value: 'Doğum Günün Kutlu Olsun 🎂' },
  { emoji: '💝', label: 'Sevgiliye', value: 'Seni Seviyorum 💝' },
  { emoji: '👨‍👩‍👧', label: 'Aile Anısı', value: 'Aile Anımız 👨‍👩‍👧' },
  { emoji: '🎓', label: 'Mezuniyet', value: 'Mezuniyet Gururu 🎓' },
  { emoji: '🌸', label: 'Anneler Günü', value: 'Anneme Özel 🌸' },
  { emoji: '👨‍👧', label: 'Babalar Günü', value: 'Babama Özel 👨‍👧' },
  { emoji: '✨', label: 'Özel An', value: 'Bizim Özel Anımız ✨' },
  { emoji: '🤝', label: 'Arkadaşlık', value: 'En Güzel Arkadaşlığımız 🤝' },
  { emoji: '🎉', label: 'Kutlama', value: 'Unutulmaz Kutlamamız 🎉' },
  { emoji: '🐾', label: 'Dostluk', value: 'Birlikte Büyüdük 🐾' },
  { emoji: '🏡', label: 'Yuva', value: 'Yuva Kurduğumuz Gün 🏡' },
  { emoji: '💫', label: 'İlk Tanışma', value: 'İlk Tanıştığımız Gün 💫' },
];

const PRESET_MESSAGES = [
  {
    category: '💍 Evlilik & Aşk',
    items: [
      'Seninle geçirdiğim her an, hayatımın en değerli hazinesi. Seni sonsuza kadar seviyorum.',
      'Bu takıyı taktığında bil ki; kalbim hep seninle, her adımında yanındayım.',
      'Seninle tanıştığım gün hayatım değişti. Bu an, o mucizelin en güzel hatırası.',
      'Evlenme teklif ettiğim o anı unutma. O gün, hayatımın en güzel günüydü.',
      'Binlerce insan arasından seni seçerdim, her seferinde, her hayatta.',
      'Seninle olmak; güneşli bir sabah, sıcak bir kucak ve huzur demek.',
      'Birlikte yaşlanmak istiyorum. Bu anlar, o uzun yolculuğun ilk adımları.',
      'Sen benim için her şeysin. Bu fotoğraflar, seninle geçirdiğim en mutlu anların kanıtı.',
      'Sevmek bazen sözcüklere sığmıyor; işte bu yüzden bu anıları sonsuza sakladım.',
      'Kalbim seninle dolduğunda, dünya çok daha güzel görünüyor. Seni seviyorum.',
    ],
  },
  {
    category: '🌍 Tatil & Seyahat',
    items: [
      'Bu fotoğraflar sadece anlar değil — seninle paylaştığım en güzel maceralar.',
      'Dünyanın her köşesi güzel, ama sen yanımdayken her yer cennet gibi hissettiriyor.',
      'Bu tatilde yaşadıklarımız, ömür boyu taşıyacağımız en değerli anılar oldu.',
      'Yolculuk güzel; ama asıl güzellik yol arkadaşında. Seninle her yol ayrıcalık.',
      'Bu manzaralar gözlerimde kaldı, ama en güzel manzara hep yanımdaki sendin.',
      'Bavullarımızı değil, anılarımızı biriktirdik. Ve bu en güzeliydi.',
      'Her seyahat bize yeni bir hikâye kattı. Bu takı, o hikâyenin simgesi.',
      'Yollar biter, şehirler değişir; ama seninle paylaştığım her an sonsuza taşınır.',
      'Haritada bir nokta değil, kalpte bir iz bıraktık bu seferinde.',
      'Birlikte keşfettik, birlikte güldük. Bu anlar şimdi de seninle yürüyor.',
    ],
  },
  {
    category: '🎂 Doğum Günü',
    items: [
      'Bugün senin günün! Her yaşın yeni bir macera, yeni bir güzellik getirsin.',
      'Doğduğun gün dünyam güzelleşti. Nice mutlu yıllara, sevinçlere dolu bir hayat diliyorum.',
      'Her geçen yıl seni daha çok seviyorum. Bu anılar bunun en güzel kanıtı.',
      'Doğum günün, seni tanımanın ve seninle büyümenin en güzel bahanes oldu hep.',
      'Kaç yaşına girersen gir, gözlerimde hep aynı güzel insansın. İyi ki varsın.',
      'Bu gün seni kutlamak için değil; seninle olmak, seni hissetmek için özel.',
      'Dilekler uçup gider ama bu anılar kalır. Sana en güzel anıları armağan ediyorum.',
      'Doğum günün kutlu olsun! Umarım bu fotoğraflar seni her baktığında gülümsetir.',
      'Bir yaş daha eklensin ömrüne, ama bu fotoğraflardaki gülüşün hiç değişmesin.',
      'Seninle geçirdiğim her doğum günü, hayatımın en güzel sayfalarından biri.',
    ],
  },
  {
    category: '🌸 Anne & Baba',
    items: [
      'Annem, her şeyim. Beni büyüten ellerin için ne kadar teşekkür etsem azdır.',
      'Babam, en büyük kahramanım. Bana kattığın her şey için sonsuz minnettarım.',
      'Sevgin, dünyada hissettiğim en güvenli liman. Seni çok seviyorum.',
      'Annem, sana yetişemezsem de; seni sevmekte kimseye bırakmam.',
      'Babam, bana güvendiğin için, hiç bırakmadığın için teşekkür ederim.',
      'Ellerini tuttuğumda büyüdüm, bakışlarınla güçlendim. Bu anlar sana armağan.',
      'Her sabah beni uyandıran ses senindi. O ses hâlâ kalbimde yaşıyor.',
      'Seni anlatmak için sözcükler yetmez. Ama bu anlar, sana olan sevgimin küçük bir yansıması.',
      'Anneler Günü her gün olsa bile yetmez. Ama bugün özellikle: seni çok seviyorum.',
      'Babama: Büyürken hep seni izledim. Ve her geçen gün sana daha çok benzemek istedim.',
    ],
  },
  {
    category: '🎓 Mezuniyet & Başarı',
    items: [
      'Bu anılar, emek verdiğin yılların en güzel meyvesi. Gurur duyuyorum senden.',
      'Hayatının bu özel anını ölümsüzleştirdik. Seninle olmak her zaman ayrıcalık.',
      'Birlikte güldük, birlikte büyüdük. Bu anlar her zaman kalbimde yaşayacak.',
      'Gece gündüz çalıştın, yorulmadan devam ettin. Bu başarı sana çok yakışıyor.',
      'Bugün bir kapı kapandı, ama önünde sonsuz bir ufuk açıldı. Gurur duyuyorum.',
      'Bu diploma sadece kâğıt değil — yılların, gözyaşlarının ve emeklerin belgesi.',
      'Hayallerinin peşinden gittin ve işte burada, tam istediğin yerde duruyorsun.',
      'Başarın benim için de bir ödül. Seninle gurur duymak ne büyük bir his.',
      'Bugünden itibaren her şey başlıyor. Ve sen buna hazırsın, her zaman hazırdın.',
      'Bu anılar yeni yolculuğunun ilk sayfası. En güzel bölümler henüz yazılmadı.',
    ],
  },
  {
    category: '🤝 Arkadaşlık & Dostluk',
    items: [
      'İyi arkadaş bulmak kısmet işi. Seni bulmak, hayatımın en güzel kısmetlerinden.',
      'Seninle gülmek başka, seninle ağlamak başka. Ama seninle olmak her zaman en iyisi.',
      'Yıllar geçse de, aralar açılsa da; bu anlar ve bu dostluk hep yerinde durur.',
      'En saçma anlarımda bile yanımda olduğun için teşekkür ederim.',
      'Arkadaşlık bazen bir söz, bazen bir sessizlik; seninle ikisi de mükemmel.',
      'Birlikte geçirdiğimiz her an bir hazine. Bu takı, o hazinelerin küçük bir parçası.',
      'En zor günlerde aramak istediğim ilk kişisin. Bu büyük bir şey.',
      'Bana inandığın, güldüğün ve durduğun için: seni çok seviyorum.',
      'Hayat koşturmacasında seninle durup nefes almak, her şeyden değerli.',
      'Bu anılar sadece fotoğraf değil — seninle yazılan en güzel hikâyenin sayfaları.',
    ],
  },
  {
    category: '🏡 Yuva & Yeni Başlangıçlar',
    items: [
      'Dört duvar değil, seninle her yer yuvaya döner. İlk günümüz ne güzeldi.',
      'Bu evin her köşesinde seninle bir hatıra var. Ve bu çok değerli.',
      'Birlikte inşa ettiğimiz hayat, hayal ettiğimden çok daha güzel oldu.',
      'Yeni bir sayfa, yeni bir ev, yeni bir başlangıç. Seninle her şey güzel.',
      'Kapıyı ilk açtığımız o anı unutmayacağım. O an, gerçek bir yuvanın başlangıcıydı.',
      'Eviniz, kalbiniz kadar sıcak olsun. Bu anlar, o sıcaklığın hatırası.',
      'Birlikte büyüyeceğimiz, güleceğimiz, dinleneceğimiz bir yuva. Ne büyük nimet.',
      'Bu duvarlar sadece beton değil — içinde taşıdığımız her anın şahidi.',
      'Aynı çatı altında aynı hayali paylaşmak: bu dünyada en güzel şey.',
      'Yeni eviniz kutlu olsun. Bu anlar, yeni başlangıcınızın ilk altın sayfaları.',
    ],
  },
  {
    category: '🐾 Evcil Hayvan Anısı',
    items: [
      'Minik patilerin, o sevgi dolu gözlerin ve sonsuz sadakatin hiç unutulmayacak. İyi ki yanımda oldun.',
      'Sen sadece bir hayvan değildin — ailemizin en sevilen, en masum üyesiydin.',
      'Her eve girişimde beni karşılayan sen, şimdi olmasan da varlığın hep hissediliyor.',
      'Seninle geçirdiğimiz her an; o oyunlar, o sarılmalar, o bakışlar — hepsi kalbimde yaşıyor.',
      'Köpeğim / kedim olduğu için değil; en sadık dostumuzu kaybettik. Ve bu çok ağır.',
      'Koşulsuz sevgini hiç unutmayacağım. İnsanlar bile öğrenemez bazen bunu — sen doğuştan biliyordun.',
      'Küçük patilerin büyük izler bıraktı. Her köşede, her seste seni arıyorum.',
      'Seninle geçirdiğimiz yıllar bir ömre bedeldi. Şimdi o anlar bu takıda yaşıyor.',
      'Gidişin çok ani oldu ama bıraktığın sevgi çok büyük. Seni çok sevdik, hep seveceğiz.',
      'Bir hayvan dostunu kaybetmek; onu anlayabilenlere söyleyebilirsin ancak. Bu acı gerçek ama bu sevgi daha gerçek.',
    ],
  },
  {
    category: '🕊️ Vefat & Huzurlu Anı',
    items: [
      'Aramızdan ayrıldın ama sevgin, gülen yüzün ve sıcacık varlığın hep kalbimizde yaşayacak.',
      'Gittin ama bıraktıkların kaldı — sevgin, öğrettiklerin ve o güzel anılar. Işıklar içinde uyu.',
      'Ölüm sadece bedeni alır; ama bir insanın ruhu sevenlerinde yaşamaya devam eder.',
      'Seni kaybetmek çok zor. Ama seninle geçirdiğimiz her an, ömür boyu en büyük hazinem olacak.',
      'Elveda demek istemedik. Ama bil ki; her güzel anımızda, her gülüşümüzde seninle birlikte olacağız.',
      'Hayat ne kadar kısa olursa olsun, seninle geçirdiğimiz zaman tam ve anlam doluydu.',
      'Gözlerini kapattığında yanındaydık. Ve sen hep kalbimizin en güzel köşesinde yaşayacaksın.',
      'Bu anılar, seni sevmenin ve sevilmenin en güzel kanıtı. Işığın hep parlasın.',
      'Bazı insanlar geçip gitmez — ruha işlerler. Sen de bize öyle işledin. Hep seninleyiz.',
      'Seni özlüyoruz, özlemeye devam edeceğiz. Ama bu anları taşımak, seni bir şekilde yanımda tutmak gibi.',
    ],
  },
  {
    category: '💫 İlk Anlar & Özel Günler',
    items: [
      'İlk tanıştığımız o an, hayatımın dönüm noktasıydı. Ve her şey o andan başladı.',
      'Bazı anlar fotoğrafa sığmaz; ama bu an öyle güzeldi ki denemeden edemedim.',
      'Bu gün sıradan bir gün değildi. Ve sen bu anı ölümsüz kıldın.',
      'Hayatımda bazı anlar var ki; gözlerimi kapatsam da görebiliyorum. Sen de onlardan birisin.',
      'Bu takı, sana verdiğim en büyük sözün simgesi: her zaman, her koşulda yanında olacağım.',
      'Bazı anlar kelimelerle anlatılamaz. Bu yüzden bu takıyı yaptım — her baktığında hissedebilesin.',
      'Bu an geçti ama bu his hiç geçmeyecek. Bunu sana taşıman için verdim.',
      'Seninle geçirdiğim her saniye, hayatıma renk katıyor. Bu anlar bunun kanıtı.',
      'Unutmak istemediğim her şey burada. Ve sen de bunların en başında geliyorsun.',
      'Bu takıya baktığında bil ki; o an sen gülümsüyordun ve ben de dünyayı kazanmış gibi hissettim.',
    ],
  },
];


export default function AdminDashboard() {
  const [jewelries, setJewelries] = useState<Jewelry[]>([]);
  const [loading, setLoading] = useState(true);
  const [nfcTagId, setNfcTagId] = useState('');
  const [title, setTitle] = useState('');
  const [recipientName, setRecipientName] = useState('');
  const [message, setMessage] = useState('');
  const [mediaUrl, setMediaUrl] = useState('');
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [activeUrlModal, setActiveUrlModal] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [activeMessageCategory, setActiveMessageCategory] = useState<string>(PRESET_MESSAGES[0]?.category || '');
  const [messageBoxOpen, setMessageBoxOpen] = useState(false);
  const [notification, setNotification] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const [activeMediaModal, setActiveMediaModal] = useState<Jewelry | null>(null);
  const [modalMedia, setModalMedia] = useState<MediaItem[]>([]);
  const [modalMediaLoading, setModalMediaLoading] = useState(false);
  const [modalUploading, setModalUploading] = useState(false);
  const mediaFileInputRef = useRef<HTMLInputElement>(null);
  const [nfcWriting, setNfcWriting] = useState(false);
  const [nfcStatus, setNfcStatus] = useState<'idle' | 'waiting' | 'success' | 'error'>('idle');
  const [nfcSupported, setNfcSupported] = useState<boolean | null>(null);
  const nfcAbortRef = useRef<AbortController | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const notify = (text: string, type: 'success' | 'error' = 'success') => {
    setNotification({ text, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const getOrigin = () => process.env.NEXT_PUBLIC_SITE_URL || window.location.origin;

  const checkNfcSupport = () => {
    setNfcSupported('NDEFReader' in window);
  };

  const handleNfcWrite = async (url: string) => {
    if (!('NDEFReader' in window)) {
      setNfcSupported(false);
      return;
    }
    try {
      setNfcWriting(true);
      setNfcStatus('waiting');
      const abort = new AbortController();
      nfcAbortRef.current = abort;
      const ndef = new (window as any).NDEFReader();
      await ndef.write(
        { records: [{ recordType: 'url', data: url }] },
        { signal: abort.signal }
      );
      setNfcStatus('success');
      notify('NFC etikete başarıyla yazıldı!');
    } catch (err: any) {
      if (err.name === 'AbortError') {
        setNfcStatus('idle');
      } else {
        setNfcStatus('error');
        notify('NFC yazma başarısız: ' + (err.message || 'Bilinmeyen hata'), 'error');
      }
    } finally {
      setNfcWriting(false);
      nfcAbortRef.current = null;
    }
  };

  const cancelNfcWrite = () => {
    nfcAbortRef.current?.abort();
    setNfcStatus('idle');
    setNfcWriting(false);
  };

  const fetchJewelries = async () => {
    setLoading(true);
    const { data, error } = await supabase.from('jewelries').select('*').order('created_at', { ascending: false });
    if (!error && data) setJewelries(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchJewelries();
    const channel = supabase.channel('jewelries-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'jewelries' }, (payload) => {
        if (payload.eventType === 'UPDATE') {
          setJewelries((prev) => prev.map((j) => j.id === (payload.new as Jewelry).id ? (payload.new as Jewelry) : j));
        } else if (payload.eventType === 'INSERT') {
          setJewelries((prev) => [payload.new as Jewelry, ...prev]);
        } else if (payload.eventType === 'DELETE') {
          setJewelries((prev) => prev.filter((j) => j.id !== (payload.old as Jewelry).id));
        }
      }).subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploading(true);
      if (!event.target.files || event.target.files.length === 0) return;
      const file = event.target.files[0];
      const formData = new FormData();
      formData.append('file', file);
      formData.append('jewelry_id', 'temp-' + Date.now());
      const uploadRes = await fetch('/api/upload-to-r2', { method: 'POST', body: formData });
      if (!uploadRes.ok) throw new Error('Yükleme başarısız');
      const { url } = await uploadRes.json();
      setMediaUrl(url);
      notify('Fotoğraf yüklendi!');
    } catch (error: any) {
      notify('Hata: ' + error.message, 'error');
    } finally {
      setUploading(false);
    }
  };

  const downloadQRCode = async (nfcTagId: string) => {
    try {
      const url = `${getOrigin()}/taki/${nfcTagId}`;
      const qrDataUrl = await QRCode.toDataURL(url, { width: 600, margin: 2, color: { dark: '#000000', light: '#ffffff' } });
      const a = document.createElement('a');
      a.href = qrDataUrl; a.download = `QR-${nfcTagId}.png`;
      document.body.appendChild(a); a.click(); document.body.removeChild(a);
    } catch (err) { notify('QR Kod oluşturulamadı.', 'error'); }
  };

  const handleCopyText = async (text: string) => {
    try { await navigator.clipboard.writeText(text); setCopied(true); }
    catch { notify('Kopyalama başarısız.', 'error'); }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nfcTagId || !title) return notify('NFC ID ve Başlık zorunludur!', 'error');
    setSaving(true);
    const { error } = await supabase.from('jewelries').insert([{ nfc_tag_id: nfcTagId, title, recipient_name: recipientName, message, media_url: mediaUrl }]);
    setSaving(false);
    if (error) { notify('Hata: ' + error.message, 'error'); }
    else {
      notify('NFC Takı başarıyla oluşturuldu!');
      setNfcTagId(''); setTitle(''); setRecipientName(''); setMessage(''); setMediaUrl('');
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleDeleteMedia = async (id: string, media_url: string) => {
    if (!confirm('Bu fotoğrafı/videoyu silmek istediğinize emin misiniz?')) return;
    const res = await fetch('/api/delete-media', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id, media_url }) });
    if (!res.ok) { const { error } = await res.json(); notify('Hata: ' + error, 'error'); }
    else notify('Medya silindi.');
  };

  const handleDelete = async (id: string, media_url: string) => {
    if (!confirm('Bu NFC takıyı tamamen silmek istediğinize emin misiniz?')) return;
    const res = await fetch('/api/delete-jewelry', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id, media_url }) });
    if (!res.ok) { const { error } = await res.json(); notify('Hata: ' + error, 'error'); }
    else notify('Takı silindi.');
  };

  const openMediaModal = (j: Jewelry) => {
    setActiveMediaModal(j);
    setModalMedia([]);
    setModalMediaLoading(true);
    fetch(`/api/get-media?jewelry_id=${j.id}`)
      .then((r) => r.json())
      .then((data) => { if (Array.isArray(data)) setModalMedia(data); })
      .catch(() => {})
      .finally(() => setModalMediaLoading(false));
  };

  const handleAddMediaItem = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!activeMediaModal || !event.target.files?.[0]) return;
    const file = event.target.files[0];
    setModalUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('jewelry_id', activeMediaModal.id);
      const uploadRes = await fetch('/api/upload-to-r2', { method: 'POST', body: formData });
      if (!uploadRes.ok) throw new Error('Yükleme başarısız');
      const { url } = await uploadRes.json();
      const mediaType = file.type.startsWith('video/') ? 'video' : 'image';
      const res = await fetch('/api/add-media', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jewelry_id: activeMediaModal.id, url, media_type: mediaType }),
      });
      if (!res.ok) throw new Error('Eklenemedi');
      const newItem = await res.json();
      setModalMedia((prev) => [...prev, newItem]);
      notify('Medya eklendi!');
    } catch (err: any) {
      notify('Hata: ' + err.message, 'error');
    } finally {
      setModalUploading(false);
      if (mediaFileInputRef.current) mediaFileInputRef.current.value = '';
    }
  };

  const handleDeleteMediaItem = async (item: MediaItem) => {
    if (!activeMediaModal) return;
    if (!confirm('Bu medyayı silmek istiyor musunuz?')) return;
    try {
      const deleteRes = await fetch('/api/delete-from-r2', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: item.url }),
      });
      if (!deleteRes.ok) throw new Error('R2 silme başarısız');
      const res = await fetch('/api/delete-media-item', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: item.id, url: item.url, jewelry_id: activeMediaModal.id }),
      });
      if (!res.ok) throw new Error('Veritabanı silme başarısız');
      setModalMedia((prev) => prev.filter((m) => m.id !== item.id));
      notify('Medya silindi.');
    } catch (err: any) {
      notify('Hata: ' + err.message, 'error');
    }
  };

  return (
    <main className="min-h-screen p-4 sm:p-8" style={{ background: 'var(--bg)' }}>
      <div className="max-w-5xl mx-auto space-y-6">

        {/* Bildirim toast */}
        {notification && (
          <div
            className="fixed top-4 left-1/2 -translate-x-1/2 z-50 px-5 py-3 rounded-2xl text-sm font-semibold shadow-xl animate-fade-up"
            style={{
              background: notification.type === 'success' ? 'var(--accent)' : '#be123c',
              color: '#fff',
            }}
          >
            {notification.type === 'success' ? '✓' : '⚠'} {notification.text}
          </div>
        )}

        {/* Başlık */}
        <div className="flex items-center justify-between pt-2">
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight" style={{ color: 'var(--text)' }}>
              NFC Takı Paneli
            </h1>
            <p className="text-sm mt-0.5" style={{ color: 'var(--text2)' }}>
              {jewelries.length} takı kayıtlı · Gerçek zamanlı
            </p>
          </div>
          <div className="w-10 h-10 rounded-2xl flex items-center justify-center text-xl"
            style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
            💎
          </div>
        </div>

        {/* Yeni Takı Formu */}
        <div className="rounded-2xl p-6" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
          <h2 className="text-base font-bold mb-5 flex items-center gap-2" style={{ color: 'var(--text)' }}>
            <span className="w-6 h-6 rounded-lg flex items-center justify-center text-xs"
              style={{ background: 'color-mix(in srgb, var(--accent) 15%, transparent)', color: 'var(--accent)' }}>+</span>
            Yeni Takı Ekle
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text2)' }}>NFC Tag ID *</label>
                <input type="text" placeholder="örn: taki-003" value={nfcTagId} onChange={(e) => setNfcTagId(e.target.value)}
                  className={inp} style={inpStyle} required />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text2)' }}>Başlık *</label>
                <input type="text" placeholder="örn: Tatil Anımız" value={title} onChange={(e) => setTitle(e.target.value)}
                  className={inp} style={inpStyle} required />
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {PRESET_TITLES.map((p) => (
                    <button key={p.value} type="button"
                      onClick={() => setTitle(p.value)}
                      className="text-[11px] font-semibold px-2.5 py-1 rounded-full transition-all duration-150 active:scale-95"
                      style={{
                        background: title === p.value ? 'color-mix(in srgb, var(--accent) 18%, transparent)' : 'var(--surface2)',
                        border: `1px solid ${title === p.value ? 'var(--accent)' : 'var(--border)'}`,
                        color: title === p.value ? 'var(--accent)' : 'var(--text2)',
                      }}>
                      {p.emoji} {p.label}
                    </button>
                  ))}
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text2)' }}>Alıcı Adı</label>
                <input type="text" placeholder="örn: Sevgilime" value={recipientName} onChange={(e) => setRecipientName(e.target.value)}
                  className={inp} style={inpStyle} />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text2)' }}>Fotoğraf / Video</label>
                <input ref={fileInputRef} type="file" accept="image/*,video/*" onChange={handleFileUpload} disabled={uploading}
                  className="w-full text-xs cursor-pointer file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:cursor-pointer"
                  style={{ color: 'var(--text2)' }} />
                {uploading && <p className="text-xs" style={{ color: 'var(--accent)' }}>Yükleniyor...</p>}
                {mediaUrl && <p className="text-xs text-green-600 font-medium">✓ Dosya yüklendi</p>}
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text2)' }}>Özel Mesaj</label>
              <div
                className="w-full rounded-2xl px-4 py-3 cursor-pointer transition-all duration-200"
                style={{
                  background: 'var(--surface2)',
                  border: `1px solid ${messageBoxOpen ? 'var(--accent)' : 'var(--border)'}`,
                  color: 'var(--text2)',
                }}
                onClick={() => setMessageBoxOpen((open) => !open)}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-sm text-left">
                    {message ? message : 'Bir kategori seçin ve içinden bir mesaj seçin...'}
                  </span>
                  <span className="text-xs font-bold" style={{ color: 'var(--text2)' }}>
                    {messageBoxOpen ? '˅' : '›'}
                  </span>
                </div>
              </div>

              {messageBoxOpen && (
                <div className="space-y-3 pt-3">
                  <div>
                    <label className="text-[10px] font-semibold uppercase tracking-[0.24em] mb-2 block" style={{ color: 'var(--text2)' }}>
                      Mesaj Kategorisi
                    </label>
                    <select
                      value={activeMessageCategory}
                      onChange={(e) => setActiveMessageCategory(e.target.value)}
                      className="w-full px-4 py-3 rounded-2xl text-sm font-medium outline-none"
                      style={{ background: 'var(--surface2)', border: '1px solid var(--border)', color: 'var(--text)' }}
                    >
                      {PRESET_MESSAGES.map((cat) => (
                        <option key={cat.category} value={cat.category}>{cat.category}</option>
                      ))}
                    </select>
                  </div>

                  <div className="rounded-2xl overflow-hidden border" style={{ borderColor: 'var(--border)' }}>
                    {PRESET_MESSAGES.filter((cat) => cat.category === activeMessageCategory).map((cat) => (
                      <div key={cat.category} className="space-y-2 p-3" style={{ background: 'var(--surface2)' }}>
                        <div className="text-[10px] uppercase tracking-[0.16em] font-bold" style={{ color: 'var(--text2)' }}>
                          {cat.category}
                        </div>
                        <div className="grid gap-2">
                          {cat.items.map((msg) => (
                            <button
                              key={msg}
                              type="button"
                              onClick={() => { setMessage(msg); setMessageBoxOpen(false); }}
                              className="text-left text-xs px-3 py-2 rounded-2xl transition-all duration-150 active:scale-[0.98]"
                              style={{
                                background: message === msg ? 'color-mix(in srgb, var(--accent) 12%, transparent)' : 'var(--surface)',
                                border: `1px solid ${message === msg ? 'var(--accent)' : 'var(--border)'}`,
                                color: message === msg ? 'var(--accent)' : 'var(--text2)',
                              }}
                            >
                              "{msg}"
                            </button>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="space-y-2 pt-3">
                    <div className="text-[10px] uppercase tracking-[0.24em] font-semibold" style={{ color: 'var(--text2)' }}>
                      Kendi mesajını yaz
                    </div>
                    <textarea
                      rows={4}
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Buraya kendi özel mesajını yazabilirsiniz..."
                      className={inp + ' resize-none'}
                      style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text)' }}
                    />
                  </div>
                </div>
              )}
            </div>
            <button type="submit" disabled={saving || uploading}
              className="w-full py-3 rounded-xl text-sm font-bold transition-all duration-200 disabled:opacity-50 active:scale-98"
              style={{ background: 'linear-gradient(135deg, var(--accent), var(--accent2))', color: '#fff' }}>
              {saving ? 'Kaydediliyor...' : '+ NFC Takıyı Kaydet'}
            </button>
          </form>
        </div>

        {/* Liste */}
        <div className="rounded-2xl overflow-hidden" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
          <div className="px-6 py-4 border-b flex items-center justify-between" style={{ borderColor: 'var(--border)' }}>
            <h2 className="text-base font-bold" style={{ color: 'var(--text)' }}>Kayıtlı Takılar</h2>
            <span className="text-xs font-bold px-2.5 py-1 rounded-full" style={{ background: 'var(--surface2)', color: 'var(--text2)' }}>
              {jewelries.length} adet
            </span>
          </div>

          {loading ? (
            <div className="p-12 text-center">
              <div className="w-8 h-8 rounded-full border-4 border-t-transparent animate-spin mx-auto"
                style={{ borderColor: 'var(--accent)', borderTopColor: 'transparent' }} />
            </div>
          ) : jewelries.length === 0 ? (
            <div className="p-12 text-center">
              <div className="text-4xl mb-3">📭</div>
              <p className="text-sm font-medium" style={{ color: 'var(--text2)' }}>Henüz hiç takı eklenmemiş.</p>
            </div>
          ) : (
            <div className="divide-y" style={{ borderColor: 'var(--border)' }}>
              {jewelries.map((j) => (
                <div key={j.id} className="flex items-center gap-4 px-6 py-4 transition-colors duration-150"
                  style={{ background: 'transparent' }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--surface2)')}
                  onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                >
                  {/* Küçük resim */}
                  <div className="w-12 h-12 rounded-xl overflow-hidden flex-shrink-0"
                    style={{ background: 'var(--surface2)', border: '1px solid var(--border)' }}>
                    {j.media_url ? (
                      <img src={j.media_url} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-lg">📷</div>
                    )}
                  </div>

                  {/* Bilgiler */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold truncate" style={{ color: 'var(--text)' }}>{j.title}</p>
                    <div className="flex items-center gap-3 mt-0.5 flex-wrap">
                      <span className="text-xs font-mono" style={{ color: 'var(--accent)' }}>{j.nfc_tag_id}</span>
                      {j.recipient_name && (
                        <span className="text-xs" style={{ color: 'var(--text2)' }}>→ {j.recipient_name}</span>
                      )}
                      {!j.media_url && (
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full" style={{ background: '#fef3c7', color: '#d97706' }}>
                          Medya Yok
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Aksiyonlar */}
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <a href={`/taki/${j.nfc_tag_id}`} target="_blank" rel="noreferrer"
                      className="text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors"
                      style={{ background: 'var(--surface2)', color: 'var(--text2)', border: '1px solid var(--border)' }}
                      title="Sayfayı aç">
                      ↗
                    </a>
                    <button onClick={() => { setActiveUrlModal(`${getOrigin()}/taki/${j.nfc_tag_id}`); setCopied(false); setNfcStatus('idle'); checkNfcSupport(); }}
                      className="text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors"
                      style={{ background: 'var(--surface2)', color: 'var(--text2)', border: '1px solid var(--border)' }}
                      title="NFC URL">
                      🔗
                    </button>
                    <button onClick={() => downloadQRCode(j.nfc_tag_id)}
                      className="text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors"
                      style={{ background: 'var(--surface2)', color: 'var(--text2)', border: '1px solid var(--border)' }}
                      title="QR İndir">
                      📥
                    </button>
                    <button onClick={() => { setActiveDropdown(null); openMediaModal(j); }}
                      className="text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors"
                      style={{ background: 'var(--surface2)', color: 'var(--text2)', border: '1px solid var(--border)' }}
                      title="Galeri Yönet">
                      🖼
                    </button>

                    {/* ··· menüsü */}
                    <div className="relative">
                      <button onClick={() => setActiveDropdown(activeDropdown === j.id ? null : j.id)}
                        className="w-8 h-8 flex items-center justify-center rounded-lg text-base font-black transition-colors"
                        style={{ background: activeDropdown === j.id ? 'var(--surface2)' : 'transparent', color: 'var(--text2)' }}>
                        ···
                      </button>
                      {activeDropdown === j.id && (
                        <>
                          <div className="fixed inset-0 z-10" onClick={() => setActiveDropdown(null)} />
                          <div className="absolute right-0 mt-1 w-44 rounded-xl shadow-xl z-20 overflow-hidden"
                            style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
                            {j.media_url && (
                              <button onClick={() => { setActiveDropdown(null); handleDeleteMedia(j.id, j.media_url); }}
                                className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm font-medium transition-colors text-left"
                                style={{ color: '#f97316' }}
                                onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--surface2)')}
                                onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}>
                                🗑 Medyayı Sil
                              </button>
                            )}
                            <button onClick={() => { setActiveDropdown(null); handleDelete(j.id, j.media_url); }}
                              className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm font-medium transition-colors text-left"
                              style={{ color: '#ef4444' }}
                              onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--surface2)')}
                              onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}>
                              🗑 Projeyi Sil
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Medya Galeri Modal */}
      {activeMediaModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(6px)' }}
          onClick={() => setActiveMediaModal(null)}>
          <div className="w-full max-w-lg rounded-2xl p-6 space-y-5 shadow-2xl max-h-[90vh] overflow-y-auto"
            style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
            onClick={(e) => e.stopPropagation()}>

            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="text-lg font-bold" style={{ color: 'var(--text)' }}>🖼 Galeri Yönetimi</h3>
                <p className="text-sm mt-0.5 font-medium truncate" style={{ color: 'var(--text2)' }}>
                  {activeMediaModal.title}
                </p>
              </div>
              <button onClick={() => setActiveMediaModal(null)}
                className="w-8 h-8 flex items-center justify-center rounded-xl text-lg transition-colors flex-shrink-0"
                style={{ background: 'var(--surface2)', color: 'var(--text2)' }}>
                ✕
              </button>
            </div>

            {modalMediaLoading ? (
              <div className="flex justify-center py-8">
                <div className="w-8 h-8 rounded-full border-4 border-t-transparent animate-spin"
                  style={{ borderColor: 'var(--accent)', borderTopColor: 'transparent' }} />
              </div>
            ) : modalMedia.length === 0 ? (
              <div className="rounded-2xl p-6 text-center" style={{ background: 'var(--surface2)', border: '1px solid var(--border)' }}>
                <div className="text-3xl mb-2">📭</div>
                <p className="text-sm font-medium" style={{ color: 'var(--text2)' }}>Henüz galeri medyası eklenmemiş.</p>
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-2">
                {modalMedia.map((item) => (
                  <div key={item.id} className="relative aspect-square rounded-xl overflow-hidden group"
                    style={{ border: '1px solid var(--border)' }}>
                    {item.media_type === 'video' ? (
                      <video src={item.url} className="w-full h-full object-cover" muted />
                    ) : (
                      <img src={item.url} alt="" className="w-full h-full object-cover" />
                    )}
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      style={{ background: 'rgba(0,0,0,0.5)' }}>
                      <button
                        onClick={() => handleDeleteMediaItem(item)}
                        className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold text-white"
                        style={{ background: '#ef4444' }}>
                        ✕
                      </button>
                    </div>
                    {item.media_type === 'video' && (
                      <div className="absolute top-1 left-1 text-xs px-1.5 py-0.5 rounded-full font-bold"
                        style={{ background: 'rgba(0,0,0,0.6)', color: 'white' }}>
                        ▶
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            <div>
              <input ref={mediaFileInputRef} type="file" accept="image/*,video/*" className="hidden" onChange={handleAddMediaItem} disabled={modalUploading} />
              <button
                onClick={() => !modalUploading && mediaFileInputRef.current?.click()}
                disabled={modalUploading}
                className="w-full py-3 rounded-xl text-sm font-bold transition-all duration-200 active:scale-98 flex items-center justify-center gap-2 disabled:opacity-50"
                style={{ background: 'linear-gradient(135deg, var(--accent), var(--accent2))', color: '#fff' }}>
                {modalUploading ? (
                  <>
                    <div className="w-4 h-4 rounded-full border-2 border-t-transparent animate-spin border-white" />
                    Yükleniyor...
                  </>
                ) : (
                  <>+ Yeni Medya Ekle</>
                )}
              </button>
              <p className="text-xs text-center mt-2" style={{ color: 'var(--text2)' }}>
                Fotoğraf veya video · Maks. 50 MB
              </p>
            </div>

            <div className="flex justify-between items-center pt-1">
              <span className="text-xs font-medium" style={{ color: 'var(--text2)' }}>
                {modalMedia.length} medya öğesi
              </span>
              <button onClick={() => setActiveMediaModal(null)}
                className="text-xs font-bold px-4 py-2 rounded-xl"
                style={{ background: 'var(--surface2)', color: 'var(--text2)', border: '1px solid var(--border)' }}>
                Kapat
              </button>
            </div>
          </div>
        </div>
      )}

      {/* NFC URL Modal */}
      {activeUrlModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(6px)' }}
          onClick={() => { cancelNfcWrite(); setActiveUrlModal(null); }}>
          <div className="w-full max-w-lg rounded-2xl p-6 space-y-5 shadow-2xl"
            style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
            onClick={(e) => e.stopPropagation()}>

            {/* Başlık */}
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="text-lg font-bold" style={{ color: 'var(--text)' }}>📡 NFC Etikete Yaz</h3>
                <p className="text-sm mt-1" style={{ color: 'var(--text2)' }}>
                  Yazılacak URL:
                </p>
              </div>
              <button onClick={() => { cancelNfcWrite(); setActiveUrlModal(null); }}
                className="w-8 h-8 flex items-center justify-center rounded-xl text-lg transition-colors"
                style={{ background: 'var(--surface2)', color: 'var(--text2)' }}>
                ✕
              </button>
            </div>

            {/* URL kutusu */}
            <input type="text" readOnly value={activeUrlModal}
              onClick={(e) => (e.target as HTMLInputElement).select()}
              className="w-full px-4 py-3 rounded-xl font-mono text-sm outline-none"
              style={{ background: 'var(--surface2)', border: '1px solid var(--border)', color: 'var(--text)' }} />

            {/* Web NFC butonu (Android Chrome) */}
            {nfcSupported !== false && (
              <div className="rounded-2xl p-5 space-y-4" style={{ background: 'var(--surface2)', border: '1px solid var(--border)' }}>
                <div className="flex items-center gap-2">
                  <span className="text-lg">📱</span>
                  <div>
                    <p className="text-sm font-bold" style={{ color: 'var(--text)' }}>Direkt NFC Yazma</p>
                    <p className="text-xs" style={{ color: 'var(--text2)' }}>Android Chrome — etiketi hazır tutun</p>
                  </div>
                </div>

                {nfcStatus === 'waiting' ? (
                  <div className="space-y-3">
                    <div className="flex items-center justify-center gap-3 py-4 rounded-xl"
                      style={{ background: 'color-mix(in srgb, var(--accent) 10%, transparent)', border: '1px dashed var(--accent)' }}>
                      <div className="w-5 h-5 rounded-full border-2 border-t-transparent animate-spin flex-shrink-0"
                        style={{ borderColor: 'var(--accent)', borderTopColor: 'transparent' }} />
                      <p className="text-sm font-semibold" style={{ color: 'var(--accent)' }}>
                        NFC etiketi yaklaştırın...
                      </p>
                    </div>
                    <button onClick={cancelNfcWrite}
                      className="w-full py-2.5 rounded-xl text-sm font-bold transition-all"
                      style={{ background: 'var(--surface)', color: 'var(--text2)', border: '1px solid var(--border)' }}>
                      İptal
                    </button>
                  </div>
                ) : nfcStatus === 'success' ? (
                  <div className="flex items-center justify-center gap-2 py-4 rounded-xl"
                    style={{ background: '#f0fdf4', border: '1px solid #86efac' }}>
                    <span className="text-xl">✅</span>
                    <p className="text-sm font-bold text-green-700">NFC etiket başarıyla yazıldı!</p>
                  </div>
                ) : (
                  <button onClick={() => handleNfcWrite(activeUrlModal)}
                    className="w-full py-3 rounded-xl text-sm font-bold transition-all active:scale-98 flex items-center justify-center gap-2"
                    style={{ background: 'linear-gradient(135deg, var(--accent), var(--accent2))', color: '#fff' }}>
                    <span>📡</span> NFC Etikete Yaz
                  </button>
                )}
              </div>
            )}

            {/* iOS / desteklenmiyor uyarısı */}
            {nfcSupported === false && (
              <div className="rounded-xl p-4 text-sm" style={{ background: '#fef3c7', border: '1px solid #fde68a', color: '#92400e' }}>
                <p className="font-bold mb-1">⚠️ Tarayıcınız Web NFC desteklemiyor</p>
                <p className="text-xs">Web NFC sadece <strong>Android + Chrome</strong>'da çalışır. iPhone kullanıyorsanız aşağıdaki manuel yöntemi kullanın.</p>
              </div>
            )}

            {/* Kopyala butonu */}
            <div className="flex gap-3">
              <button onClick={() => handleCopyText(activeUrlModal)}
                className="flex-1 py-2.5 rounded-xl text-sm font-bold transition-all active:scale-98"
                style={{ background: 'var(--surface2)', color: 'var(--text)', border: '1px solid var(--border)' }}>
                {copied ? '✓ Kopyalandı' : '📋 URL Kopyala'}
              </button>
              <button onClick={() => { cancelNfcWrite(); setActiveUrlModal(null); }}
                className="px-5 py-2.5 rounded-xl text-sm font-bold"
                style={{ background: 'var(--surface2)', color: 'var(--text2)', border: '1px solid var(--border)' }}>
                Kapat
              </button>
            </div>

            {/* Manuel yöntem */}
            <details className="rounded-xl overflow-hidden" style={{ border: '1px solid var(--border)' }}>
              <summary className="px-4 py-3 text-xs font-bold cursor-pointer select-none"
                style={{ background: 'var(--surface2)', color: 'var(--text2)' }}>
                Manuel yöntem (NFC Tools uygulaması)
              </summary>
              <div className="px-4 py-3 text-xs space-y-1" style={{ color: 'var(--text2)' }}>
                <p>1. URL'yi kopyala.</p>
                <p>2. NFC Tools uygulamasında <strong>Write → Add record → URL</strong> seçin.</p>
                <p>3. Yapıştır ve NFC çipe yaz.</p>
              </div>
            </details>
          </div>
        </div>
      )}
    </main>
  );
}

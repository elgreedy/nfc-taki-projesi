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

const inp = "w-full px-4 py-3 rounded-2xl text-sm font-medium outline-none transition-all duration-200 font-sans";
const inpStyle = {
  background: 'var(--surface-solid)',
  border: '1px solid var(--border)',
  color: 'var(--text)',
  boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.35)',
};

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
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'with-media' | 'no-media'>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [nfcTagId, setNfcTagId] = useState('');
  const [title, setTitle] = useState('');
  const [recipientName, setRecipientName] = useState('');
  const [message, setMessage] = useState('');
  const [mediaUrl, setMediaUrl] = useState('');
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [activeUrlModal, setActiveUrlModal] = useState<string | null>(null);
  const [activeUrlModalMode, setActiveUrlModalMode] = useState<'share' | 'edit'>('share');
  const [activeUrlModalNfcTagId, setActiveUrlModalNfcTagId] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [activeMessageCategory, setActiveMessageCategory] = useState<string>(PRESET_MESSAGES[0]?.category || '');
  const [messageBoxOpen, setMessageBoxOpen] = useState(false);
  const [notification, setNotification] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const [activeMediaModal, setActiveMediaModal] = useState<Jewelry | null>(null);
  const [modalMedia, setModalMedia] = useState<MediaItem[]>([]);
  const [modalMediaLoading, setModalMediaLoading] = useState(false);
  const [modalUploading, setModalUploading] = useState(false);
  const [previewMedia, setPreviewMedia] = useState<MediaItem | null>(null);
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

  const totalTakis = jewelries.length;
  const totalWithMedia = jewelries.filter((j) => !!j.media_url).length;
  const totalWithoutMedia = totalTakis - totalWithMedia;

  const getOrigin = () => process.env.NEXT_PUBLIC_SITE_URL || window.location.origin;

  const openUrlModal = (jewelry: Jewelry, mode: 'share' | 'edit' = 'share') => {
    const link = `${getOrigin()}/taki/${jewelry.nfc_tag_id}${mode === 'edit' ? '?edit=true' : ''}`;
    setActiveUrlModal(link);
    setActiveUrlModalMode(mode);
    setActiveUrlModalNfcTagId(jewelry.nfc_tag_id);
    setCopied(false);
    setNfcStatus('idle');
    checkNfcSupport();
  };

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
    else {
      setJewelries((prev) => prev.map((j) => (j.id === id ? { ...j, media_url: '' } : j)));
      notify('Medya silindi.');
    }
  };

  const handleDelete = async (id: string, media_url: string) => {
    if (!confirm('Bu NFC takıyı tamamen silmek istediğinize emin misiniz?')) return;
    const res = await fetch('/api/delete-jewelry', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id, media_url }) });
    if (!res.ok) { const { error } = await res.json(); notify('Hata: ' + error, 'error'); }
    else {
      setJewelries((prev) => prev.filter((j) => j.id !== id));
      notify('Takı silindi.');
    }
  };

  const scrollToCreateForm = () => {
    document.getElementById('new-jewelry-form')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const openMediaModal = (j: Jewelry) => {
    setActiveMediaModal(j);
    setPreviewMedia(null);
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
      setJewelries((prev) => prev.map((j) => (j.id === activeMediaModal.id ? { ...j, media_url: j.media_url || newItem.url } : j)));
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
      const res = await fetch('/api/delete-media-item', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: item.id, url: item.url, jewelry_id: activeMediaModal.id }),
      });
      if (!res.ok) throw new Error('Silme başarısız');
      const remainingMedia = modalMedia.filter((m) => m.id !== item.id);
      setModalMedia(remainingMedia);
      setJewelries((prev) => prev.map((j) => (j.id === activeMediaModal.id ? { ...j, media_url: remainingMedia[0]?.url || '' } : j)));
      setPreviewMedia((prev) => (prev?.id === item.id ? null : prev));
      notify('Medya silindi.');
    } catch (err: any) {
      notify('Hata: ' + err.message, 'error');
    }
  };

  const handleSetCoverMedia = async (item: MediaItem) => {
    if (!activeMediaModal) return;
    try {
      const res = await fetch('/api/update-media', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: activeMediaModal.id, media_url: item.url }),
      });
      if (!res.ok) throw new Error('Kapak güncellenemedi');
      setJewelries((prev) => prev.map((j) => (j.id === activeMediaModal.id ? { ...j, media_url: item.url } : j)));
      notify('Kapak medya güncellendi.');
    } catch (err: any) {
      notify('Hata: ' + err.message, 'error');
    }
  };

  return (
    <main className="min-h-screen p-4 sm:p-8" style={{ background: 'var(--bg)' }}>
      <div className="max-w-7xl mx-auto space-y-8">

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

        {/* Başlık ve İstatistikler */}
        <div className="space-y-4">
          <div className="rounded-2xl border p-5 sm:p-6" style={{ background: 'var(--surface-solid)', borderColor: 'var(--border)' }}>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.24em]" style={{ color: 'var(--text3)' }}>Yönetim paneli</p>
                <h1 className="text-2xl sm:text-3xl font-semibold mt-1" style={{ color: 'var(--text)' }}>
                  NFC Takı Yönetimi
                </h1>
                <p className="text-sm mt-2 max-w-2xl" style={{ color: 'var(--text2)' }}>
                  Takıları ekleyin, medya ekleyin ve bağlantıları yönetin.
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={async () => {
                    await fetch('/api/admin/logout', { method: 'POST' });
                    window.location.href = '/admin/login';
                  }}
                  className="rounded-xl border px-4 py-2 text-sm font-medium transition-colors"
                  style={{ borderColor: 'var(--border)', background: 'var(--surface2)', color: 'var(--text)' }}
                >
                  Çıkış
                </button>
                <button
                  type="button"
                  onClick={scrollToCreateForm}
                  className="rounded-xl border px-4 py-2 text-sm font-medium transition-colors"
                  style={{ borderColor: 'var(--border)', background: 'var(--surface2)', color: 'var(--text)' }}
                >
                  + Yeni Takı Ekle
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode((prev) => (prev === 'grid' ? 'list' : 'grid'))}
                  className="rounded-xl border px-4 py-2 text-sm font-medium"
                  style={{ borderColor: 'var(--border)', background: 'var(--surface-solid)', color: 'var(--text)' }}
                >
                  {viewMode === 'grid' ? '☰ Liste' : '▦ Kart'}
                </button>
              </div>
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-3">
              <div className="rounded-xl border p-4" style={{ borderColor: 'var(--border)', background: 'var(--surface2)' }}>
                <p className="text-[11px] font-semibold uppercase tracking-[0.2em]" style={{ color: 'var(--text3)' }}>Toplam Takı</p>
                <p className="text-2xl font-semibold mt-2" style={{ color: 'var(--text)' }}>{totalTakis}</p>
              </div>
              <div className="rounded-xl border p-4" style={{ borderColor: 'var(--border)', background: 'var(--surface2)' }}>
                <p className="text-[11px] font-semibold uppercase tracking-[0.2em]" style={{ color: 'var(--text3)' }}>Medya Ekli</p>
                <p className="text-2xl font-semibold mt-2" style={{ color: 'var(--text)' }}>{totalWithMedia}</p>
              </div>
              <div className="rounded-xl border p-4" style={{ borderColor: 'var(--border)', background: 'var(--surface2)' }}>
                <p className="text-[11px] font-semibold uppercase tracking-[0.2em]" style={{ color: 'var(--text3)' }}>Medya Eksik</p>
                <p className="text-2xl font-semibold mt-2" style={{ color: 'var(--text)' }}>{totalWithoutMedia}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Yeni Takı Formu */}
        <div id="new-jewelry-form" className="rounded-[28px] border p-5 sm:p-7 space-y-6" style={{ background: 'linear-gradient(180deg, var(--surface-solid) 0%, var(--surface2) 100%)', borderColor: 'var(--border)' }}>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.24em]" style={{ borderColor: 'var(--border)', background: 'var(--surface-solid)', color: 'var(--text2)' }}>
                <span className="text-sm">✦</span> Yeni kayıt
              </div>
              <h2 className="mt-3 text-xl font-semibold" style={{ color: 'var(--text)' }}>
                Yeni Takı & Anı Oluştur
              </h2>
              <p className="mt-1 text-sm" style={{ color: 'var(--text2)' }}>
                NFC kimliği, başlık, mesaj ve medya bilgilerini tek blokta doldurun.
              </p>
            </div>
            <div className="rounded-2xl border p-3 text-sm max-w-sm" style={{ borderColor: 'var(--border)', background: 'var(--surface-solid)', color: 'var(--text2)' }}>
              <div className="font-medium" style={{ color: 'var(--text)' }}>İpucu</div>
              <div className="mt-1 text-xs leading-relaxed">Başlık ve mesaj şablonlarını kullanarak kaydı hızlıca tamamlayabilirsiniz.</div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-[1.05fr_0.95fr] gap-6">
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-[0.2em]" style={{ color: 'var(--text2)' }}>NFC Tag ID *</label>
                    <input type="text" placeholder="örn: taki-003" value={nfcTagId} onChange={(e) => setNfcTagId(e.target.value)}
                      className={inp} style={inpStyle} required />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-[0.2em]" style={{ color: 'var(--text2)' }}>Takı Başlığı *</label>
                    <input type="text" placeholder="örn: Tatil Anımız" value={title} onChange={(e) => setTitle(e.target.value)}
                      className={inp} style={inpStyle} required />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-[0.2em]" style={{ color: 'var(--text2)' }}>Alıcı Adı</label>
                  <input type="text" placeholder="örn: Sevgilime" value={recipientName} onChange={(e) => setRecipientName(e.target.value)}
                    className={inp} style={inpStyle} />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-[0.2em]" style={{ color: 'var(--text2)' }}>Hızlı Başlık Seçimi</label>
                  <div className="flex flex-wrap gap-2">
                    {PRESET_TITLES.map((p) => (
                      <button key={p.value} type="button"
                        onClick={() => setTitle(p.value)}
                        className="text-[11px] font-semibold px-3 py-1.5 rounded-full transition-all duration-150 active:scale-95 border"
                        style={{
                          borderColor: title === p.value ? 'var(--accent)' : 'var(--border)',
                          background: title === p.value ? 'var(--surface-solid)' : 'var(--surface2)',
                          color: title === p.value ? 'var(--accent)' : 'var(--text2)',
                        }}>
                        {p.emoji} {p.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-[0.2em]" style={{ color: 'var(--text2)' }}>Kapak Fotoğrafı / Video</label>
                  <div className="rounded-2xl border border-dashed p-4" style={{ borderColor: 'var(--border)', background: 'var(--surface-solid)' }}>
                    <input ref={fileInputRef} type="file" accept="image/*,video/*" onChange={handleFileUpload} disabled={uploading}
                      className="w-full text-xs cursor-pointer file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:cursor-pointer"
                      style={{ color: 'var(--text2)' }} />
                    {uploading && <p className="mt-3 text-xs font-medium" style={{ color: 'var(--text2)' }}>Yükleniyor...</p>}
                    {mediaUrl && (
                      <div className="mt-3 flex items-center gap-3 rounded-2xl border p-2.5" style={{ borderColor: 'var(--border)', background: 'var(--surface2)' }}>
                        <div className="w-12 h-12 rounded-xl overflow-hidden flex-shrink-0 relative">
                          {/\.(mp4|webm|ogg|mov)(\?|$)/i.test(mediaUrl) ? (
                            <video src={mediaUrl} className="w-full h-full object-cover" muted />
                          ) : (
                            <img src={mediaUrl} alt="Preview" className="w-full h-full object-cover" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold" style={{ color: 'var(--text)' }}>✓ Medya Yüklendi</p>
                          <p className="text-[10px] truncate font-mono mt-1" style={{ color: 'var(--text2)' }}>{mediaUrl.split('/').pop()}</p>
                        </div>
                        <button type="button" onClick={() => { setMediaUrl(''); if (fileInputRef.current) fileInputRef.current.value = ''; }}
                          className="text-xs px-2.5 py-1 rounded-xl border transition-colors flex-shrink-0" style={{ borderColor: 'var(--border)', color: 'var(--text2)' }}>
                          ✕
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-[0.2em]" style={{ color: 'var(--text2)' }}>Özel Anı Mesajı</label>
                  <div
                    className="w-full rounded-2xl border px-4 py-3 cursor-pointer transition-all duration-200"
                    style={{
                      borderColor: messageBoxOpen ? 'var(--accent)' : 'var(--border)',
                      background: 'var(--surface-solid)',
                      color: 'var(--text2)',
                    }}
                    onClick={() => setMessageBoxOpen((open) => !open)}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-sm text-left italic font-serif">
                        {message ? `"${message}"` : 'Hazır mesajlar ve özel not ekleyin...'}
                      </span>
                      <span className="text-xs font-bold" style={{ color: 'var(--text2)' }}>
                        {messageBoxOpen ? '▲' : '▼'}
                      </span>
                    </div>
                  </div>

                  {messageBoxOpen && (
                    <div className="space-y-4 rounded-2xl border p-3" style={{ borderColor: 'var(--border)', background: 'var(--surface-solid)' }}>
                      <div>
                        <label className="text-[10px] font-bold uppercase tracking-[0.24em] mb-2 block" style={{ color: 'var(--text3)' }}>
                          Mesaj Kategorisi
                        </label>
                        <select
                          value={activeMessageCategory}
                          onChange={(e) => setActiveMessageCategory(e.target.value)}
                          className="w-full px-4 py-3 rounded-2xl text-sm font-medium outline-none border"
                          style={{ color: 'var(--text)', background: 'var(--surface2)', borderColor: 'var(--border)' }}
                        >
                          {PRESET_MESSAGES.map((cat) => (
                            <option key={cat.category} value={cat.category}>{cat.category}</option>
                          ))}
                        </select>
                      </div>

                      <div className="rounded-2xl overflow-hidden border p-3" style={{ borderColor: 'var(--border)', background: 'var(--surface2)' }}>
                        {PRESET_MESSAGES.filter((cat) => cat.category === activeMessageCategory).map((cat) => (
                          <div key={cat.category} className="space-y-2">
                            <div className="text-[10px] uppercase tracking-[0.16em] font-bold" style={{ color: 'var(--text3)' }}>
                              {cat.category}
                            </div>
                            <div className="grid gap-2 max-h-56 overflow-y-auto pr-1">
                              {cat.items.map((msg) => (
                                <button
                                  key={msg}
                                  type="button"
                                  onClick={() => { setMessage(msg); setMessageBoxOpen(false); }}
                                  className="text-left text-xs px-3.5 py-2.5 rounded-xl transition-all duration-150 active:scale-[0.98] border font-serif italic"
                                  style={{
                                    borderColor: message === msg ? 'var(--accent)' : 'var(--border)',
                                    background: message === msg ? 'var(--surface-solid)' : 'transparent',
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

                      <div className="space-y-2 pt-1">
                        <div className="text-[10px] uppercase tracking-[0.24em] font-bold" style={{ color: 'var(--text3)' }}>
                          Kendi Mesajını Yaz
                        </div>
                        <textarea
                          rows={3}
                          value={message}
                          onChange={(e) => setMessage(e.target.value)}
                          placeholder="Buraya özel duygu ve dileklerinizi yazabilirsiniz..."
                          className={inp + ' resize-none'}
                          style={{ background: 'var(--surface2)', border: '1px solid var(--border)', color: 'var(--text)' }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <button type="submit" disabled={saving || uploading}
              className="w-full py-3 rounded-2xl text-sm font-medium transition-all duration-200 disabled:opacity-50 border"
              style={{ background: 'var(--surface-solid)', color: 'var(--text)', borderColor: 'var(--border)' }}>
              {saving ? 'Kaydediliyor...' : '✨ Yeni NFC Takısını Kaydet'}
            </button>
          </form>
        </div>

        {/* Kayıtlı Takılar Bölümü */}
        <div className="rounded-2xl border p-6 sm:p-8 space-y-6" style={{ background: 'var(--surface-solid)', borderColor: 'var(--border)' }}>

          {/* Başlık & Arama / Filtreleme Üst Barı */}
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between border-b pb-6" style={{ borderColor: 'var(--border)' }}>
            <div>
              <h2 className="text-xl font-bold font-serif flex items-center gap-2.5" style={{ color: 'var(--text)' }}>
                <span>💎</span> Kayıtlı Takı Portföyü
              </h2>
              <p className="text-xs mt-1 font-sans" style={{ color: 'var(--text2)' }}>
                Sistemde kayıtlı NFC takılarını arayın, medya galerilerini düzenleyin veya QR kod oluşturun.
              </p>
            </div>

            {/* Arama Kutusu ve Filtreler */}
            <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
              {/* Search Bar */}
              <div className="relative flex-1 sm:w-64">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm opacity-60">🔍</span>
                <input
                  type="text"
                  placeholder="Takı başlığı, alıcı veya Tag ID ara..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 rounded-xl text-xs font-medium glass outline-none transition-all focus:border-rose-400"
                  style={{ color: 'var(--text)' }}
                />
                {searchQuery && (
                  <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-xs opacity-60 hover:opacity-100">
                    ✕
                  </button>
                )}
              </div>

              {/* Status Filter Chips */}
              <div className="flex items-center gap-1.5 glass p-1 rounded-xl">
                {[
                  { id: 'all', label: 'Tümü' },
                  { id: 'with-media', label: '📸 Medyalı' },
                  { id: 'no-media', label: '📭 Bekleyen' },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setFilterStatus(tab.id as any)}
                    className="px-3 py-1.5 rounded-lg text-xs font-bold transition-all duration-200"
                    style={{
                      background: filterStatus === tab.id ? 'var(--accent-gradient)' : 'transparent',
                      color: filterStatus === tab.id ? '#ffffff' : 'var(--text2)',
                    }}>
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* View Mode Toggle Buttons */}
              <div className="flex items-center gap-1 glass p-1 rounded-xl">
                <button
                  onClick={() => setViewMode('grid')}
                  title="Kart Görünümü"
                  className="p-1.5 rounded-lg text-xs font-bold transition-all"
                  style={{
                    background: viewMode === 'grid' ? 'var(--surface-solid)' : 'transparent',
                    color: viewMode === 'grid' ? 'var(--accent)' : 'var(--text2)',
                    border: viewMode === 'grid' ? '1px solid var(--border)' : 'none',
                  }}>
                  ▦ Grid
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  title="Liste Görünümü"
                  className="p-1.5 rounded-lg text-xs font-bold transition-all"
                  style={{
                    background: viewMode === 'list' ? 'var(--surface-solid)' : 'transparent',
                    color: viewMode === 'list' ? 'var(--accent)' : 'var(--text2)',
                    border: viewMode === 'list' ? '1px solid var(--border)' : 'none',
                  }}>
                  ☰ Liste
                </button>
              </div>
            </div>
          </div>

          {/* İçerik Gösterimi */}
          {loading ? (
            <div className="py-20 text-center space-y-4">
              <div className="w-14 h-14 rounded-full border-4 border-t-transparent animate-spin mx-auto"
                style={{ borderColor: 'var(--accent)', borderTopColor: 'transparent' }} />
              <p className="text-sm font-serif gold-text animate-pulse">Takı Portföyü Yükleniyor...</p>
            </div>
          ) : (() => {
            const filteredJewelries = jewelries.filter((j) => {
              const query = searchQuery.toLowerCase().trim();
              const matchesSearch =
                !query ||
                j.title.toLowerCase().includes(query) ||
                (j.recipient_name && j.recipient_name.toLowerCase().includes(query)) ||
                j.nfc_tag_id.toLowerCase().includes(query);

              if (!matchesSearch) return false;
              if (filterStatus === 'with-media') return !!j.media_url;
              if (filterStatus === 'no-media') return !j.media_url;
              return true;
            });

            if (filteredJewelries.length === 0) {
              return (
                <div className="py-16 text-center space-y-3 rounded-2xl border p-8" style={{ borderColor: 'var(--border)', background: 'var(--surface2)' }}>
                  <div className="text-5xl">🔍</div>
                  <h3 className="text-base font-bold font-serif" style={{ color: 'var(--text)' }}>
                    Kayıt Bulunamadı
                  </h3>
                  <p className="text-xs font-sans max-w-sm mx-auto" style={{ color: 'var(--text2)' }}>
                    {searchQuery ? `"${searchQuery}" aramanıza uygun takı kaydı bulunamadı.` : 'Henüz bu filtrede takı kaydı mevcut değil.'}
                  </p>
                  {(searchQuery || filterStatus !== 'all') && (
                    <button
                      onClick={() => { setSearchQuery(''); setFilterStatus('all'); }}
                      className="px-4 py-2 rounded-xl text-xs font-bold glass text-rose-500 mt-2">
                      Filtreleri Temizle
                    </button>
                  )}
                </div>
              );
            }

            {/* GRID VIEW (Gelişmiş Lüks Kartlar) */}
            if (viewMode === 'grid') {
              return (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {filteredJewelries.map((j) => (
                    <div
                      key={j.id}
                      className="rounded-2xl border overflow-hidden flex flex-col justify-between group transition-all duration-300 relative"
                      style={{ borderColor: 'var(--border)', background: 'var(--surface-solid)' }}>

                      {/* Image / Video Media Preview Header */}
                      <div className="relative aspect-video overflow-hidden bg-black/40">
                        {j.media_url ? (
                          /\.(mp4|webm|ogg|mov)(\?|$)/i.test(j.media_url) ? (
                            <video src={j.media_url} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" muted />
                          ) : (
                            <img src={j.media_url} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                          )
                        ) : (
                          <div className="w-full h-full flex flex-col items-center justify-center gap-2 bg-gradient-to-br from-amber-500/10 to-rose-500/10">
                            <span className="text-4xl opacity-80">💎</span>
                            <span className="text-[10px] font-bold uppercase tracking-widest text-amber-500">Kapak Medyası Bekliyor</span>
                          </div>
                        )}

                        {/* Top Badges Overlay */}
                        <div className="absolute top-3 left-3 flex items-center gap-2">
                          <span className="px-2.5 py-1 rounded-full glass text-[10px] font-extrabold font-mono text-white tracking-wider shadow-md">
                            🏷️ {j.nfc_tag_id}
                          </span>
                        </div>

                        <div className="absolute top-3 right-3">
                          <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold shadow-md ${j.media_url ? 'bg-emerald-500 text-white' : 'bg-amber-500 text-white'}`}>
                            {j.media_url ? '✓ Medyalı' : '📭 Boş'}
                          </span>
                        </div>
                      </div>

                      {/* Card Content Body */}
                      <div className="p-5 flex-1 flex flex-col justify-between gap-4">
                        <div className="space-y-2">
                          <h3 className="text-lg font-bold font-serif group-hover:text-rose-500 transition-colors" style={{ color: 'var(--text)' }}>
                            {j.title}
                          </h3>

                          {j.recipient_name && (
                            <p className="text-xs font-semibold gold-text flex items-center gap-1">
                              <span>✦</span> {j.recipient_name} İçin Özel
                            </p>
                          )}

                          {j.message && (
                            <p className="text-xs italic font-serif leading-relaxed line-clamp-2 pt-1 border-t" style={{ color: 'var(--text2)', borderColor: 'var(--border)' }}>
                              "{j.message}"
                            </p>
                          )}
                        </div>

                        {/* Action Buttons Toolbar */}
                        <div className="pt-3 border-t flex items-center justify-between gap-2" style={{ borderColor: 'var(--border)' }}>
                          <div className="flex items-center gap-1.5 flex-1">
                            <a
                              href={`/taki/${j.nfc_tag_id}`}
                              target="_blank"
                              rel="noreferrer"
                              className="flex-1 py-2 px-3 rounded-xl text-xs font-bold glass text-center hover:border-rose-400 transition-all flex items-center justify-center gap-1"
                              style={{ color: 'var(--text)' }}>
                              <span>↗</span> Portal
                            </a>

                            <button
                              onClick={() => openUrlModal(j, 'share')}
                              className="py-2 px-3 rounded-xl text-xs font-bold glass hover:border-amber-400 transition-all"
                              title="NFC & QR Kod">
                              📡 NFC/QR
                            </button>

                            <button
                              onClick={() => openUrlModal(j, 'edit')}
                              className="py-2 px-3 rounded-xl text-xs font-bold glass hover:border-rose-400 transition-all"
                              title="Müşteri Düzenleme Linki">
                              ✏️ Düzenle
                            </button>

                            <button
                              onClick={() => { setActiveDropdown(null); openMediaModal(j); }}
                              className="py-2 px-3 rounded-xl text-xs font-bold glass hover:border-rose-400 transition-all"
                              title="Medya Galerisi">
                              🖼 Galeri
                            </button>
                          </div>

                          <button
                            onClick={() => handleDelete(j.id, j.media_url)}
                            className="p-2 rounded-xl text-xs font-bold glass hover:bg-rose-500/20 text-rose-500 transition-all"
                            title="Takıyı Sil">
                            🗑
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              );
            }

            {/* LIST VIEW (Gelişmiş Tablo/Liste Görünümü) */}
            return (
              <div className="divide-y overflow-hidden rounded-2xl border" style={{ borderColor: 'var(--border)', background: 'var(--surface-solid)' }}>
                {filteredJewelries.map((j) => (
                  <div
                    key={j.id}
                    className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 hover:bg-rose-500/5 transition-colors">

                    <div className="flex items-center gap-4 min-w-0 flex-1">
                      <div className="w-14 h-14 rounded-2xl overflow-hidden flex-shrink-0 relative border" style={{ borderColor: 'var(--border)' }}>
                        {j.media_url ? (
                          /\.(mp4|webm|ogg|mov)(\?|$)/i.test(j.media_url) ? (
                            <video src={j.media_url} className="w-full h-full object-cover" muted />
                          ) : (
                            <img src={j.media_url} alt="" className="w-full h-full object-cover" />
                          )
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-xl bg-amber-500/10">💎</div>
                        )}
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="text-sm font-bold font-serif truncate" style={{ color: 'var(--text)' }}>
                            {j.title}
                          </h4>
                          <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full glass gold-text">
                            {j.nfc_tag_id}
                          </span>
                        </div>
                        {j.recipient_name && (
                          <p className="text-xs font-semibold text-rose-400 mt-0.5">
                            ✦ {j.recipient_name}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 flex-shrink-0">
                      <a href={`/taki/${j.nfc_tag_id}`} target="_blank" rel="noreferrer"
                        className="px-3 py-1.5 rounded-xl text-xs font-bold glass text-center hover:border-rose-400">
                        ↗ Portal
                      </a>
                      <button onClick={() => openUrlModal(j, 'share')}
                        className="px-3 py-1.5 rounded-xl text-xs font-bold glass hover:border-amber-400">
                        📡 NFC
                      </button>
                      <button onClick={() => openUrlModal(j, 'edit')}
                        className="px-3 py-1.5 rounded-xl text-xs font-bold glass hover:border-rose-400">
                        ✏️ Edit
                      </button>
                      <button onClick={() => downloadQRCode(j.nfc_tag_id)}
                        className="px-3 py-1.5 rounded-xl text-xs font-bold glass hover:border-emerald-400">
                        📥 QR
                      </button>
                      <button onClick={() => openMediaModal(j)}
                        className="px-3 py-1.5 rounded-xl text-xs font-bold glass hover:border-rose-400">
                        🖼 Medya
                      </button>
                      <button onClick={() => handleDelete(j.id, j.media_url)}
                        className="p-1.5 rounded-xl text-xs font-bold glass text-rose-500 hover:bg-rose-500/20">
                        🗑
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            );
          })()}
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
                      <div className="flex flex-wrap items-center justify-center gap-2">
                        <button
                          onClick={() => setPreviewMedia(item)}
                          className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold text-white"
                          style={{ background: 'rgba(255,255,255,0.2)' }}>
                          👁
                        </button>
                        <button
                          onClick={() => handleSetCoverMedia(item)}
                          className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold text-white"
                          style={{ background: 'rgba(245,158,11,0.9)' }}>
                          ⭐
                        </button>
                        <button
                          onClick={() => handleDeleteMediaItem(item)}
                          className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold text-white"
                          style={{ background: '#ef4444' }}>
                          ✕
                        </button>
                      </div>
                    </div>
                    {item.media_type === 'video' && (
                      <div className="absolute top-1 left-1 text-xs px-1.5 py-0.5 rounded-full font-bold"
                        style={{ background: 'rgba(0,0,0,0.6)', color: 'white' }}>
                        ▶
                      </div>
                    )}
                    {activeMediaModal.media_url === item.url && (
                      <div className="absolute bottom-1 left-1 text-[10px] px-1.5 py-0.5 rounded-full font-semibold"
                        style={{ background: 'rgba(16,185,129,0.9)', color: 'white' }}>
                        Kapak
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

      {previewMedia && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4"
          style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(8px)' }}
          onClick={() => setPreviewMedia(null)}>
          <div className="w-full max-w-3xl rounded-2xl p-4 shadow-2xl"
            style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
            onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="text-lg font-bold" style={{ color: 'var(--text)' }}>Önizleme</h3>
                <p className="text-sm" style={{ color: 'var(--text2)' }}>{previewMedia.media_type === 'video' ? 'Video önizleme' : 'Fotoğraf önizleme'}</p>
              </div>
              <button onClick={() => setPreviewMedia(null)} className="w-8 h-8 rounded-xl" style={{ background: 'var(--surface2)', color: 'var(--text2)' }}>✕</button>
            </div>
            {previewMedia.media_type === 'video' ? (
              <video src={previewMedia.url} controls autoPlay className="w-full max-h-[70vh] rounded-xl object-contain bg-black" />
            ) : (
              <img src={previewMedia.url} alt="Preview" className="w-full max-h-[70vh] rounded-xl object-contain" />
            )}
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
                <h3 className="text-lg font-bold" style={{ color: 'var(--text)' }}>{activeUrlModalMode === 'edit' ? '✏️ Müşteri Düzenleme Linki' : '📡 NFC Etikete Yaz'}</h3>
                <p className="text-sm mt-1" style={{ color: 'var(--text2)' }}>
                  {activeUrlModalMode === 'edit' ? 'Bu linki müşteriyle paylaşarak portalı kendisinin düzenlemesini sağlayabilirsiniz.' : 'Yazılacak URL:'}
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

            <div className="flex gap-2">
              <button
                onClick={() => {
                  if (!activeUrlModalNfcTagId) return;
                  const nextMode = activeUrlModalMode === 'share' ? 'edit' : 'share';
                  const nextLink = `${getOrigin()}/taki/${activeUrlModalNfcTagId}${nextMode === 'edit' ? '?edit=true' : ''}`;
                  setActiveUrlModal(nextLink);
                  setActiveUrlModalMode(nextMode);
                  setCopied(false);
                }}
                className="rounded-xl px-3 py-2 text-xs font-bold" style={{ background: 'var(--surface2)', color: 'var(--text)', border: '1px solid var(--border)' }}>
                {activeUrlModalMode === 'share' ? '✏️ Düzenleme Linki' : '🌐 Paylaşım Linki'}
              </button>
            </div>

            {/* Web NFC butonu (Android Chrome) */}
            {nfcSupported !== false && activeUrlModalMode === 'share' && (
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
            {nfcSupported === false && activeUrlModalMode === 'share' && (
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
                {copied ? '✓ Kopyalandı' : activeUrlModalMode === 'edit' ? '📋 Düzenleme Linki Kopyala' : '📋 URL Kopyala'}
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

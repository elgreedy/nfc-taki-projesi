'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import QRCode from 'qrcode'; // QR Kod kütüphanesini ekledik

interface Jewelry {
  id: string;
  nfc_tag_id: string;
  title: string;
  recipient_name: string;
  message: string;
  media_url: string;
  is_active: boolean;
}

export default function AdminDashboard() {
  const [jewelries, setJewelries] = useState<Jewelry[]>([]);
  const [loading, setLoading] = useState(true);

  // Form State'leri
  const [nfcTagId, setNfcTagId] = useState('');
  const [title, setTitle] = useState('');
  const [recipientName, setRecipientName] = useState('');
  const [message, setMessage] = useState('');
  const [mediaUrl, setMediaUrl] = useState('');
  const [activeUrlModal, setActiveUrlModal] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  // Bilgisayarının Yerel IP Adresi ve Portu
  const LOCAL_IP_ORIGIN = 'http://192.168.68.69:3000';

  // Takıları Çek
  const fetchJewelries = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('jewelries')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && data) {
      setJewelries(data);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchJewelries();
  }, []);

  // Supabase Storage'a Görsel Yükleme
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploading(true);
      if (!event.target.files || event.target.files.length === 0) return;

      const file = event.target.files[0];
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('jewelry-media')
        .upload(fileName, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data } = supabase.storage
        .from('jewelry-media')
        .getPublicUrl(fileName);

      if (data?.publicUrl) {
        setMediaUrl(data.publicUrl);
        alert('Fotoğraf yüklendi!');
      }
    } catch (error: any) {
      alert('Hata: ' + error.message);
    } finally {
      setUploading(false);
    }
  };

  // QR Kod İndirme Fonksiyonu
  const downloadQRCode = async (nfcTagId: string) => {
    try {
      // localhost yerine IP adresini kullanıyoruz
      const targetUrl = `${LOCAL_IP_ORIGIN}/taki/${nfcTagId}`;
      
      // QR Kodu yüksek çözünürlüklü Data URL olarak oluşturuyoruz
      const qrDataUrl = await QRCode.toDataURL(targetUrl, {
        width: 600,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#ffffff',
        },
      });

      const downloadLink = document.createElement('a');
      downloadLink.href = qrDataUrl;
      downloadLink.download = `QR-${nfcTagId}.png`;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
    } catch (err) {
      console.error('QR Kod oluşturulamadı:', err);
    }
  };

  // NFC için modal açma
  const handleOpenNfcModal = (nfcTagId: string) => {
    // localhost yerine IP adresini kopyalatıyoruz
    const fullUrl = `${LOCAL_IP_ORIGIN}/taki/${nfcTagId}`;
    setActiveUrlModal(fullUrl);
    setCopied(false);
  };

  // NFC İçin Tam Linki Kopyalama
  const copyNfcUrl = async (nfcTagId: string) => {
    const fullUrl = `${LOCAL_IP_ORIGIN}/taki/${nfcTagId}`;

    try {
      await navigator.clipboard.writeText(fullUrl);
      alert(`NFC'ye yazılacak URL kopyalandı:\n${fullUrl}`);
    } catch (err) {
      console.error('URL kopyalanamadı:', err);
      alert('URL kopyalanamadı. Lütfen manuel olarak seçip kopyalayın.');
    }
  };

  const handleCopyText = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
    } catch (err) {
      console.error('Kopyalama hatası:', err);
      setCopied(false);
      alert('Kopyalama başarısız oldu. Lütfen manuel olarak seçiniz.');
    }
  };

  // Yeni Takı Kaydet
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nfcTagId || !title) return alert('NFC ID ve Başlık alanları zorunludur!');

    setSaving(true);
    const { error } = await supabase.from('jewelries').insert([
      {
        nfc_tag_id: nfcTagId,
        title,
        recipient_name: recipientName,
        message,
        media_url: mediaUrl,
      },
    ]);

    setSaving(false);

    if (error) {
      alert('Hata oluştu: ' + error.message);
    } else {
      alert('NFC Takı başarıyla oluşturuldu!');
      setNfcTagId('');
      setTitle('');
      setRecipientName('');
      setMessage('');
      setMediaUrl('');
      fetchJewelries();
    }
  };

  // Takı Sil
  const handleDelete = async (id: string) => {
    if (!confirm('Bu takıyı silmek istediğinize emin misiniz?')) return;

    const { error } = await supabase.from('jewelries').delete().eq('id', id);

    if (error) {
      alert('Silinirken hata oluştu: ' + error.message);
    } else {
      fetchJewelries();
    }
  };

  return (
    <main className="min-h-screen bg-gray-50 p-6 md:p-12">
      <div className="max-w-5xl mx-auto space-y-8">
        <h1 className="text-3xl font-bold text-gray-800">NFC Takı Yönetim Paneli</h1>

        {/* Yeni Takı Formu */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <h2 className="text-xl font-semibold mb-4 text-gray-700">Yeni Takı / Etiket Ekle</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">NFC Tag ID (Kod/Slug) *</label>
                <input
                  type="text"
                  placeholder="Örn: taki-003"
                  value={nfcTagId}
                  onChange={(e) => setNfcTagId(e.target.value)}
                  className="mt-1 w-full p-2 border rounded-lg focus:ring-2 focus:ring-rose-500 outline-none text-gray-900 bg-white font-medium placeholder:text-gray-400"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Başlık *</label>
                <input
                  type="text"
                  placeholder="Örn: Tatil Anımız"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="mt-1 w-full p-2 border rounded-lg focus:ring-2 focus:ring-rose-500 outline-none text-gray-900 bg-white font-medium placeholder:text-gray-400"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Kime / Alıcı Adı</label>
                <input
                  type="text"
                  placeholder="Örn: Mehmet'e"
                  value={recipientName}
                  onChange={(e) => setRecipientName(e.target.value)}
                  className="mt-1 w-full p-2 border rounded-lg focus:ring-2 focus:ring-rose-500 outline-none text-gray-900 bg-white font-medium placeholder:text-gray-400"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Anı Fotoğrafı Yükle</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  disabled={uploading}
                  className="mt-1 w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-rose-50 file:text-rose-700 hover:file:bg-rose-100 cursor-pointer"
                />
                {uploading && <p className="text-xs text-rose-500 mt-1">Yükleniyor...</p>}
                {mediaUrl && <p className="text-xs text-green-600 mt-1 font-medium">✓ Fotoğraf Yüklendi</p>}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Özel Mesaj</label>
              <textarea
                rows={3}
                placeholder="NFC okutulduğunda çıkacak yazı..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="mt-1 w-full p-2 border rounded-lg focus:ring-2 focus:ring-rose-500 outline-none text-gray-900 bg-white font-medium placeholder:text-gray-400"
              />
            </div>

            <button
              type="submit"
              disabled={saving || uploading}
              className="w-full bg-rose-600 hover:bg-rose-700 text-white font-semibold py-2 px-4 rounded-lg transition disabled:opacity-50"
            >
              {saving ? 'Kaydediliyor...' : 'NFC Takıyı Kaydet'}
            </button>
          </form>
        </div>

        {/* Mevcut Takılar Listesi */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <h2 className="text-xl font-semibold mb-4 text-gray-700">Kayıtlı Takılar</h2>

          {loading ? (
            <p className="text-gray-500">Yükleniyor...</p>
          ) : jewelries.length === 0 ? (
            <p className="text-gray-500">Henüz hiç takı eklenmemiş.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b bg-gray-50 text-xs font-semibold text-gray-500 uppercase">
                    <th className="p-3">Görsel</th>
                    <th className="p-3">NFC ID</th>
                    <th className="p-3">Başlık</th>
                    <th className="p-3">Önizleme</th>
                    <th className="p-3 text-center">NFC / QR Araçları</th>
                    <th className="p-3 text-right">İşlem</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {jewelries.map((j) => (
                    <tr key={j.id} className="hover:bg-gray-50">
                      <td className="p-3">
                        {j.media_url ? (
                          <img src={j.media_url} alt="" className="w-10 h-10 rounded-lg object-cover" />
                        ) : (
                          <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center text-xs text-gray-400">Yok</div>
                        )}
                      </td>
                      <td className="p-3 font-mono text-sm font-bold text-gray-700">{j.nfc_tag_id}</td>
                      <td className="p-3 font-medium text-gray-800">{j.title}</td>
                      <td className="p-3 text-gray-600">{j.recipient_name || '-'}</td>
                      <td className="p-3">
                        <a
                          href={`/taki/${j.nfc_tag_id}`}
                          target="_blank"
                          rel="noreferrer"
                          className="text-rose-600 hover:underline text-sm font-medium"
                        >
                          /taki/{j.nfc_tag_id} ↗
                        </a>
                      </td>
                      <td className="p-3 text-center space-x-2">
                        <button
                          onClick={() => handleOpenNfcModal(j.nfc_tag_id)}
                          className="bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs px-2.5 py-1.5 rounded-md font-medium border border-gray-300 transition"
                          title="NFC Çipine Yazılacak URL'yi Gösterir"
                        >
                          🔗 NFC URL
                        </button>
                        <button
                          onClick={() => downloadQRCode(j.nfc_tag_id)}
                          className="bg-slate-800 hover:bg-slate-900 text-white text-xs px-2.5 py-1.5 rounded-md font-medium transition"
                          title="Yüksek Kaliteli QR Kod İndir"
                        >
                          📥 QR İndir
                        </button>
                      </td>
                      <td className="p-3 text-right">
                        <button
                          onClick={() => handleDelete(j.id)}
                          className="text-red-500 hover:text-red-700 text-sm font-semibold"
                        >
                          Sil
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* NFC URL Kopyalama Açılır Penceresi (Modal) */}
      {activeUrlModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl space-y-4 border border-gray-100">
            <div className="flex justify-between items-center gap-4">
              <div>
                <h3 className="text-lg font-bold text-gray-900">🔗 NFC URL Kopyala</h3>
                <p className="text-sm text-gray-600 mt-1">
                  Bu URL'yi NFC çipine yazmak için NFC Tools uygulamasına yapıştırabilirsiniz.
                </p>
              </div>
              <button
                onClick={() => setActiveUrlModal(null)}
                className="text-gray-400 hover:text-gray-700 font-bold text-xl"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3">
              <input
                type="text"
                readOnly
                value={activeUrlModal}
                onClick={(e) => (e.target as HTMLInputElement).select()}
                className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 font-mono text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-rose-500"
              />

              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={() => handleCopyText(activeUrlModal)}
                  className="inline-flex justify-center items-center rounded-2xl bg-rose-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-rose-700"
                >
                  {copied ? '✓ Kopyalandı' : 'URL Kopyala'}
                </button>
                <button
                  onClick={() => setActiveUrlModal(null)}
                  className="inline-flex justify-center items-center rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
                >
                  Kapat
                </button>
              </div>

              <div className="rounded-2xl bg-amber-50 p-4 text-sm text-amber-800 border border-amber-200">
                <p className="font-semibold">NFC Tools için adımlar:</p>
                <ol className="mt-2 list-decimal list-inside space-y-1 text-xs text-gray-700">
                  <li>URL'yi kopyala.</li>
                  <li>Uygulamada <span className="font-semibold">Write ➔ Add record ➔ URL</span> seçeneğini aç.</li>
                  <li>Yapıştır ve NFC çipe yaz.</li>
                </ol>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

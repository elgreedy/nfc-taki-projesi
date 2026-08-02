import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import TakiDetailClient from './TakiDetailClient';

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

async function getTaki(id: string) {
  const { data, error } = await supabase
    .from('jewelries')
    .select('*')
    .eq('nfc_tag_id', id)
    .single();

  if (error || !data || !data.is_active) {
    return null;
  }

  return data as Jewelry;
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const taki = await getTaki(String(id));

  if (!taki) {
    return {};
  }

  const title = `${taki.title} — NFC Takı Anı Portalı`;
  const description = taki.message
    ? `${taki.message.slice(0, 155)}${taki.message.length > 155 ? '…' : ''}`
    : `${taki.title} için hazırlanan özel dijital anı portalı.`;
  const url = `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/taki/${taki.nfc_tag_id}`;

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      type: 'website',
      url,
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
  };
}

export default async function TakiPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const taki = await getTaki(String(id));

  if (!taki) {
    return notFound();
  }

  return <TakiDetailClient taki={taki} />;
}

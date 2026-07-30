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

export default async function TakiPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const taki = await getTaki(String(id));

  if (!taki) {
    return notFound();
  }

  return <TakiDetailClient taki={taki} />;
}

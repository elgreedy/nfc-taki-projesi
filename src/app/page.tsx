"use client";

import Image from "next/image";
import { useEffect } from "react";
import { supabase } from "../lib/supabase";

export default function Home() {
  useEffect(() => {
    async function testConnection() {
      const { data, error } = await supabase.from("test").select("*");

      if (error) {
        console.error("Supabase Bağlantı Hatası:", error.message);
      } else {
        console.log("Supabase Bağlantısı Başarılı! Gelen Veri:", data);
      }
    }

    testConnection();
  }, []);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex w-full max-w-3xl flex-col items-center justify-center gap-10 rounded-3xl border border-zinc-200 bg-white p-10 shadow-lg shadow-zinc-200/50 dark:border-zinc-800 dark:bg-zinc-950 dark:shadow-black/25 sm:p-16">
        <Image
          className="dark:invert"
          src="/next.svg"
          alt="Next.js logo"
          width={100}
          height={20}
          priority
        />
        <div className="flex flex-col items-center gap-6 text-center sm:text-left">
          <h1 className="text-3xl font-semibold leading-10 tracking-tight text-black dark:text-zinc-50">
            NFC Takı Projesi
          </h1>
          <p className="max-w-2xl text-lg leading-8 text-zinc-600 dark:text-zinc-400">
            Bu sayfa, Supabase bağlantınızı test etmek için hazırlandı. Konsolunuzda Supabase sorgu sonuçlarını
            görebilirsiniz.
          </p>
        </div>
      </main>
    </div>
  );
}

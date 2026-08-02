import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Playfair_Display } from "next/font/google";
import "./globals.css";
import ThemeToggle from "@/components/ThemeToggle";

const plusJakarta = Plus_Jakarta_Sans({
  variable: "--font-sans-custom",
  subsets: ["latin", "latin-ext"],
  weight: ["400", "500", "600", "700", "800"],
});

const playfair = Playfair_Display({
  variable: "--font-serif-custom",
  subsets: ["latin", "latin-ext"],
  weight: ["600", "700", "800"],
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: "NFC Takı — Anı Portalı",
  description: "NFC etiketli takılar için dijital anı portalı. Fotoğraf, video ve özel mesajlar tek dokunuşla.",
  openGraph: {
    title: "NFC Takı — Anı Portalı",
    description: "NFC etiketli takılar için dijital anı portalı. Fotoğraf, video ve özel mesajlar tek dokunuşla.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "NFC Takı — Anı Portalı",
    description: "NFC etiketli takılar için dijital anı portalı. Fotoğraf, video ve özel mesajlar tek dokunuşla.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="tr"
      suppressHydrationWarning
      className={`${plusJakarta.variable} ${playfair.variable} h-full antialiased`}
    >
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){
              try {
                const theme = localStorage.getItem('theme');
                const darkPreferred = window.matchMedia('(prefers-color-scheme: dark)').matches;
                const isDark = theme === 'dark' || (theme === null && darkPreferred);
                const html = document.documentElement;
                
                if (isDark) {
                  html.classList.add('dark');
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
                } else {
                  html.classList.remove('dark');
                }
              } catch (e) {}
            })()`,
          }}
        />
      </head>
      <body className="min-h-full flex flex-col font-sans">
        <ThemeToggle />
        {children}
      </body>
    </html>
  );
}


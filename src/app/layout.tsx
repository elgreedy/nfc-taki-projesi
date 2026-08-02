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
      className={`${plusJakarta.variable} ${playfair.variable} h-full antialiased`}
    >
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){var t=localStorage.getItem('theme');var d=window.matchMedia('(prefers-color-scheme: dark)').matches;if(t==='dark'||(t===null&&d)){document.documentElement.classList.add('dark')}})()`,
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


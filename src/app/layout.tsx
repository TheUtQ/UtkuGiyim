import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Utku Giyim | Premium Motosiklet Aksesuarları - Sele Kılıfı & Vites Sweatshirt",
  description: "Utku Giyim ile sürüşünüze premium dokunuş katın. Özel tasarım motosiklet sele kılıfları ve vites sweatshirtleri. Dayanıklı, şık, üst düzey kalite.",
  keywords: "motosiklet sele kılıfı, vites sweatshirt, motosiklet aksesuarları, premium moto, utku giyim",
  openGraph: {
    title: "Utku Giyim | Premium Motosiklet Aksesuarları",
    description: "Sürüşünüze premium dokunuş. Özel tasarım sele kılıfları ve vites sweatshirtleri.",
    type: "website",
    locale: "tr_TR",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;600;700;900&family=Inter:wght@300;400;500;600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}

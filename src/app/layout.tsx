import type { Metadata, Viewport } from "next";
import "./globals.css";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "灵境 Oracle | 赛博玄学大师 · AI塔罗 · 灵魂画像",
    template: "%s | 灵境 Oracle"
  },
  description: "探索命运深处的答案：AI命运解析、AI塔罗、灵魂画像、前世身份、双人契合度与30天命运报告。",
  applicationName: "灵境 Oracle",
  keywords: ["AI塔罗", "灵魂画像", "命运解析", "赛博玄学", "Oracle"],
  authors: [{ name: "灵境 Oracle" }],
  openGraph: {
    type: "website",
    locale: "zh_CN",
    url: siteUrl,
    title: "灵境 Oracle",
    description: "赛博玄学大师 · AI塔罗 · 灵魂画像",
    siteName: "灵境 Oracle",
    images: [{ url: "/icon.svg", width: 512, height: 512, alt: "灵境 Oracle" }]
  },
  twitter: {
    card: "summary_large_image",
    title: "灵境 Oracle",
    description: "探索命运深处的答案",
    images: ["/icon.svg"]
  },
  manifest: "/manifest.json",
  icons: [{ rel: "icon", url: "/icon.svg" }]
};

export const viewport: Viewport = {
  themeColor: "#D4AF37",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "灵境 Oracle",
    description: "赛博玄学大师 · AI塔罗 · 灵魂画像",
    applicationCategory: "EntertainmentApplication",
    operatingSystem: "Web, iOS, Android",
    offers: [
      { "@type": "Offer", price: "99", priceCurrency: "THB", name: "VIP Basic" },
      { "@type": "Offer", price: "199", priceCurrency: "THB", name: "VIP Pro" }
    ]
  };

  return (
    <html lang="zh-CN" className="dark">
      <body className="bg-background text-foreground antialiased">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
        {children}
      </body>
    </html>
  );
}

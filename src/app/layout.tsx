import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";
import EarthScene from "@/components/Earth";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://guides-treasury-rental-buddy.trycloudflare.com";

export const metadata: Metadata = {
  title: "Hermes Diary — 个人博客",
  description: "记录商业与法律之路上的思考与见闻",
  keywords: ["博客", "商业", "法律", "个人网站"],
  openGraph: {
    title: "Hermes Diary — 个人博客",
    description: "记录商业与法律之路上的思考、见闻与感悟",
    url: SITE_URL,
    siteName: "Hermes Diary",
    locale: "zh_CN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Hermes Diary — 个人博客",
    description: "记录商业与法律之路上的思考、见闻与感悟",
  },
  other: {
    "weixin-title": "Hermes Diary — 个人博客",
    "weixin-desc": "记录商业与法律之路上的思考、见闻与感悟",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
        <meta property="og:title" content="Hermes Diary — 个人博客" />
        <meta property="og:description" content="记录商业与法律之路上的思考、见闻与感悟" />
        <meta property="og:url" content={SITE_URL} />
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content="Hermes Diary" />
        <meta property="og:locale" content="zh_CN" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Hermes Diary — 个人博客" />
        <meta name="twitter:description" content="记录商业与法律之路上的思考、见闻与感悟" />
        {/* WeChat specific */}
        <meta name="weixin-title" content="Hermes Diary" />
        <meta name="weixin-desc" content="记录商业与法律之路上的思考与见闻" />
      </head>
      <body className="antialiased">
        <EarthScene />
        <Navbar />
        <main className="content-overlay pt-16 md:pt-20 pb-16">{children}</main>
      </body>
    </html>
  );
}

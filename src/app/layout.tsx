import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";
import EarthScene from "@/components/Earth";

export const metadata: Metadata = {
  title: "Hermes Diary — 个人博客",
  description: "记录商业与法律之路上的思考与见闻",
  keywords: ["博客", "商业", "法律", "个人网站"],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body className="antialiased">
        <EarthScene />
        <Navbar />
        <main className="content-overlay pt-20">{children}</main>
      </body>
    </html>
  );
}

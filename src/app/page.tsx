import Link from "next/link";
import GlassCard from "@/components/GlassCard";

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-20">
      {/* Hero */}
      <div className="text-center max-w-3xl mx-auto mb-16 animate-fade-in-up">
        <h1 className="text-5xl md:text-7xl font-bold mb-6">
          <span className="bg-gradient-to-r from-indigo-300 via-purple-300 to-pink-300 bg-clip-text text-transparent">
            许笑铭的博客
          </span>
        </h1>
        <p className="text-lg md:text-xl text-gray-400 leading-relaxed mb-8">
          记录商业与法律之路上的思考、见闻与感悟
          <br />
          <span className="text-sm text-gray-500">
            Business · Law · Life
          </span>
        </p>
        <div className="flex gap-4 justify-center">
          <Link href="/blog" className="glass-btn inline-block">
            开始阅读
          </Link>
        </div>
      </div>

      {/* Feature Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto w-full px-4">
        <Link href="/blog">
          <GlassCard hover className="text-center py-12">
            <div className="text-4xl mb-4">✍️</div>
            <h3 className="text-xl font-semibold mb-2">博客</h3>
            <p className="text-gray-400 text-sm">
              商业洞察 · 法律思考 · 人生随笔
            </p>
          </GlassCard>
        </Link>

        <Link href="/gallery">
          <GlassCard hover className="text-center py-12">
            <div className="text-4xl mb-4">🖼️</div>
            <h3 className="text-xl font-semibold mb-2">图册</h3>
            <p className="text-gray-400 text-sm">
              镜头下的世界 · 视觉故事
            </p>
          </GlassCard>
        </Link>

        <Link href="/video">
          <GlassCard hover className="text-center py-12">
            <div className="text-4xl mb-4">🎬</div>
            <h3 className="text-xl font-semibold mb-2">视频</h3>
            <p className="text-gray-400 text-sm">
              影像记录 · 精彩瞬间
            </p>
          </GlassCard>
        </Link>
      </div>

      {/* Footer */}
      <footer className="mt-20 text-center text-gray-600 text-sm">
        <p>© 2026 许笑铭的博客. All rights reserved.</p>
      </footer>
    </div>
  );
}

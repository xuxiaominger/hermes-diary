"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import GlassCard from "@/components/GlassCard";
import { supabase } from "@/lib/supabase";

export default function AdminDashboard() {
  const [stats, setStats] = useState({ posts: 0, published: 0, albums: 0, videos: 0 });
  const [copyMsg, setCopyMsg] = useState("");

  const siteUrl = typeof window !== "undefined"
    ? window.location.origin
    : "https://guides-treasury-rental-buddy.trycloudflare.com";

  useEffect(() => {
    async function loadStats() {
      const [posts, pub] = await Promise.all([
        supabase.from("posts").select("*", { count: "exact", head: true }),
        supabase.from("posts").select("*", { count: "exact", head: true }).eq("published", true),
      ]);
      setStats({ posts: posts.count || 0, published: pub.count || 0, albums: 0, videos: 0 });
    }
    loadStats();
  }, []);

  const copyLink = async (path: string) => {
    try {
      await navigator.clipboard.writeText(`${siteUrl}${path}`);
      setCopyMsg("已复制链接！");
      setTimeout(() => setCopyMsg(""), 2000);
    } catch {
      setCopyMsg("复制失败，请手动复制");
      setTimeout(() => setCopyMsg(""), 2000);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-3 sm:px-4">
      {copyMsg && (
        <div className="fixed top-4 right-4 z-50 glass-card px-4 py-2 text-sm text-indigo-300 animate-fade-in-up">
          {copyMsg}
        </div>
      )}

      {/* Header */}
      <div className="mb-6 animate-fade-in-up">
        <h1 className="text-xl sm:text-2xl font-bold">管理后台</h1>
        <p className="text-gray-400 text-sm mt-0.5">手机端快速管理你的内容</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 mb-6 animate-fade-in-up">
        <GlassCard className="text-center py-3 sm:py-4 px-2">
          <p className="text-xl sm:text-2xl font-bold">{stats.posts}</p>
          <p className="text-gray-400 text-xs mt-0.5">文章</p>
        </GlassCard>
        <GlassCard className="text-center py-3 sm:py-4 px-2">
          <p className="text-xl sm:text-2xl font-bold">{stats.published}</p>
          <p className="text-gray-400 text-xs mt-0.5">已发布</p>
        </GlassCard>
        <GlassCard className="text-center py-3 sm:py-4 px-2">
          <p className="text-xl sm:text-2xl font-bold">{stats.albums + stats.videos}</p>
          <p className="text-gray-400 text-xs mt-0.5">内容</p>
        </GlassCard>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 gap-3 mb-6 animate-fade-in-up">
        <Link href="/admin/posts" className="glass-card p-4 sm:p-5 text-center hover:bg-white/[0.08] transition-all active:scale-[0.97]">
          <span className="text-2xl block mb-1.5">✍️</span>
          <span className="text-sm font-medium">写文章</span>
          <span className="text-xs text-gray-500 block mt-0.5">Markdown 编辑器</span>
        </Link>
        <Link href="/admin/media" className="glass-card p-4 sm:p-5 text-center hover:bg-white/[0.08] transition-all active:scale-[0.97]">
          <span className="text-2xl block mb-1.5">🖼️</span>
          <span className="text-sm font-medium">上传图片</span>
          <span className="text-xs text-gray-500 block mt-0.5">管理图册</span>
        </Link>
        <Link href="/admin/settings" className="glass-card p-4 sm:p-5 text-center hover:bg-white/[0.08] transition-all active:scale-[0.97]">
          <span className="text-2xl block mb-1.5">⚙️</span>
          <span className="text-sm font-medium">系统设置</span>
          <span className="text-xs text-gray-500 block mt-0.5">同步配置</span>
        </Link>
        <a href={siteUrl} target="_blank" rel="noopener noreferrer" className="glass-card p-4 sm:p-5 text-center hover:bg-white/[0.08] transition-all active:scale-[0.97]">
          <span className="text-2xl block mb-1.5">🌐</span>
          <span className="text-sm font-medium">查看网站</span>
          <span className="text-xs text-gray-500 block mt-0.5">新窗口打开</span>
        </a>
      </div>

      {/* Share Links */}
      <GlassCard className="mb-6 animate-fade-in-up">
        <h2 className="text-sm font-medium mb-3 flex items-center gap-2">
          <span>🔗</span> 分享你的网站
        </h2>
        <div className="space-y-2">
          {[
            { label: "网站首页", path: "/", icon: "🏠" },
            { label: "博客列表", path: "/blog", icon: "📝" },
            { label: "图册", path: "/gallery", icon: "🖼️" },
            { label: "视频", path: "/video", icon: "🎬" },
          ].map((item) => (
            <button
              key={item.path}
              onClick={() => copyLink(item.path)}
              className="w-full text-left flex items-center gap-3 p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-all active:scale-[0.98]"
            >
              <span className="text-lg">{item.icon}</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{item.label}</p>
                <p className="text-xs text-gray-500 truncate">{siteUrl}{item.path}</p>
              </div>
              <span className="text-xs text-indigo-400 shrink-0">复制链接</span>
            </button>
          ))}
        </div>
      </GlassCard>

      {/* Quick sharing tip */}
      <GlassCard className="text-center py-4 animate-fade-in-up">
        <p className="text-xs text-gray-500">
          💡 复制链接后可直接分享到微信、朋友圈
        </p>
      </GlassCard>
    </div>
  );
}

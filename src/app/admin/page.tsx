"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import GlassCard from "@/components/GlassCard";
import { supabase } from "@/lib/supabase";

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    posts: 0,
    published: 0,
    albums: 0,
    videos: 0,
  });

  useEffect(() => {
    async function loadStats() {
      const [posts, albums, videos] = await Promise.all([
        supabase.from("posts").select("*", { count: "exact", head: true }),
        supabase
          .from("posts")
          .select("*", { count: "exact", head: true })
          .eq("published", true),
        supabase.from("albums").select("*", { count: "exact", head: true }),
        supabase.from("videos").select("*", { count: "exact", head: true }),
      ]);

      setStats({
        posts: posts.count || 0,
        published: albums.count || 0,
        albums: albums.count || 0,
        videos: videos.count || 0,
      });
    }
    loadStats();
  }, []);

  const cards = [
    {
      title: "文章总数",
      value: stats.posts,
      sub: `${stats.published} 篇已发布`,
      icon: "✍️",
      href: "/admin/posts",
      color: "from-indigo-500/20 to-purple-500/20",
    },
    {
      title: "图册",
      value: stats.albums,
      sub: "个相册",
      icon: "🖼️",
      href: "/admin/media",
      color: "from-emerald-500/20 to-teal-500/20",
    },
    {
      title: "视频",
      value: stats.videos,
      sub: "个视频",
      icon: "🎬",
      href: "/admin/media",
      color: "from-rose-500/20 to-pink-500/20",
    },
  ];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold">管理概览</h1>
        <p className="text-gray-400 text-sm mt-1">你的内容管理中心</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {cards.map((card) => (
          <Link key={card.title} href={card.href}>
            <GlassCard
              hover
              className={`bg-gradient-to-br ${card.color}`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-gray-400 mb-1">{card.title}</p>
                  <p className="text-3xl font-bold">{card.value}</p>
                  <p className="text-xs text-gray-500 mt-1">{card.sub}</p>
                </div>
                <span className="text-3xl">{card.icon}</span>
              </div>
            </GlassCard>
          </Link>
        ))}
      </div>

      {/* Quick Actions */}
      <GlassCard>
        <h2 className="text-lg font-semibold mb-4">快捷操作</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          <Link
            href="/admin/posts/new"
            className="flex items-center gap-3 p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-all"
          >
            <span className="text-2xl">✍️</span>
            <span className="text-sm font-medium">写新文章</span>
          </Link>
          <Link
            href="/admin/media"
            className="flex items-center gap-3 p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-all"
          >
            <span className="text-2xl">📷</span>
            <span className="text-sm font-medium">上传图片</span>
          </Link>
          <Link
            href="/admin/settings"
            className="flex items-center gap-3 p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-all"
          >
            <span className="text-2xl">🔗</span>
            <span className="text-sm font-medium">配置同步</span>
          </Link>
          <Link
            href="/"
            className="flex items-center gap-3 p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-all"
          >
            <span className="text-2xl">🌐</span>
            <span className="text-sm font-medium">查看网站</span>
          </Link>
        </div>
      </GlassCard>
    </div>
  );
}

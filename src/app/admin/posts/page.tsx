"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import GlassCard from "@/components/GlassCard";
import GlassButton from "@/components/GlassButton";
import { supabase } from "@/lib/supabase";
import { HiOutlinePencil, HiOutlineTrash, HiOutlinePlus, HiOutlineExternalLink } from "react-icons/hi";

interface PostRecord {
  id: string;
  title: string;
  slug: string;
  published: boolean;
  created_at: string;
  views: number;
}

function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  return `${d.getFullYear()}/${String(d.getMonth() + 1).padStart(2, "0")}/${String(d.getDate()).padStart(2, "0")}`;
}

export default function AdminPostsPage() {
  const router = useRouter();
  const [posts, setPosts] = useState<PostRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPosts();
  }, []);

  async function loadPosts() {
    const { data } = await supabase
      .from("posts")
      .select("id, title, slug, published, created_at, views")
      .order("created_at", { ascending: false });

    setPosts(data || []);
    setLoading(false);
  }

  async function handleDelete(id: string) {
    if (!confirm("确定要删除这篇文章吗？此操作不可撤销。")) return;

    const { error } = await supabase.from("posts").delete().eq("id", id);
    if (error) {
      alert("删除失败: " + error.message);
    } else {
      setPosts(posts.filter((p) => p.id !== id));
    }
  }

  async function togglePublish(id: string, current: boolean) {
    const { error } = await supabase
      .from("posts")
      .update({ published: !current, updated_at: new Date().toISOString() })
      .eq("id", id);

    if (error) {
      alert("操作失败: " + error.message);
    } else {
      setPosts(
        posts.map((p) => (p.id === id ? { ...p, published: !current } : p))
      );
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold">文章管理</h1>
          <p className="text-gray-400 text-sm mt-1">
            共 {posts.length} 篇文章
          </p>
        </div>
        <Link href="/admin/posts/new">
          <GlassButton>
            <span className="flex items-center gap-2">
              <HiOutlinePlus size={18} />
              写新文章
            </span>
          </GlassButton>
        </Link>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="skeleton h-20 rounded-xl" />
          ))}
        </div>
      ) : posts.length === 0 ? (
        <GlassCard className="text-center py-16">
          <p className="text-gray-400 text-lg mb-2">还没有文章</p>
          <p className="text-gray-500 text-sm">
            点击右上角按钮开始写第一篇文章
          </p>
        </GlassCard>
      ) : (
        <div className="space-y-3">
          {posts.map((post) => (
            <GlassCard key={post.id} className="flex items-center gap-4 py-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span
                    className={`w-2 h-2 rounded-full ${
                      post.published ? "bg-emerald-400" : "bg-gray-600"
                    }`}
                  />
                  <h3 className="font-medium truncate">{post.title}</h3>
                  <span className="text-xs text-gray-500">
                    /{post.slug}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-xs text-gray-500">
                  <span>{formatDate(post.created_at)}</span>
                  <span>{post.views || 0} 次阅读</span>
                  <button
                    onClick={() => togglePublish(post.id, post.published)}
                    className={`hover:text-white transition-colors ${
                      post.published ? "text-emerald-400" : "text-gray-500"
                    }`}
                  >
                    {post.published ? "已发布" : "草稿"}
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <Link
                  href={`/admin/posts/${post.id}`}
                  className="p-2 rounded-lg hover:bg-white/10 transition-colors text-gray-400 hover:text-white"
                >
                  <HiOutlinePencil size={18} />
                </Link>
                {post.published && (
                  <Link
                    href={`/blog/${post.slug}`}
                    target="_blank"
                    className="p-2 rounded-lg hover:bg-white/10 transition-colors text-gray-400 hover:text-white"
                  >
                    <HiOutlineExternalLink size={18} />
                  </Link>
                )}
                <button
                  onClick={() => handleDelete(post.id)}
                  className="p-2 rounded-lg hover:bg-red-500/10 transition-colors text-gray-400 hover:text-red-400"
                >
                  <HiOutlineTrash size={18} />
                </button>
              </div>
            </GlassCard>
          ))}
        </div>
      )}
    </div>
  );
}

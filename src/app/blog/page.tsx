import Link from "next/link";
import GlassCard from "@/components/GlassCard";
import { supabase } from "@/lib/supabase";
import type { Post } from "@/types";

async function getPosts() {
  const { data, error } = await supabase
    .from("posts")
    .select("*")
    .eq("published", true)
    .order("created_at", { ascending: false })
    .limit(50);

  if (error) return [];
  return (data || []) as Post[];
}

// Format date for display
function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  return `${d.getFullYear()}/${String(d.getMonth() + 1).padStart(2, "0")}/${String(d.getDate()).padStart(2, "0")}`;
}

export default async function BlogPage() {
  const posts = await getPosts();

  return (
    <div className="max-w-4xl mx-auto px-4 py-16">
      <div className="mb-12 animate-fade-in-up">
        <h1 className="text-4xl font-bold mb-4">博客</h1>
        <p className="text-gray-400">
          商业洞察 · 法律思考 · 人生随笔
          {posts.length > 0 && (
            <span className="ml-2 text-sm text-gray-500">
              (共 {posts.length} 篇)
            </span>
          )}
        </p>
      </div>

      {posts.length === 0 ? (
        <GlassCard className="text-center py-20">
          <div className="text-5xl mb-4">📝</div>
          <p className="text-gray-400 text-lg">还没有文章</p>
          <p className="text-gray-500 text-sm mt-2">
            去后台写第一篇文章吧 →
          </p>
          <Link href="/admin/posts" className="glass-btn inline-block mt-4">
            前往后台
          </Link>
        </GlassCard>
      ) : (
        <div className="space-y-6">
          {posts.map((post, i) => (
            <Link key={post.id} href={`/blog/${post.slug}`}>
              <GlassCard
                hover
                className="animate-fade-in-up"
                style={{ animationDelay: `${i * 0.05}s` } as React.CSSProperties}
              >
                <div className="flex flex-col md:flex-row gap-6">
                  {post.cover_image && (
                    <div className="md:w-48 shrink-0">
                      <img
                        src={post.cover_image}
                        alt={post.title}
                        className="w-full h-32 md:h-28 object-cover rounded-xl"
                      />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <h2 className="text-xl font-semibold mb-2 text-white truncate">
                      {post.title}
                    </h2>
                    <p className="text-gray-400 text-sm line-clamp-2 mb-3">
                      {post.excerpt || "暂无摘要"}
                    </p>
                    <div className="flex items-center gap-3 text-xs text-gray-500">
                      <span>{formatDate(post.created_at)}</span>
                      {post.tags && post.tags.length > 0 && (
                        <div className="flex gap-2">
                          {post.tags.map((tag) => (
                            <span key={tag} className="glass-tag">
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                      <span className="ml-auto">{post.views || 0} 次阅读</span>
                    </div>
                  </div>
                </div>
              </GlassCard>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

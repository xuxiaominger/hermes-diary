import { notFound } from "next/navigation";
import Link from "next/link";
import GlassCard from "@/components/GlassCard";
import { supabase } from "@/lib/supabase";
import { remark } from "remark";
import html from "remark-html";
import type { Post } from "@/types";

async function getPost(slug: string): Promise<Post | null> {
  const { data, error } = await supabase
    .from("posts")
    .select("*")
    .eq("slug", slug)
    .eq("published", true)
    .single();

  if (error || !data) return null;
  return data as Post;
}

function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  return `${d.getFullYear()} 年 ${d.getMonth() + 1} 月 ${d.getDate()} 日`;
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await getPost(slug);

  if (!post) {
    notFound();
  }

  // Convert markdown/simple content to HTML
  let contentHtml = post.content;
  try {
    const result = await remark().use(html).process(post.content);
    contentHtml = result.toString();
  } catch {
    // Fallback: just use the raw content
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-16">
      {/* Back button */}
      <Link
        href="/blog"
        className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-8"
      >
        ← 返回博客列表
      </Link>

      <article className="animate-fade-in-up">
        {/* Header */}
        <GlassCard className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">
            {post.title}
          </h1>

          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-400 mb-6">
            <span>{formatDate(post.created_at)}</span>
            <span>· {post.views || 0} 次阅读</span>
            {post.tags && post.tags.length > 0 && (
              <div className="flex gap-2">
                {post.tags.map((tag) => (
                  <span key={tag} className="glass-tag">
                    #{tag}
                  </span>
                ))}
              </div>
            )}
          </div>

          {post.cover_image && (
            <img
              src={post.cover_image}
              alt={post.title}
              className="w-full rounded-xl mb-6 max-h-96 object-cover"
            />
          )}
        </GlassCard>

        {/* Content */}
        <GlassCard>
          <div
            className="prose prose-invert max-w-none
              prose-headings:text-white
              prose-p:text-gray-300 prose-p:leading-relaxed
              prose-a:text-indigo-400 prose-a:no-underline hover:prose-a:underline
              prose-blockquote:border-indigo-500 prose-blockquote:text-gray-400
              prose-code:text-indigo-300 prose-code:bg-white/5 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded
              prose-pre:bg-black/30 prose-pre:border prose-pre:border-white/10
              prose-img:rounded-xl
              prose-strong:text-white"
            dangerouslySetInnerHTML={{ __html: contentHtml }}
          />
        </GlassCard>
      </article>
    </div>
  );
}

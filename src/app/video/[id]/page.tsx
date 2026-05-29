import { notFound } from "next/navigation";
import Link from "next/link";
import GlassCard from "@/components/GlassCard";
import { supabase } from "@/lib/supabase";

async function getVideo(id: string) {
  const { data } = await supabase
    .from("videos")
    .select("*")
    .eq("id", id)
    .single();

  return data;
}

export default async function VideoDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const video = await getVideo(id);

  if (!video) {
    notFound();
  }

  // Extract embed URL for different platforms
  function getEmbedUrl(url: string): string {
    if (url.includes("youtube.com") || url.includes("youtu.be")) {
      const match = url.match(
        /(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]+)/
      );
      if (match) return `https://www.youtube.com/embed/${match[1]}`;
    }
    if (url.includes("bilibili.com")) {
      const match = url.match(/\/video\/(BV[a-zA-Z0-9]+)/);
      if (match)
        return `https://player.bilibili.com/player.html?bvid=${match[1]}`;
    }
    return url;
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-16">
      <Link
        href="/video"
        className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-8"
      >
        ← 返回视频列表
      </Link>

      <div className="animate-fade-in-up">
        {/* Video Player */}
        <GlassCard className="p-1 mb-6 overflow-hidden">
          <div className="aspect-video rounded-xl overflow-hidden bg-black">
            <iframe
              src={getEmbedUrl(video.url)}
              title={video.title}
              className="w-full h-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        </GlassCard>

        {/* Info */}
        <GlassCard>
          <h1 className="text-2xl font-bold mb-2">{video.title}</h1>
          {video.description && (
            <p className="text-gray-400 mb-4">{video.description}</p>
          )}
          {video.tags && video.tags.length > 0 && (
            <div className="flex gap-2">
              {video.tags.map((tag: string) => (
                <span key={tag} className="glass-tag">
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </GlassCard>
      </div>
    </div>
  );
}

import Link from "next/link";
import GlassCard from "@/components/GlassCard";
import { supabase } from "@/lib/supabase";

async function getVideos() {
  const { data } = await supabase
    .from("videos")
    .select("*")
    .order("created_at", { ascending: false });

  return data || [];
}

export default async function VideoPage() {
  const videos = await getVideos();

  return (
    <div className="max-w-6xl mx-auto px-4 py-16">
      <div className="mb-12 animate-fade-in-up">
        <h1 className="text-4xl font-bold mb-4">视频</h1>
        <p className="text-gray-400">影像记录 · 精彩瞬间</p>
      </div>

      {videos.length === 0 ? (
        <GlassCard className="text-center py-20">
          <div className="text-5xl mb-4">🎬</div>
          <p className="text-gray-400 text-lg">还没有视频</p>
          <Link href="/admin" className="glass-btn inline-block mt-4">
            前往后台
          </Link>
        </GlassCard>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {videos.map((video) => (
            <Link key={video.id} href={`/video/${video.id}`}>
              <GlassCard hover className="group overflow-hidden p-0">
                <div className="aspect-video relative overflow-hidden">
                  {video.thumbnail_url ? (
                    <img
                      src={video.thumbnail_url}
                      alt={video.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-indigo-500/20 to-purple-500/20 flex items-center justify-center">
                      <span className="text-5xl">▶️</span>
                    </div>
                  )}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center transition-transform duration-300 group-hover:scale-110">
                      <svg className="w-8 h-8 text-white ml-1" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M8 5v14l11-7z" />
                      </svg>
                    </div>
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="font-semibold truncate">{video.title}</h3>
                  {video.description && (
                    <p className="text-sm text-gray-400 mt-1 line-clamp-1">
                      {video.description}
                    </p>
                  )}
                </div>
              </GlassCard>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

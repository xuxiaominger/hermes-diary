import Link from "next/link";
import GlassCard from "@/components/GlassCard";
import { supabase } from "@/lib/supabase";

export const dynamic = "force-dynamic";

async function getAlbums() {
  const { data } = await supabase
    .from("albums")
    .select("*, images:gallery_images(*)")
    .order("created_at", { ascending: false });

  return data || [];
}

export default async function GalleryPage() {
  const albums = await getAlbums();

  return (
    <div className="max-w-6xl mx-auto px-4 py-16">
      <div className="mb-12 animate-fade-in-up">
        <h1 className="text-4xl font-bold mb-4">图册</h1>
        <p className="text-gray-400">
          镜头下的世界 · 视觉故事
        </p>
      </div>

      {albums.length === 0 ? (
        <GlassCard className="text-center py-20">
          <div className="text-5xl mb-4">🖼️</div>
          <p className="text-gray-400 text-lg">还没有图册</p>
          <Link href="/admin/media" className="glass-btn inline-block mt-4">
            上传图片
          </Link>
        </GlassCard>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {albums.map((album) => (
            <Link key={album.id} href={`/gallery/${album.id}`}>
              <GlassCard hover className="group overflow-hidden p-0">
                <div className="aspect-[4/3] relative overflow-hidden">
                  {album.images && album.images.length > 0 ? (
                    <img
                      src={album.images[0].url}
                      alt={album.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                  ) : (
                    <div className="w-full h-full bg-white/5 flex items-center justify-center">
                      <span className="text-4xl">🖼️</span>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-4">
                    <h3 className="text-lg font-semibold text-white">
                      {album.title}
                    </h3>
                    <p className="text-sm text-gray-300 mt-1">
                      {album.images?.length || 0} 张照片
                    </p>
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

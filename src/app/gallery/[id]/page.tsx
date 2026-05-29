import { notFound } from "next/navigation";
import Link from "next/link";
import GlassCard from "@/components/GlassCard";
import { supabase } from "@/lib/supabase";

async function getAlbum(id: string) {
  const { data } = await supabase
    .from("albums")
    .select("*, images:gallery_images(*)")
    .eq("id", id)
    .single();

  return data;
}

export default async function AlbumPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const album = await getAlbum(id);

  if (!album) {
    notFound();
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-16">
      <Link
        href="/gallery"
        className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-8"
      >
        ← 返回图册
      </Link>

      <div className="mb-8 animate-fade-in-up">
        <h1 className="text-3xl font-bold mb-2">{album.title}</h1>
        {album.description && (
          <p className="text-gray-400">{album.description}</p>
        )}
      </div>

      {(!album.images || album.images.length === 0) ? (
        <GlassCard className="text-center py-16">
          <p className="text-gray-400">这个图册还没有照片</p>
        </GlassCard>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {album.images.map((image: { id: string; url: string; alt: string }) => (
            <a
              key={image.id}
              href={image.url}
              target="_blank"
              rel="noopener noreferrer"
              className="glass-card overflow-hidden group cursor-pointer p-1 hover:bg-white/[0.10] transition-all duration-300"
            >
              <div className="aspect-square relative overflow-hidden rounded-xl">
                <img
                  src={image.url}
                  alt={image.alt}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
              </div>
            </a>
          ))}
        </div>
      )}
    </div>
  );
}

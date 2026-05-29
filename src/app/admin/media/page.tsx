"use client";

import { useEffect, useState, useRef } from "react";
import GlassCard from "@/components/GlassCard";
import GlassButton from "@/components/GlassButton";
import { supabase, uploadFile } from "@/lib/supabase";

interface MediaItem {
  id: string;
  name: string;
  url: string;
  created_at: string;
  size: number;
  type: string;
}

export default function AdminMediaPage() {
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [albums, setAlbums] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [albumTitle, setAlbumTitle] = useState("");
  const [albumDesc, setAlbumDesc] = useState("");
  const [selectedAlbum, setSelectedAlbum] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    const [mediaRes, albumsRes] = await Promise.all([
      supabase.storage.from("images").list("gallery", { limit: 200 }),
      supabase.from("albums").select("*").order("created_at", { ascending: false }),
    ]);

    // Map storage items to URLs
    const items: MediaItem[] = (mediaRes.data || []).map((file: any) => {
      const { data: urlData } = supabase.storage
        .from("images")
        .getPublicUrl(`gallery/${file.name}`);
      return {
        id: file.name,
        name: file.name,
        url: urlData.publicUrl,
        created_at: file.created_at || "",
        size: file.metadata?.size || 0,
        type: file.metadata?.mimetype || "image/*",
      };
    });

    setMedia(items);
    setAlbums(albumsRes.data || []);
    setLoading(false);
  }

  async function handleUpload() {
    const files = fileInputRef.current?.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const ext = file.name.split(".").pop();
        const path = `gallery/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
        await uploadFile("images", path, file);
      }
      fileInputRef.current!.value = "";
      await loadData();
    } catch (err) {
      alert("上传失败: " + (err as Error).message);
    } finally {
      setUploading(false);
    }
  }

  async function createAlbum() {
    if (!albumTitle.trim()) return;

    const { error } = await supabase.from("albums").insert({
      title: albumTitle,
      description: albumDesc,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });

    if (error) {
      alert("创建失败: " + error.message);
    } else {
      setAlbumTitle("");
      setAlbumDesc("");
      await loadData();
    }
  }

  async function addToAlbum(imageUrl: string) {
    if (!selectedAlbum) {
      alert("请先选择一个图册");
      return;
    }

    const { error } = await supabase.from("gallery_images").insert({
      album_id: selectedAlbum,
      url: imageUrl,
      thumbnail_url: imageUrl,
      alt: "",
      width: 0,
      height: 0,
      created_at: new Date().toISOString(),
    });

    if (error) {
      alert("添加失败: " + error.message);
    }
  }

  async function deleteImage(name: string) {
    if (!confirm("确定要删除这张图片吗？")) return;

    const { error } = await supabase.storage.from("images").remove([`gallery/${name}`]);
    if (error) {
      alert("删除失败: " + error.message);
    } else {
      setMedia(media.filter((m) => m.id !== name));
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-8">媒体管理</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Upload */}
        <GlassCard>
          <h2 className="text-sm font-medium mb-4">上传图片</h2>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*"
            className="text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-medium file:bg-indigo-500/10 file:text-indigo-400 hover:file:bg-indigo-500/20 mb-4 w-full"
          />
          <GlassButton onClick={handleUpload} disabled={uploading}>
            {uploading ? "上传中..." : "上传"}
          </GlassButton>
        </GlassCard>

        {/* Create Album */}
        <GlassCard>
          <h2 className="text-sm font-medium mb-4">创建新图册</h2>
          <input
            type="text"
            value={albumTitle}
            onChange={(e) => setAlbumTitle(e.target.value)}
            className="glass-input mb-3"
            placeholder="图册名称"
          />
          <textarea
            value={albumDesc}
            onChange={(e) => setAlbumDesc(e.target.value)}
            className="glass-input resize-none h-20 mb-3"
            placeholder="图册描述（可选）"
          />
          <GlassButton onClick={createAlbum}>创建图册</GlassButton>
        </GlassCard>

        {/* Select Album */}
        <GlassCard>
          <h2 className="text-sm font-medium mb-4">添加到图册</h2>
          <select
            value={selectedAlbum}
            onChange={(e) => setSelectedAlbum(e.target.value)}
            className="glass-input mb-3"
          >
            <option value="">选择图册...</option>
            {albums.map((a) => (
              <option key={a.id} value={a.id}>
                {a.title}
              </option>
            ))}
          </select>
          <p className="text-xs text-gray-500">
            点击下方图片即可添加到所选图册
          </p>
        </GlassCard>
      </div>

      {/* Media Grid */}
      {loading ? (
        <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="skeleton aspect-square rounded-xl" />
          ))}
        </div>
      ) : media.length === 0 ? (
        <GlassCard className="text-center py-16">
          <p className="text-gray-400">还没有上传图片</p>
        </GlassCard>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {media.map((item) => (
            <div key={item.id} className="glass-card p-1 group relative overflow-hidden">
              <img
                src={item.url}
                alt={item.name}
                className="w-full aspect-square object-cover rounded-xl cursor-pointer"
                onClick={() => addToAlbum(item.url)}
              />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                <button
                  onClick={() => window.open(item.url, "_blank")}
                  className="p-1.5 rounded-lg bg-white/20 hover:bg-white/30"
                >
                  🔍
                </button>
                <button
                  onClick={() => deleteImage(item.id)}
                  className="p-1.5 rounded-lg bg-red-500/20 hover:bg-red-500/30"
                >
                  🗑️
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

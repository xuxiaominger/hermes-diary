"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import GlassCard from "@/components/GlassCard";
import GlassButton from "@/components/GlassButton";
import { supabase, uploadFile } from "@/lib/supabase";
import slugifyLib from "slugify";
import dynamic from "next/dynamic";

// Dynamically import SimpleMDE (no SSR)
const SimpleMDE = dynamic(() => import("react-simplemde-editor"), {
  ssr: false,
});
import "easymde/dist/easymde.min.css";

const mdeOptions = {
  autofocus: false,
  spellChecker: false,
  status: false,
  toolbar: [
    "bold",
    "italic",
    "heading",
    "|",
    "quote",
    "code",
    "unordered-list",
    "ordered-list",
    "|",
    "link",
    "image",
    "|",
    "preview",
    "guide",
  ] as const,
  minHeight: "400px",
};

export default function PostEditorPage() {
  const router = useRouter();
  const params = useParams();
  const postId = params?.id as string;
  const isNew = postId === "new";
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const editorRef = useRef<any>(null);

  const [form, setForm] = useState({
    title: "",
    slug: "",
    content: "",
    excerpt: "",
    cover_image: "",
    tags: "",
    published: false,
    sync_x: false,
    sync_wechat: false,
    sync_binance: false,
  });

  // Load existing post
  useEffect(() => {
    if (!isNew && postId) {
      supabase
        .from("posts")
        .select("*")
        .eq("id", postId)
        .single()
        .then(({ data }) => {
          if (data) {
            setForm({
              title: data.title || "",
              slug: data.slug || "",
              content: data.content || "",
              excerpt: data.excerpt || "",
              cover_image: data.cover_image || "",
              tags: (data.tags || []).join(", "),
              published: data.published || false,
              sync_x: data.sync_x || false,
              sync_wechat: data.sync_wechat || false,
              sync_binance: data.sync_binance || false,
            });
          }
        });
    }
  }, [isNew, postId]);

  // Auto-generate slug from title
  const handleTitleChange = useCallback(
    (value: string) => {
      setForm((f) => ({
        ...f,
        title: value,
        slug: isNew
          ? slugifyLib(value, { lower: true, strict: true }) || f.slug
          : f.slug,
      }));
    },
    [isNew]
  );

  // Handle image upload for cover
  const handleCoverUpload = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const ext = file.name.split(".").pop();
      const path = `posts/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
      const url = await uploadFile("images", path, file);
      setForm((f) => ({ ...f, cover_image: url }));
    } catch (err) {
      alert("上传失败: " + (err as Error).message);
    } finally {
      setUploading(false);
    }
  };

  // Handle image insert in editor (upload first, then insert markdown)
  const handleEditorImage = useCallback(async () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.onchange = async () => {
      const file = input.files?.[0];
      if (!file) return;

      try {
        const ext = file.name.split(".").pop();
        const path = `editor/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
        const url = await uploadFile("images", path, file);

        // Append markdown image syntax to content
        const imgMd = `![${file.name}](${url})`;
        setForm((f) => ({ ...f, content: f.content + "\n\n" + imgMd }));
      } catch (err) {
        alert("上传失败: " + (err as Error).message);
      }
    };
    input.click();
  }, []);

  // Custom toolbar button for image upload
  useEffect(() => {
    // We override the image button behavior
    const timer = setTimeout(() => {
      const imageBtn = document.querySelector(".editor-toolbar .fa-image")?.parentElement;
      if (imageBtn) {
        imageBtn.removeAttribute("onclick");
        imageBtn.addEventListener("click", (e) => {
          e.preventDefault();
          e.stopPropagation();
          handleEditorImage();
        });
      }
    }, 1000);
    return () => clearTimeout(timer);
  }, [handleEditorImage]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const tagsArray = form.tags
        .split(/[,，、]/)
        .map((t) => t.trim())
        .filter(Boolean);

      const postData = {
        title: form.title,
        slug:
          form.slug ||
          slugifyLib(form.title, { lower: true, strict: true }),
        content: form.content,
        excerpt:
          form.excerpt ||
          form.content.replace(/[#*`\[\]]/g, "").slice(0, 200),
        cover_image: form.cover_image || null,
        tags: tagsArray,
        published: form.published,
        sync_x: form.sync_x,
        sync_wechat: form.sync_wechat,
        sync_binance: form.sync_binance,
        updated_at: new Date().toISOString(),
      };

      if (isNew) {
        const { error } = await supabase.from("posts").insert({
          ...postData,
          created_at: new Date().toISOString(),
          views: 0,
          synced_x: false,
          synced_wechat: false,
          synced_binance: false,
        });

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("posts")
          .update(postData)
          .eq("id", postId);

        if (error) throw error;
      }

      router.push("/admin/posts");
    } catch (err) {
      alert("保存失败: " + (err as Error).message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">
          {isNew ? "写新文章" : "编辑文章"}
        </h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Title */}
        <GlassCard>
          <label className="block text-sm text-gray-400 mb-2">标题</label>
          <input
            type="text"
            value={form.title}
            onChange={(e) => handleTitleChange(e.target.value)}
            className="glass-input text-xl font-semibold"
            placeholder="输入文章标题..."
            required
          />
        </GlassCard>

        {/* Slug */}
        <GlassCard>
          <label className="block text-sm text-gray-400 mb-2">
            URL 别名
            <span className="text-xs ml-2 text-gray-500">
              (留空自动生成)
            </span>
          </label>
          <input
            type="text"
            value={form.slug}
            onChange={(e) =>
              setForm((f) => ({
                ...f,
                slug: slugifyLib(e.target.value, {
                  lower: true,
                  strict: true,
                }),
              }))
            }
            className="glass-input"
            placeholder="my-article-slug"
          />
          <p className="text-xs text-gray-500 mt-1">
            你的文章将位于 /blog/{form.slug || "your-slug"}
          </p>
        </GlassCard>

        {/* Content - Markdown Editor */}
        <GlassCard>
          <label className="block text-sm text-gray-400 mb-2">
            内容
            <span className="text-xs ml-2 text-gray-500">
              (支持 Markdown)
            </span>
          </label>
          <div className="rounded-xl overflow-hidden border border-white/10 [&_.EasyMDEContainer]:!border-0 [&_.editor-toolbar]:!bg-white/5 [&_.editor-toolbar]:!border-white/10 [&_.CodeMirror]:!bg-transparent [&_.CodeMirror]:!text-gray-200 [&_.editor-preview]:!bg-[#0a0a12] [&_.editor-preview]:!text-gray-200">
            {typeof window !== "undefined" && (
              <SimpleMDE
                value={form.content}
                onChange={(value: string) =>
                  setForm((f) => ({ ...f, content: value }))
                }
                options={mdeOptions}
              />
            )}
          </div>
          <div className="mt-2">
            <button
              type="button"
              onClick={handleEditorImage}
              className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors"
            >
              📷 上传图片插入到正文
            </button>
          </div>
        </GlassCard>

        {/* Excerpt */}
        <GlassCard>
          <label className="block text-sm text-gray-400 mb-2">
            摘要
            <span className="text-xs ml-2 text-gray-500">
              (留空自动从正文截取)
            </span>
          </label>
          <textarea
            value={form.excerpt}
            onChange={(e) =>
              setForm((f) => ({ ...f, excerpt: e.target.value }))
            }
            className="glass-input resize-none h-24"
            placeholder="文章摘要..."
          />
        </GlassCard>

        {/* Cover Image */}
        <GlassCard>
          <label className="block text-sm text-gray-400 mb-2">
            封面图片
          </label>
          {form.cover_image && (
            <div className="mb-3 relative">
              <img
                src={form.cover_image}
                alt="Cover"
                className="w-full h-48 object-cover rounded-xl"
              />
              <button
                type="button"
                onClick={() =>
                  setForm((f) => ({ ...f, cover_image: "" }))
                }
                className="absolute top-2 right-2 p-1.5 rounded-lg bg-black/50 text-white hover:bg-black/70"
              >
                ✕
              </button>
            </div>
          )}
          <input
            type="file"
            accept="image/*"
            onChange={handleCoverUpload}
            className="text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-medium file:bg-indigo-500/10 file:text-indigo-400 hover:file:bg-indigo-500/20"
          />
          {uploading && (
            <p className="text-sm text-gray-500 mt-2">上传中...</p>
          )}
          <p className="text-xs text-gray-500 mt-2">
            或直接粘贴图片 URL：
          </p>
          <input
            type="url"
            value={form.cover_image}
            onChange={(e) =>
              setForm((f) => ({ ...f, cover_image: e.target.value }))
            }
            className="glass-input mt-1"
            placeholder="https://..."
          />
        </GlassCard>

        {/* Tags */}
        <GlassCard>
          <label className="block text-sm text-gray-400 mb-2">
            标签
            <span className="text-xs ml-2 text-gray-500">
              (用逗号分隔)
            </span>
          </label>
          <input
            type="text"
            value={form.tags}
            onChange={(e) =>
              setForm((f) => ({ ...f, tags: e.target.value }))
            }
            className="glass-input"
            placeholder="商业, 法律, 思考"
          />
        </GlassCard>

        {/* Publish & Sync Settings */}
        <GlassCard>
          <h3 className="text-sm font-medium mb-4">发布设置</h3>
          <div className="space-y-3">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={form.published}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    published: e.target.checked,
                  }))
                }
                className="w-4 h-4 rounded border-gray-600 bg-white/5 text-indigo-500 focus:ring-indigo-500"
              />
              <span className="text-sm text-gray-300">立即发布</span>
            </label>

            <div className="border-t border-white/5 pt-3">
              <p className="text-xs text-gray-500 mb-2">同步到以下平台：</p>

              <label className="flex items-center gap-3 cursor-pointer mb-2">
                <input
                  type="checkbox"
                  checked={form.sync_x}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, sync_x: e.target.checked }))
                  }
                  className="w-4 h-4 rounded border-gray-600 bg-white/5 text-indigo-500"
                />
                <span className="text-sm text-gray-300">
                  同步到 𝕏 (Twitter)
                </span>
              </label>

              <label className="flex items-center gap-3 cursor-pointer mb-2">
                <input
                  type="checkbox"
                  checked={form.sync_wechat}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      sync_wechat: e.target.checked,
                    }))
                  }
                  className="w-4 h-4 rounded border-gray-600 bg-white/5 text-indigo-500"
                />
                <span className="text-sm text-gray-300">同步到微信公众号</span>
              </label>

              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.sync_binance}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      sync_binance: e.target.checked,
                    }))
                  }
                  className="w-4 h-4 rounded border-gray-600 bg-white/5 text-indigo-500"
                />
                <span className="text-sm text-gray-300">同步到币安广场</span>
              </label>
            </div>
          </div>
        </GlassCard>

        {/* Actions */}
        <div className="flex items-center gap-4 justify-end">
          <button
            type="button"
            onClick={() => router.back()}
            className="glass-btn-secondary"
          >
            取消
          </button>
          <GlassButton type="submit" disabled={saving}>
            {saving
              ? "保存中..."
              : isNew
              ? "创建文章"
              : "保存修改"}
          </GlassButton>
        </div>
      </form>
    </div>
  );
}

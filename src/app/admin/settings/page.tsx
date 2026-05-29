"use client";

import { useEffect, useState } from "react";
import GlassCard from "@/components/GlassCard";
import GlassButton from "@/components/GlassButton";
import { supabase } from "@/lib/supabase";

export default function AdminSettingsPage() {
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    site_name: "Hermes Diary",
    site_description: "记录商业与法律之路上的思考与见闻",
    author_name: "",
    author_bio: "",
    x_api_key: "",
    x_api_secret: "",
    wechat_app_id: "",
    wechat_app_secret: "",
    binance_api_key: "",
    binance_api_secret: "",
  });

  useEffect(() => {
    supabase
      .from("site_settings")
      .select("*")
      .single()
      .then(({ data }) => {
        if (data) {
          setForm((f) => ({ ...f, ...data }));
        }
      });
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const { error } = await supabase.from("site_settings").upsert(
        {
          ...form,
          id: 1,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "id" }
      );

      if (error) throw error;
      alert("设置已保存！");
    } catch (err) {
      alert("保存失败: " + (err as Error).message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold">系统设置</h1>
        <p className="text-gray-400 text-sm mt-1">管理网站信息和第三方平台配置</p>
      </div>

      <div className="space-y-6">
        {/* Site Info */}
        <GlassCard>
          <h2 className="text-sm font-medium mb-4 flex items-center gap-2">
            <span>🌐</span> 网站信息
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-gray-400 mb-1">网站名称</label>
              <input
                type="text"
                value={form.site_name}
                onChange={(e) =>
                  setForm((f) => ({ ...f, site_name: e.target.value }))
                }
                className="glass-input"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">网站描述</label>
              <textarea
                value={form.site_description}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    site_description: e.target.value,
                  }))
                }
                className="glass-input resize-none h-20"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">作者名称</label>
              <input
                type="text"
                value={form.author_name}
                onChange={(e) =>
                  setForm((f) => ({ ...f, author_name: e.target.value }))
                }
                className="glass-input"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">作者简介</label>
              <textarea
                value={form.author_bio}
                onChange={(e) =>
                  setForm((f) => ({ ...f, author_bio: e.target.value }))
                }
                className="glass-input resize-none h-20"
              />
            </div>
          </div>
        </GlassCard>

        {/* X/Twitter */}
        <GlassCard>
          <h2 className="text-sm font-medium mb-4 flex items-center gap-2">
            <span>𝕏</span> X (Twitter) 配置
          </h2>
          <p className="text-xs text-gray-500 mb-4">
            需要 Twitter Developer Portal 的 API Key 和 API Secret。
          </p>
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-gray-400 mb-1">
                API Key
              </label>
              <input
                type="text"
                value={form.x_api_key}
                onChange={(e) =>
                  setForm((f) => ({ ...f, x_api_key: e.target.value }))
                }
                className="glass-input"
                placeholder=""
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">
                API Secret
              </label>
              <input
                type="password"
                value={form.x_api_secret}
                onChange={(e) =>
                  setForm((f) => ({ ...f, x_api_secret: e.target.value }))
                }
                className="glass-input"
                placeholder=""
              />
            </div>
          </div>
        </GlassCard>

        {/* WeChat */}
        <GlassCard>
          <h2 className="text-sm font-medium mb-4 flex items-center gap-2">
            <span>💬</span> 微信公众号配置
          </h2>
          <p className="text-xs text-gray-500 mb-4">
            需要微信公众平台的 AppID 和 AppSecret。
          </p>
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-gray-400 mb-1">
                AppID
              </label>
              <input
                type="text"
                value={form.wechat_app_id}
                onChange={(e) =>
                  setForm((f) => ({ ...f, wechat_app_id: e.target.value }))
                }
                className="glass-input"
                placeholder="wx..."
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">
                AppSecret
              </label>
              <input
                type="password"
                value={form.wechat_app_secret}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    wechat_app_secret: e.target.value,
                  }))
                }
                className="glass-input"
                placeholder=""
              />
            </div>
          </div>
        </GlassCard>

        {/* Binance Square */}
        <GlassCard>
          <h2 className="text-sm font-medium mb-4 flex items-center gap-2">
            <span>📊</span> 币安广场配置
          </h2>
          <p className="text-xs text-gray-500 mb-4">
            需要币安 API Key 和 Secret。
          </p>
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-gray-400 mb-1">
                API Key
              </label>
              <input
                type="text"
                value={form.binance_api_key}
                onChange={(e) =>
                  setForm((f) => ({ ...f, binance_api_key: e.target.value }))
                }
                className="glass-input"
                placeholder=""
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">
                API Secret
              </label>
              <input
                type="password"
                value={form.binance_api_secret}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    binance_api_secret: e.target.value,
                  }))
                }
                className="glass-input"
                placeholder=""
              />
            </div>
          </div>
        </GlassCard>

        {/* Save */}
        <div className="flex justify-end">
          <GlassButton onClick={handleSave} disabled={saving}>
            {saving ? "保存中..." : "保存全部设置"}
          </GlassButton>
        </div>
      </div>
    </div>
  );
}

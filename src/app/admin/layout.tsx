"use client";

import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { HiOutlinePencil, HiOutlinePhotograph, HiOutlineVideoCamera, HiOutlineCog, HiOutlineHome, HiOutlineLogout, HiOutlineMenu, HiOutlineX, HiOutlineShare } from "react-icons/hi";

const adminLinks = [
  { href: "/admin", label: "概览", icon: HiOutlineHome },
  { href: "/admin/posts", label: "文章管理", icon: HiOutlinePencil },
  { href: "/admin/media", label: "媒体管理", icon: HiOutlinePhotograph },
  { href: "/admin/settings", label: "系统设置", icon: HiOutlineCog },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [session, setSession] = useState<boolean | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session: s } }: { data: { session: any } }) => {
      setSession(!!s);
      if (!s && !pathname.includes("/admin/login")) {
        router.push("/admin/login");
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event: any, s: any) => {
      setSession(!!s);
      if (!s && !pathname.includes("/admin/login")) {
        router.push("/admin/login");
      }
    });

    return () => subscription.unsubscribe();
  }, [pathname, router]);

  // Don't show admin layout on login page
  if (pathname.includes("/admin/login")) {
    return <>{children}</>;
  }

  if (session === null) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!session) return null;

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/admin/login");
  };

  return (
    <div className="min-h-screen bg-[#0a0a12]">
      {/* Mobile header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 glass-nav">
        <div className="flex items-center justify-between px-4 h-14">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="text-gray-300"
          >
            {sidebarOpen ? <HiOutlineX size={24} /> : <HiOutlineMenu size={24} />}
          </button>
          <span className="text-sm font-medium text-gray-300">管理后台</span>
          <div className="w-6" />
        </div>
      </div>

      {/* Sidebar overlay */}
      {sidebarOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 z-50 h-full w-64 transition-transform duration-300 lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="h-full glass-card rounded-none flex flex-col border-r border-white/5">
          {/* Logo */}
          <div className="p-6 border-b border-white/5">
            <Link href="/admin" className="flex items-center gap-2">
              <span className="text-xl">✦</span>
              <span className="font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
                Hermes Diary
              </span>
            </Link>
          </div>

          {/* Nav links */}
          <nav className="flex-1 p-4 space-y-1">
            {adminLinks.map((link) => {
              const Icon = link.icon;
              const isActive =
                link.href === "/admin"
                  ? pathname === "/admin"
                  : pathname.startsWith(link.href);

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                    isActive
                      ? "bg-indigo-500/10 text-indigo-400"
                      : "text-gray-400 hover:text-white hover:bg-white/5"
                  }`}
                >
                  <Icon size={20} />
                  {link.label}
                </Link>
              );
            })}
          </nav>

          {/* Bottom actions */}
          <div className="p-4 border-t border-white/5 space-y-2">
            <Link
              href="/"
              className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm text-gray-400 hover:text-white hover:bg-white/5 transition-all"
            >
              <HiOutlineHome size={20} />
              返回网站
            </Link>
            <button
              onClick={() => { navigator.clipboard.writeText(window.location.origin); alert("网站链接已复制！"); }}
              className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm text-gray-400 hover:text-white hover:bg-white/5 transition-all w-full"
            >
              <HiOutlineShare size={20} />
              分享网站
            </button>
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm text-red-400 hover:text-red-300 hover:bg-red-500/5 transition-all w-full"
            >
              <HiOutlineLogout size={20} />
              退出登录
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="lg:ml-64 pt-14 lg:pt-0 min-h-screen">
        <div className="p-6 lg:p-8">{children}</div>
      </main>
    </div>
  );
}

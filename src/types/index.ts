// ===== Core Content Types =====

export interface Post {
  id: string
  title: string
  slug: string
  content: string // markdown
  excerpt: string
  cover_image: string | null
  tags: string[]
  published: boolean
  created_at: string
  updated_at: string
  sync_x: boolean
  sync_wechat: boolean
  sync_binance: boolean
  synced_x: boolean
  synced_wechat: boolean
  synced_binance: boolean
  views: number
}

export interface Album {
  id: string
  title: string
  description: string
  cover_image: string | null
  created_at: string
  updated_at: string
  images: GalleryImage[]
}

export interface GalleryImage {
  id: string
  album_id: string
  url: string
  thumbnail_url: string
  alt: string
  width: number
  height: number
  created_at: string
}

export interface Video {
  id: string
  title: string
  description: string
  url: string // embed URL or upload URL
  thumbnail_url: string | null
  platform: 'youtube' | 'bilibili' | 'upload'
  duration: number
  created_at: string
  updated_at: string
  views: number
  tags: string[]
}

export interface SiteSettings {
  site_name: string
  site_description: string
  author_name: string
  author_bio: string
  avatar_url: string | null
  x_api_key: string
  x_api_secret: string
  wechat_app_id: string
  wechat_app_secret: string
  binance_api_key: string
  binance_api_secret: string
  theme: 'dark' | 'light'
}

// ===== API Types =====

export type ApiResponse<T = unknown> = {
  success: boolean
  data?: T
  error?: string
}

export type PaginatedResponse<T> = ApiResponse<{
  items: T[]
  total: number
  page: number
  limit: number
}>

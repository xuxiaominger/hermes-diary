// ===== Local File System Supabase Mock =====
// This persists all data to a local JSON file on the server
// No external database required - works offline, fast, reliable

import fs from "fs";
import path from "path";

const DB_DIR = path.join(process.env.HOME || "/tmp", ".hermes-diary");
const DB_FILE = path.join(DB_DIR, "database.json");
const STORAGE_DIR = path.join(DB_DIR, "storage");

// ===== Server-side data store =====
class ServerStore {
  private data: any = null;
  private dirty = false;

  constructor() {
    this.load();
  }

  private load() {
    try {
      if (!fs.existsSync(DB_DIR)) fs.mkdirSync(DB_DIR, { recursive: true });
      if (!fs.existsSync(STORAGE_DIR)) fs.mkdirSync(STORAGE_DIR, { recursive: true });
      if (fs.existsSync(DB_FILE)) {
        this.data = JSON.parse(fs.readFileSync(DB_FILE, "utf-8"));
      } else {
        this.data = {
          posts: [],
          albums: [],
          gallery_images: [],
          videos: [],
          site_settings: [],
        };
        this.save();
      }
    } catch {
      this.data = {
        posts: [],
        albums: [],
        gallery_images: [],
        videos: [],
        site_settings: [],
      };
    }
  }

  save() {
    try {
      fs.writeFileSync(DB_FILE, JSON.stringify(this.data, null, 2), "utf-8");
    } catch {}
  }

  private table(name: string): any[] {
    if (!this.data[name]) this.data[name] = [];
    return this.data[name];
  }

  private genId(): string {
    return Math.random().toString(36).substring(2, 15);
  }

  query(table: string) {
    return new ServerQuery(this.table(table), this);
  }

  insert(table: string, data: any) {
    const items = this.table(table);
    const id = data.id || this.genId();
    const item = {
      ...data,
      id,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    items.push(item);
    this.dirty = true;
    this.save();
    return item;
  }

  update(table: string, id: string, updates: any) {
    const items = this.table(table);
    const idx = items.findIndex((item: any) => item.id === id);
    if (idx !== -1) {
      items[idx] = { ...items[idx], ...updates, updated_at: new Date().toISOString() };
      this.dirty = true;
      this.save();
    }
  }

  delete(table: string, id: string) {
    const items = this.table(table);
    const idx = items.findIndex((item: any) => item.id === id);
    if (idx !== -1) {
      items.splice(idx, 1);
      this.dirty = true;
      this.save();
    }
  }

  upsert(table: string, data: any) {
    const items = this.table(table);
    const idx = items.findIndex((item: any) => item.id === data.id);
    if (idx !== -1) {
      items[idx] = { ...items[idx], ...data, updated_at: new Date().toISOString() };
    } else {
      const id = data.id || this.genId();
      items.push({
        ...data,
        id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });
    }
    this.dirty = true;
    this.save();
  }

  getTable(table: string): any[] {
    return this.table(table);
  }

  // File storage
  saveFile(filename: string, buffer: Buffer): string {
    const filePath = path.join(STORAGE_DIR, filename);
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(filePath, buffer);
    return `/api/files/${filename}`;
  }

  getFile(filename: string): Buffer | null {
    const filePath = path.join(STORAGE_DIR, filename);
    if (fs.existsSync(filePath)) {
      return fs.readFileSync(filePath);
    }
    return null;
  }

  listFiles(prefix: string = ""): string[] {
    if (!fs.existsSync(STORAGE_DIR)) return [];
    const all = fs.readdirSync(STORAGE_DIR, { recursive: true }) as string[];
    return all.filter((f) => f.startsWith(prefix));
  }

  deleteFile(filename: string) {
    const filePath = path.join(STORAGE_DIR, filename);
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
  }
}

// ===== Server-side Query Builder =====
class ServerQuery {
  private data: any[];
  private store: ServerStore;
  private filters: any[] = [];
  private orderField = "created_at";
  private orderDir = -1; // desc
  private limitCount = 0;
  private offsetCount = 0;
  private isSingle = false;

  constructor(data: any[], store: ServerStore) {
    this.data = data;
    this.store = store;
  }

  clone(): ServerQuery {
    const q = new ServerQuery(this.data, this.store);
    q.filters = [...this.filters];
    q.orderField = this.orderField;
    q.orderDir = this.orderDir;
    q.limitCount = this.limitCount;
    q.offsetCount = this.offsetCount;
    q.isSingle = this.isSingle;
    return q;
  }

  select(_columns?: string, opts?: any) {
    if (opts?.count === "exact" || opts?.head) {
      return {
        then: (resolve: any) => resolve({ data: [], count: this.data.length, error: null }),
      };
    }
    return this.clone();
  }

  eq(field: string, value: any) {
    const q = this.clone();
    q.filters.push((item: any) => item[field] === value);
    return q;
  }

  contains(field: string, values: any[]) {
    const q = this.clone();
    q.filters.push((item: any) => {
      const arr = item[field] || [];
      return values.some((v) => arr.includes(v));
    });
    return q;
  }

  order(field: string, opts?: { ascending?: boolean }) {
    const q = this.clone();
    q.orderField = field;
    q.orderDir = opts?.ascending ? 1 : -1;
    return q;
  }

  limit(n: number) {
    const q = this.clone();
    q.limitCount = n;
    return q;
  }

  range(from: number, to: number) {
    const q = this.clone();
    q.offsetCount = from;
    q.limitCount = to - from + 1;
    return q;
  }

  single() {
    const q = this.clone();
    q.isSingle = true;
    return q;
  }

  async then(resolve: any, reject?: any) {
    try {
      let result = [...this.data];

      // Apply filters
      for (const filter of this.filters) {
        result = result.filter(filter);
      }

      // Order
      const dir = this.orderDir;
      result.sort((a: any, b: any) => {
        if (a[this.orderField] > b[this.orderField]) return dir;
        if (a[this.orderField] < b[this.orderField]) return -dir;
        return 0;
      });

      const total = result.length;

      // Offset/limit
      if (this.offsetCount > 0 || this.limitCount > 0) {
        const start = this.offsetCount;
        const end = this.limitCount ? start + this.limitCount : result.length;
        result = result.slice(start, end);
      }

      if (this.isSingle) {
        if (result.length === 0) {
          resolve({ data: null, error: new Error("Not found"), count: 0 });
          return;
        }
        resolve({ data: result[0], error: null, count: total });
        return;
      }

      resolve({ data: result, error: null, count: total });
    } catch (e) {
      if (reject) reject(e);
      else resolve({ data: [], error: e, count: 0 });
    }
  }
}

// ===== Singleton =====
let _store: ServerStore | null = null;

function getStore(): ServerStore {
  if (!_store) _store = new ServerStore();
  return _store;
}

// ===== Export an API-compatible client =====
export const serverDb = {
  from: (table: string) => ({
    select: (columns?: string, opts?: any) => getStore().query(table).select(columns, opts),
    insert: (data: any) => {
      const item = getStore().insert(table, data);
      return {
        select: () => ({
          single: async () => ({ data: item, error: null }),
        }),
      };
    },
    update: (updates: any) => ({
      eq: async (field: string, value: any) => {
        if (field === "id") getStore().update(table, value, updates);
        return { error: null };
      },
    }),
    delete: () => ({
      eq: async (field: string, value: any) => {
        if (field === "id") getStore().delete(table, value);
        return { error: null };
      },
    }),
    upsert: async (data: any) => {
      getStore().upsert(table, data);
      return { error: null };
    },
  }),
  storage: {
    from: (_bucket: string) => ({
      upload: async (path: string, _file: any) => {
        // For server-side uploads, we handle this via the upload API
        return { data: { path }, error: null };
      },
      getPublicUrl: (path: string) => ({
        data: { publicUrl: `/api/files/${path}` },
      }),
      list: async (_folder: string) => ({
        data: getStore().listFiles(_folder).map((name) => ({
          name,
          id: name,
          created_at: new Date().toISOString(),
        })),
        error: null,
      }),
      remove: async (paths: string[]) => {
        for (const p of paths) getStore().deleteFile(p);
        return { error: null };
      },
    }),
  },
  auth: {
    getSession: async () => {
      return { data: { session: null }, error: null };
    },
    onAuthStateChange: (_callback: any) => ({
      data: { subscription: { unsubscribe: () => {} } },
    }),
    signInWithPassword: async ({ password }: { password: string }) => {
      if (password === "hermes2026") {
        return { error: null };
      }
      return { error: new Error("密码错误") };
    },
    signOut: async () => {
      return { error: null };
    },
  },
};

// ===== Local Storage Supabase Mock =====
// This provides a working in-memory database for local development
// When Supabase env vars are not configured

const STORAGE_KEY = "hermes_db";
const DB_DIR = typeof process !== "undefined" && process.env?.HOME ? process.env.HOME + "/.hermes-diary" : "/tmp/.hermes-diary";
const DB_FILE = DB_DIR + "/database.json";

function ensureDir() {
  if (typeof window === "undefined") {
    try {
      const fs = require("fs");
      if (!fs.existsSync(DB_DIR)) fs.mkdirSync(DB_DIR, { recursive: true });
    } catch {}
  }
}

function readFileDB(): any {
  try {
    const fs = require("fs");
    ensureDir();
    if (fs.existsSync(DB_FILE)) {
      return JSON.parse(fs.readFileSync(DB_FILE, "utf-8"));
    }
  } catch {}
  return null;
}

function writeFileDB(db: any) {
  try {
    const fs = require("fs");
    ensureDir();
    fs.writeFileSync(DB_FILE, JSON.stringify(db), "utf-8");
  } catch {}
}

const EMPTY_DB = { posts: [], albums: [], gallery_images: [], videos: [], site_settings: {} };

function getDB(): any {
  // Server side: read from JSON file
  if (typeof window === "undefined") {
    const filedb = readFileDB();
    if (filedb) return filedb;
    // Initialize empty DB
    writeFileDB(EMPTY_DB);
    return { ...EMPTY_DB };
  }
  // Client side: read from localStorage
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) return JSON.parse(saved);
  } catch {}
  return { ...EMPTY_DB };
}

function saveDB(db: any) {
  // Server side: save to JSON file
  if (typeof window === "undefined") {
    writeFileDB(db);
    return;
  }
  // Client side: save to localStorage
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(db));
  } catch {}
}

function genId(): string {
  return Math.random().toString(36).substring(2, 15);
}

// ===== Mock Query Builder =====
class MockQuery {
  private table: string;
  private filters: any[] = [];
  private orderField = "created_at";
  private orderDir = "desc";
  private limitCount = 0;
  private offsetCount = 0;
  private isSingle = false;
  private isCountOnly = false;

  constructor(table: string) {
    this.table = table;
  }

  private getData(): any[] {
    const db = getDB();
    return db[this.table] || [];
  }

  clone(): MockQuery {
    const q = new MockQuery(this.table);
    q.filters = [...this.filters];
    q.orderField = this.orderField;
    q.orderDir = this.orderDir;
    q.limitCount = this.limitCount;
    q.offsetCount = this.offsetCount;
    q.isSingle = this.isSingle;
    q.isCountOnly = this.isCountOnly;
    return q;
  }

  select(_columns?: string, opts?: any) {
    if (opts?.count === "exact" || opts?.head) {
      this.isCountOnly = true;
      return this.clone();
    }
    return this.clone();
  }

  eq(field: string, value: any) {
    const q = this.clone();
    q.filters.push({ op: "eq", field, value });
    return q;
  }

  contains(field: string, values: any[]) {
    const q = this.clone();
    q.filters.push({ op: "contains", field, values });
    return q;
  }

  order(field: string, opts?: { ascending?: boolean }) {
    const q = this.clone();
    q.orderField = field;
    q.orderDir = opts?.ascending ? "asc" : "desc";
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
      let data = [...this.getData()];

      // Apply filters
      for (const f of this.filters) {
        if (f.op === "eq") {
          data = data.filter((item: any) => item[f.field] === f.value);
        } else if (f.op === "contains") {
          data = data.filter((item: any) => {
            const arr = item[f.field] || [];
            return f.values.some((v: any) => arr.includes(v));
          });
        }
      }

      // Apply ordering
      const dir = this.orderDir === "desc" ? -1 : 1;
      data.sort((a: any, b: any) => {
        if (a[this.orderField] > b[this.orderField]) return dir;
        if (a[this.orderField] < b[this.orderField]) return -dir;
        return 0;
      });

      const total = data.length;

      // Apply limit/offset
      if (this.offsetCount > 0 || this.limitCount > 0) {
        const start = this.offsetCount;
        const end = this.limitCount ? start + this.limitCount : data.length;
        data = data.slice(start, end);
      }

      if (this.isSingle) {
        if (data.length === 0) {
          resolve({ data: null, error: new Error("Not found"), count: 0 });
          return;
        }
        resolve({ data: data[0], error: null, count: total });
        return;
      }

      resolve({ data, error: null, count: total });
    } catch (e) {
      if (reject) reject(e);
      else resolve({ data: [], error: e, count: 0 });
    }
  }
}

// ===== Mock Storage =====
class MockStorage {
  private bucket: string;
  private files: any = {};

  constructor(bucket: string) {
    this.bucket = bucket;
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem(`hermes_storage_${bucket}`);
        if (saved) this.files = JSON.parse(saved);
      } catch {}
    }
  }

  private save() {
    if (typeof window !== "undefined") {
      localStorage.setItem(`hermes_storage_${this.bucket}`, JSON.stringify(this.files));
    }
  }

  async upload(path: string, file: File | Blob) {
    return new Promise<{ data: any; error: any }>((resolve) => {
      const reader = new FileReader();
      reader.onload = () => {
        const base64 = reader.result as string;
        this.files[path] = {
          name: path.split("/").pop(),
          url: base64,
          metadata: { size: file.size, mimetype: file.type },
          created_at: new Date().toISOString(),
        };
        this.save();
        resolve({ data: { path, fullPath: path }, error: null });
      };
      reader.onerror = () => resolve({ data: null, error: new Error("Failed to read file") });
      reader.readAsDataURL(file);
    });
  }

  getPublicUrl(path: string) {
    const file = this.files[path];
    return { data: { publicUrl: file?.url || "" } };
  }

  async list(_folder: string, _opts?: any) {
    const items = Object.entries(this.files).map(([path, info]: any) => ({
      name: path.split("/").pop(),
      created_at: info.created_at,
      metadata: info.metadata,
      id: path,
    }));
    return { data: items, error: null };
  }

  async remove(paths: string[]) {
    for (const p of paths) {
      delete this.files[p];
    }
    this.save();
    return { error: null };
  }
}

// ===== Mock Auth =====
class MockAuth {
  async getSession() {
    const loggedIn = typeof window !== "undefined" && localStorage.getItem("hermes_admin") === "true";
    return {
      data: {
        session: loggedIn
          ? { user: { id: "local-admin", email: "admin@local.dev" }, access_token: "local-token" }
          : null,
      },
      error: null,
    };
  }

  onAuthStateChange(callback: (event: string, session: any) => void) {
    return {
      data: { subscription: { unsubscribe: () => {} } },
    };
  }

  async signInWithPassword({ email, password }: { email: string; password: string }) {
    if (password === "hermes2026" || email === "admin@local.dev") {
      if (typeof window !== "undefined") localStorage.setItem("hermes_admin", "true");
      return { error: null };
    }
    return { error: new Error("密码错误") };
  }

  async signOut() {
    if (typeof window !== "undefined") localStorage.setItem("hermes_admin", "false");
    return { error: null };
  }
}

// ===== Mock Insert =====
class MockInsertBuilder {
  private table: string;
  private data: any;

  constructor(table: string, data: any) {
    this.table = table;
    this.data = data;
  }

  select(_columns?: string) {
    return {
      single: async () => {
        const db = getDB();
        if (!db[this.table]) db[this.table] = [];
        const id = this.data.id || genId();
        const item = {
          ...this.data,
          id,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
        db[this.table].push(item);
        saveDB(db);
        return { data: item, error: null };
      },
      then: async (resolve: any) => {
        const db = getDB();
        if (!db[this.table]) db[this.table] = [];
        const id = this.data.id || genId();
        const item = { ...this.data, id, created_at: new Date().toISOString() };
        db[this.table].push(item);
        saveDB(db);
        resolve({ data: [item], error: null });
      },
    };
  }
}

// ===== Mock Update =====
const createMockUpdate = (table: string, updates: any) => ({
  eq: async (field: string, value: any) => {
    if (field === "id") {
      const db = getDB();
      const idx = db[table]?.findIndex((item: any) => item.id === value) ?? -1;
      if (idx !== -1) {
        db[table][idx] = { ...db[table][idx], ...updates, updated_at: new Date().toISOString() };
        saveDB(db);
      }
    }
    return { error: null };
  },
});

// ===== Mock Delete =====
const createMockDelete = (table: string) => ({
  eq: async (field: string, value: any) => {
    if (field === "id") {
      const db = getDB();
      db[table] = (db[table] || []).filter((item: any) => item.id !== value);
      saveDB(db);
    }
    return { error: null };
  },
});

// ===== Main Mock Client =====
const mockClient = {
  from: (table: string) => ({
    select: (columns?: string, opts?: any) => new MockQuery(table).select(columns, opts),
    insert: (data: any) => new MockInsertBuilder(table, data),
    update: (updates: any) => createMockUpdate(table, updates),
    delete: () => createMockDelete(table),
    upsert: async (data: any) => {
      const db = getDB();
      const idx = db[table]?.findIndex((item: any) => item.id === data.id) ?? -1;
      if (idx !== -1) {
        db[table][idx] = { ...db[table][idx], ...data };
      } else {
        if (!db[table]) db[table] = [];
        db[table].push({ ...data, id: data.id || genId() });
      }
      saveDB(db);
      return { error: null };
    },
  }),
  storage: {
    from: (bucket: string) => new MockStorage(bucket),
  },
  auth: new MockAuth(),
};

// ===== Supabase Connection Check =====
// We probe the REST API to see if tables exist.
// If not, we gracefully fall back to localStorage mock.
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const isConfigured = !!(url && anonKey && !anonKey.includes("lder"));

let realClient: any = null;
let useMock = !isConfigured; // Start with mock if not configured
let checkDone = false;

async function ensureBackend(): Promise<void> {
  if (checkDone) return;
  checkDone = true;

  if (!isConfigured || typeof window === "undefined") {
    useMock = true;
    return;
  }

  try {
    const res = await fetch(`${url}/rest/v1/posts?limit=1`, {
      headers: {
        apikey: anonKey!,
        Authorization: `Bearer ${anonKey!}`,
      },
    });
    if (res.status === 200) {
      // Tables exist! Use real Supabase
      const { createClient } = require("@supabase/supabase-js");
      realClient = createClient(url!, anonKey!, {
        auth: { persistSession: true, autoRefreshToken: true },
      });
      useMock = false;
    } else {
      useMock = true; // 404 = tables missing, fall back
    }
  } catch {
    useMock = true;
  }
}

// Pre-initialize immediately
if (typeof window !== "undefined") {
  ensureBackend();
}

function getClient(): any {
  return useMock || typeof window === "undefined" ? mockClient : realClient;
}

export const supabase = new Proxy({} as any, {
  get(_target, prop) {
    return getClient()[prop];
  },
});

// ===== Helper: Upload file =====
export async function uploadFile(
  bucket: string,
  path: string,
  file: File | Blob
): Promise<string> {
  if (useMock) {
    const storage = new MockStorage(bucket);
    const { data, error } = await storage.upload(path, file);
    if (error) throw error;
    const { data: urlData } = storage.getPublicUrl(data.path);
    return urlData.publicUrl;
  }

  const { data, error } = await realClient.storage.from(bucket).upload(path, file, {
    cacheControl: "3600",
    upsert: true,
  });
  if (error) throw error;
  const { data: urlData } = realClient.storage.from(bucket).getPublicUrl(data.path);
  return urlData.publicUrl;
}

export async function deleteFile(bucket: string, path: string) {
  const { error } = await getClient().storage.from(bucket).remove([path]);
  if (error) throw error;
}

export function isSupabaseConfigured(): boolean {
  return Boolean(url && anonKey && !useMock);
}

// Force re-check (call after migration runs in admin)
export async function reconnectSupabase(): Promise<void> {
  checkDone = false;
  useMock = !isConfigured;
  realClient = null;
  await ensureBackend();
}

// Run SQL migration against Supabase (used from admin panel)
export async function runMigration(sql: string): Promise<{ success: boolean; error?: string }> {
  try {
    // Use the Supabase Service Role API to run SQL
    // We'll call a server-side API endpoint
    const res = await fetch("/api/migrate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sql }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Migration failed");
    return { success: true };
  } catch (err) {
    return { success: false, error: (err as Error).message };
  }
}

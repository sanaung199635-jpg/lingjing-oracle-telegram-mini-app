import { createClient } from "@supabase/supabase-js";

type SupabaseRequestLog = {
  url: string;
  method: string;
};

type CreateAdminClientOptions = {
  onRequest?: (request: SupabaseRequestLog) => void;
};

export function createAdminClient(options: CreateAdminClientOptions = {}) {
  const url = normalizeSupabaseUrl(process.env.NEXT_PUBLIC_SUPABASE_URL);
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceRoleKey) {
    return null;
  }

  return createClient(url, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    },
    db: {
      schema: "public"
    },
    global: options.onRequest
      ? {
          fetch: async (input, init) => {
            const requestUrl = getRequestUrl(input);
            options.onRequest?.({
              url: requestUrl,
              method: init?.method || "GET"
            });
            return fetch(input, init);
          }
        }
      : undefined
  });
}

export function getSupabaseAdminUrlForLog() {
  return normalizeSupabaseUrl(process.env.NEXT_PUBLIC_SUPABASE_URL);
}

function normalizeSupabaseUrl(url?: string) {
  if (!url) return null;

  const trimmed = url.trim().replace(/^['"]|['"]$/g, "");
  return trimmed.replace(/\/rest\/v1\/?$/i, "").replace(/\/+$/, "");
}

function getRequestUrl(input: string | URL | Request) {
  if (typeof input === "string") return input;
  if (input instanceof URL) return input.toString();
  return input.url;
}

export function getAdminEmails() {
  return (process.env.ADMIN_EMAILS || "")
    .split(",")
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);
}

export function isAdminEmail(email?: string | null) {
  if (!email) return false;
  return getAdminEmails().includes(email.toLowerCase());
}

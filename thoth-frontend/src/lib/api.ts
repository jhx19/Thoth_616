// Typed client for the Thoth backend (FastAPI, /api/v1).
// Base URL comes from NEXT_PUBLIC_API_BASE_URL; bearer token from
// NEXT_PUBLIC_BENCHMARK_API_KEY. Both are exposed to the browser.

// `||` (not `??`) so an empty-string env value also falls back to the default.
const BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000/api/v1";
const API_KEY = process.env.NEXT_PUBLIC_BENCHMARK_API_KEY || "";

export type EntryStatus =
  | "draft"
  | "in_progress"
  | "sme_approved"
  | "approved"
  | "rejected"
  | "completed";

export type KnowledgeSources = {
  interviews: string[];
  materials: string[];
};

export type KnowledgeEntry = {
  entry_id: string;
  sme_id: string;
  topic: string;
  status: EntryStatus;
  content: string;
  sources: KnowledgeSources;
  created_at: string;
  updated_at: string;
};

export type SME = {
  sme_id: string;
  name: string;
  specialization: string;
  sub_areas: string[];
  contact_email: string;
  role: string | null;
  department: string | null;
  responsible_products: string[] | null;
  sub_expertise: string[] | null;
  created_at: string;
};

export type AdminApproveResponse = {
  entry_id: string;
  status: EntryStatus;
  admin_approved_at: string;
};

export type RejectResponse = {
  entry_id: string;
  status: EntryStatus;
  rejected_at: string;
};

export type InterviewTurnRequest = {
  answer?: string;
  [key: string]: unknown;
};

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
    public body?: unknown,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

async function request<T>(
  path: string,
  init: RequestInit & { query?: Record<string, string | undefined> } = {},
): Promise<T> {
  const { query, headers, ...rest } = init;
  const url = new URL(`${BASE_URL}${path}`);
  if (query) {
    for (const [k, v] of Object.entries(query)) {
      if (v !== undefined) url.searchParams.set(k, v);
    }
  }

  const res = await fetch(url.toString(), {
    ...rest,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${API_KEY}`,
      ...headers,
    },
  });

  if (!res.ok) {
    let body: unknown;
    try {
      body = await res.json();
    } catch {
      body = await res.text();
    }
    const detail =
      typeof body === "object" && body && "detail" in body
        ? String((body as { detail: unknown }).detail)
        : res.statusText;
    throw new ApiError(res.status, detail, body);
  }

  if (res.status === 204) return undefined as T;
  return (await res.json()) as T;
}

// ─── Knowledge ─────────────────────────────────────────────────────────

export function listKnowledge(params: { status?: EntryStatus } = {}) {
  return request<{ entries: KnowledgeEntry[] }>("/knowledge", {
    method: "GET",
    query: { status: params.status },
  });
}

export function adminApproveKnowledge(entryId: string) {
  return request<AdminApproveResponse>(
    `/knowledge/${encodeURIComponent(entryId)}/admin-approve`,
    { method: "POST" },
  );
}

export function rejectKnowledge(entryId: string, reason: string) {
  return request<RejectResponse>(
    `/knowledge/${encodeURIComponent(entryId)}/reject`,
    {
      method: "POST",
      body: JSON.stringify({ reason }),
    },
  );
}

// ─── SMEs ──────────────────────────────────────────────────────────────

export function listSmes() {
  return request<{ smes: SME[] }>("/smes", { method: "GET" });
}

export function getSme(smeId: string) {
  return request<SME>(`/smes/${encodeURIComponent(smeId)}`, { method: "GET" });
}

// ─── Interviews (stubs on the backend — Person C) ──────────────────────

export function createInterview(smeId: string) {
  return request<unknown>(
    `/smes/${encodeURIComponent(smeId)}/interviews`,
    { method: "POST" },
  );
}

export function addInterviewTurn(
  interviewId: string,
  body: InterviewTurnRequest = {},
) {
  return request<unknown>(
    `/interviews/${encodeURIComponent(interviewId)}/turns`,
    {
      method: "POST",
      body: JSON.stringify(body),
    },
  );
}

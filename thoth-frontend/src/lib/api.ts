// Typed client for the Thoth backend. All calls use the Next.js same-origin
// proxy at /api/proxy/* — the server injects Authorization (see
// src/app/api/proxy/[...path]/route.ts). Interview routes use /interviews/*
// at the FastAPI app root; the proxy forwards those to API_UPSTREAM_ROOT.

const BASE_URL = "/api/proxy";

export type EntryStatus =
  | "draft"
  | "in_progress"
  | "sme_approved"
  | "approved"
  | "rejected"
  | "completed";

export type ChatMessage =
  | { role: "user"; content: string }
  | {
      role: "ai";
      type: "answer";
      content: string;
      source: { title: string; approved_by: string; reviewed: string };
    }
  | { role: "ai"; type: "clarification"; content: string; chips: string[] }
  | {
      role: "ai";
      type: "routing";
      content: string;
      smes: {
        name: string;
        specialization: string;
        reason: string;
        email: string;
      }[];
    }
  | { role: "sme"; sme_name: string; content: string };

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
  rejection_reason?: string | null;
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

export type SmeApproveResponse = {
  entry_id: string;
  status: EntryStatus;
  approved_at: string;
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

function buildUrl(
  path: string,
  query?: Record<string, string | undefined>,
): string {
  let url = `${BASE_URL}${path}`;
  if (query) {
    const params = new URLSearchParams();
    for (const [k, v] of Object.entries(query)) {
      if (v !== undefined) params.set(k, v);
    }
    const qs = params.toString();
    if (qs) url += `?${qs}`;
  }
  return url;
}

async function request<T>(
  path: string,
  init: RequestInit & { query?: Record<string, string | undefined> } = {},
): Promise<T> {
  const { query, headers, ...rest } = init;
  const res = await fetch(buildUrl(path, query), {
    ...rest,
    headers: {
      "Content-Type": "application/json",
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

export function listKnowledge(params: { status?: EntryStatus } = {}) {
  return request<{ entries: KnowledgeEntry[] }>("/knowledge", {
    method: "GET",
    query: { status: params.status },
  });
}

export function getKnowledge(entryId: string) {
  return request<KnowledgeEntry>(`/knowledge/${encodeURIComponent(entryId)}`, {
    method: "GET",
  });
}

export function updateKnowledgeContent(entryId: string, content: string) {
  return request<KnowledgeEntry>(`/knowledge/${encodeURIComponent(entryId)}`, {
    method: "PUT",
    body: JSON.stringify({ content }),
  });
}

export function smeApproveKnowledge(entryId: string) {
  return request<SmeApproveResponse>(
    `/knowledge/${encodeURIComponent(entryId)}/approve`,
    { method: "POST" },
  );
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

export type SmeCreateRequest = {
  name: string;
  specialization: string;
  sub_areas: string[];
  contact_email: string;
  role?: string;
  department?: string;
  responsible_products?: string[];
  sub_expertise?: string[];
};

export function listSmes() {
  return request<{ smes: SME[] }>("/smes", { method: "GET" });
}

export function getSme(smeId: string) {
  return request<SME>(`/smes/${encodeURIComponent(smeId)}`, { method: "GET" });
}

export function createSme(body: SmeCreateRequest) {
  return request<SME>("/smes", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export type DashboardKpis = {
  pendingApprovals: number;
  smesOnboarded: number;
  approvedEntries: number;
  escalatedQuestions: number;
};

export function getDashboardKpis() {
  return request<DashboardKpis>("/admin/dashboard/kpis", { method: "GET" });
}

export type SmeUnreadCounts = { escalated?: number };

export function getSmeUnreadCounts() {
  return request<SmeUnreadCounts>("/notifications/sme/unread-counts", {
    method: "GET",
  });
}

export type AdminSme = SME & {
  stats: { interviews: number; approved: number };
};

export function listAdminSmes(q?: string) {
  return request<AdminSme[]>("/admin/smes", {
    method: "GET",
    query: { q },
  });
}

export type AdminKnowledgeRow = {
  id: string;
  topic: string;
  sme_id: string;
  sme_name: string;
  status: EntryStatus;
  created_at: string;
};

export function listAdminKnowledge(
  params: { sme_id?: string; status?: EntryStatus; topic?: string } = {},
) {
  return request<AdminKnowledgeRow[]>("/admin/knowledge", {
    method: "GET",
    query: {
      sme_id: params.sme_id,
      status: params.status,
      topic: params.topic,
    },
  });
}

export type AdminKnowledgeDetail = {
  entry_id: string;
  sme_id: string;
  sme_name: string;
  topic: string;
  status: EntryStatus;
  content: string;
  sources: KnowledgeSources;
  created_at: string;
  updated_at: string;
  timeline: { actor: string; action: string; at: string }[];
};

export function getAdminKnowledgeDetail(entryId: string) {
  return request<AdminKnowledgeDetail>(
    `/admin/knowledge/${encodeURIComponent(entryId)}`,
    { method: "GET" },
  );
}

export type InterviewSummary = {
  interview_id?: string;
  id?: string;
  topic?: string;
  status?: string;
  requested_by?: string;
  created_at?: string;
};

export function listSmeInterviews(smeId: string) {
  return request<{ interviews: InterviewSummary[] }>(
    `/smes/${encodeURIComponent(smeId)}/interviews`,
    { method: "GET" },
  );
}

export type InterviewResumeResponse = {
  topic_index: number;
  turn_number: number;
  last_question: string;
};

export function resumeInterview(interviewId: string) {
  return request<InterviewResumeResponse>(
    `/interviews/${encodeURIComponent(interviewId)}/resume`,
    { method: "GET" },
  );
}

export type SubmitInterviewAnswerResponse = {
  type?: string;
  question?: string | null;
  turn_number?: number | null;
  interview_id?: string | null;
  [key: string]: unknown;
};

export function submitInterviewAnswer(
  interviewId: string,
  smeResponse: string,
) {
  return request<SubmitInterviewAnswerResponse>(
    `/interviews/${encodeURIComponent(interviewId)}/answer`,
    {
      method: "POST",
      body: JSON.stringify({ sme_response: smeResponse }),
    },
  );
}

export type AdminInitiateInterviewResponse = {
  interview_id: string;
  sme_id: string;
  topic: string;
  requested_by?: string;
  admin_note?: string;
  status?: string;
};

export function postAdminInitiateInterview(body: {
  sme_id: string;
  topic: string;
  requested_by_admin?: string;
  note?: string;
}) {
  return request<AdminInitiateInterviewResponse>("/interviews/admin-initiate", {
    method: "POST",
    body: JSON.stringify({
      sme_id: body.sme_id,
      topic: body.topic,
      requested_by_admin: body.requested_by_admin ?? "Admin",
      note: body.note ?? "",
    }),
  });
}

export function endSmeInterview(interviewId: string) {
  return request<unknown>(
    `/sme/interviews/${encodeURIComponent(interviewId)}/end`,
    { method: "POST" },
  );
}

export type QueryResponse = {
  type?: "answer" | "clarification" | "routing";
  content?: string;
  message?: string;
  source?: {
    title?: string;
    approved_by?: string;
    reviewed?: string;
  };
  chips?: string[];
  smes?: {
    name: string;
    specialization?: string;
    reason?: string;
    email?: string;
  }[];
  session_id?: string;
  [key: string]: unknown;
};

export function postQuery(body: { question: string; session_id: string }) {
  return request<QueryResponse>("/query", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export type EntryStatus =
  | "draft"
  | "in_progress"
  | "sme_approved"
  | "approved"
  | "rejected"
  | "completed";

export type SME = {
  id: string;
  name: string;
  specialization: string;
  sub_areas: string[];
  email: string;
};

export type KnowledgeEntry = {
  id: string;
  topic: string;
  status: EntryStatus;
  sme_id: string;
};

// SMEs — exactly as in design-spec.md
export const smes: SME[] = [
  {
    id: "sme_001",
    name: "Dr. Elara Voss",
    specialization: "MEZ Trade Compliance",
    sub_areas: ["Restricted commodity transfers", "Compliance certifications"],
    email: "e.voss@mez.org",
  },
  {
    id: "sme_002",
    name: "Marcus Tanaka",
    specialization: "MEZ Digital Asset Protections",
    sub_areas: ["Registered algorithms", "Digital IP"],
    email: "m.tanaka@mez.org",
  },
  {
    id: "sme_003",
    name: "Dr. Nadia Okafor",
    specialization: "MEZ Dispute Resolution",
    sub_areas: ["Arbitration", "Tribunal filing"],
    email: "n.okafor@mez.org",
  },
];

// Knowledge entries — covering all 4 statuses
export const entries: KnowledgeEntry[] = [
  { id: "ke_001", topic: "Restricted Transfer Violations", status: "approved", sme_id: "sme_001" },
  { id: "ke_002", topic: "Digital Algorithm Registration", status: "sme_approved", sme_id: "sme_002" },
  { id: "ke_003", topic: "Vendor Compliance Escalations", status: "draft", sme_id: "sme_001" },
  { id: "ke_004", topic: "Dispute Filing Procedures", status: "rejected", sme_id: "sme_003" },
];

// Sample chat showing all 3 response types
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
      smes: { name: string; specialization: string; reason: string; email: string }[];
    }
  | { role: "sme"; sme_name: string; content: string };

export const sampleChat: ChatMessage[] = [
  { role: "user", content: "What are the four elements of a restricted transfer violation?" },
  {
    role: "ai",
    type: "answer",
    content:
      "Under MCC Article 14, a restricted transfer violation requires four elements: (1) a controlled commodity classification, (2) cross-border movement without an active export licence, (3) intent or knowledge by the responsible party, and (4) failure to lodge the post-transfer declaration within 14 days.",
    source: {
      title: "Vendor_Compliance_Guide.pdf",
      approved_by: "Dr. Elara Voss",
      reviewed: "Apr 2026",
    },
  },
  { role: "user", content: "What are the compliance requirements?" },
  {
    role: "ai",
    type: "clarification",
    content: "Could you clarify which area you mean? I can answer across several MEZ domains.",
    chips: ["Trade Compliance", "Digital Assets", "Dispute Resolution"],
  },
  { role: "user", content: "How do I file with the MEZ Tribunal?" },
  {
    role: "ai",
    type: "routing",
    content:
      "I don't have this in my approved knowledge base yet. I recommend reaching the following SME directly:",
    smes: [
      {
        name: "Dr. Nadia Okafor",
        specialization: "MEZ Dispute Resolution",
        reason: "Tribunal filing falls under Articles 42-48",
        email: "n.okafor@mez.org",
      },
    ],
  },
];

// Chat history list (sidebar)
export const chatHistory = [
  { id: "c1", first: "What are the four elements of a restricted transfer violation?", ts: "10:24" },
  { id: "c2", first: "Compliance requirements for vendor onboarding…", ts: "Yesterday" },
  { id: "c3", first: "How do I file with the MEZ Tribunal?", ts: "Apr 28" },
  { id: "c4", first: "Digital algorithm registration timeline", ts: "Apr 24" },
];

// SME dashboard mock data
export const smeKpis = {
  pendingInterviews: 3,
  pendingReviews: 5,
  escalatedQuestions: 2,
  approvedEntries: 12,
};

export const smeInterviews: {
  id: string;
  topic: string;
  requestedBy: string;
  status: EntryStatus;
  ts: string;
}[] = [
  {
    id: "iv_001",
    topic: "Restricted commodity transfers — edge cases",
    requestedBy: "Admin · L. Park",
    status: "in_progress",
    ts: "Apr 30 · 14:22",
  },
  {
    id: "iv_002",
    topic: "Compliance certification renewals",
    requestedBy: "Admin · L. Park",
    status: "draft",
    ts: "Apr 29 · 09:10",
  },
  {
    id: "iv_003",
    topic: "Article 14 worked examples",
    requestedBy: "Admin · M. Singh",
    status: "completed",
    ts: "Apr 26 · 11:05",
  },
];

export const smePendingReviews: { id: string; topic: string; status: EntryStatus }[] = [
  { id: "ke_003", topic: "Vendor Compliance Escalations", status: "draft" },
  { id: "ke_005", topic: "Article 14 worked examples — clean draft", status: "in_progress" },
  { id: "ke_004", topic: "Dispute Filing Procedures", status: "rejected" },
];

export const smeEscalated: { id: string; question: string; ts: string }[] = [
  {
    id: "eq_001",
    question:
      "A vendor moved encryption hardware across the border before the licence renewed — is the 14-day window paused?",
    ts: "Apr 30 · 16:02",
  },
  {
    id: "eq_002",
    question: "Does Article 14 apply to dual-use items already classified under Annex II?",
    ts: "Apr 29 · 18:44",
  },
];

// ─── Admin dashboard ───────────────────────────────────────────────────

export const adminKpis = {
  pendingApprovals: 3,
  smesOnboarded: 14,
  approvedEntries: 86,
  escalatedQuestions: 4,
};

export const adminEscalatedUnanswered: {
  id: string;
  question: string;
  routedFrom: string;
  ts: string;
}[] = [
  {
    id: "aeq_001",
    question:
      "An automated risk-scoring vendor flagged 12 disputed transfers in one week — does that trigger an Article 14(b) audit?",
    routedFrom: "Dr. Elara Voss",
    ts: "Apr 30 · 17:48",
  },
];

export const adminEscalatedAnswered: {
  id: string;
  question: string;
  answeredBy: string;
  ts: string;
}[] = [
  {
    id: "aeq_010",
    question: "Does the 14-day declaration window pause during licence renewal?",
    answeredBy: "Dr. Elara Voss",
    ts: "Apr 28",
  },
  {
    id: "aeq_011",
    question: "Are dual-use items classified under Annex II in scope of Article 14?",
    answeredBy: "Dr. Elara Voss",
    ts: "Apr 26",
  },
  {
    id: "aeq_012",
    question: "What evidence is needed to contest a tribunal filing fee?",
    answeredBy: "Dr. Nadia Okafor",
    ts: "Apr 24",
  },
];

// ─── Admin knowledge base browse ───────────────────────────────────────

export type KnowledgeBaseEntry = {
  id: string;
  topic: string;
  smeId: string;
  smeName: string;
  status: EntryStatus;
  createdAt: string;
  content: string;
  sources: string[];
  timeline: { actor: string; action: string; at: string }[];
};

export const knowledgeBaseEntries: KnowledgeBaseEntry[] = [
  {
    id: "ke_001",
    topic: "Restricted Transfer Violations",
    smeId: "sme_001",
    smeName: "Dr. Elara Voss",
    status: "approved",
    createdAt: "Apr 22, 2026",
    content:
      "Under MCC Article 14, a restricted transfer violation requires four elements: (1) a controlled commodity classification, (2) cross-border movement without an active export licence, (3) intent or knowledge by the responsible party, and (4) failure to lodge the post-transfer declaration within 14 days.",
    sources: ["Interview #1", "Vendor_Compliance_Guide.pdf"],
    timeline: [
      { actor: "Dr. Elara Voss", action: "Drafted", at: "Apr 20, 2026" },
      { actor: "Dr. Elara Voss", action: "SME approved", at: "Apr 21, 2026" },
      { actor: "L. Park (Admin)", action: "Approved", at: "Apr 22, 2026" },
    ],
  },
  {
    id: "ke_002",
    topic: "Digital Algorithm Registration",
    smeId: "sme_002",
    smeName: "Marcus Tanaka",
    status: "sme_approved",
    createdAt: "Apr 30, 2026",
    content:
      "Registration of a digital algorithm under MEZ Digital Asset Protections requires submission of the algorithm fingerprint, a description of training data provenance, and a declaration of intended deployment scope. Once accepted, registrations are valid for 24 months and must be re-attested if the algorithm undergoes material change.",
    sources: ["Interview #2", "DigitalAssets_Handbook.pdf"],
    timeline: [
      { actor: "Marcus Tanaka", action: "Drafted", at: "Apr 29, 2026" },
      { actor: "Marcus Tanaka", action: "SME approved", at: "Apr 30, 2026" },
    ],
  },
  {
    id: "ke_003",
    topic: "Vendor Compliance Escalations",
    smeId: "sme_001",
    smeName: "Dr. Elara Voss",
    status: "draft",
    createdAt: "Apr 28, 2026",
    content:
      "Vendor compliance escalations should follow the three-tier model: (1) account manager review, (2) regional compliance officer review, (3) MEZ Compliance Tribunal referral.",
    sources: ["Interview #3"],
    timeline: [{ actor: "Dr. Elara Voss", action: "Drafted", at: "Apr 28, 2026" }],
  },
  {
    id: "ke_004",
    topic: "Dispute Filing Procedures",
    smeId: "sme_003",
    smeName: "Dr. Nadia Okafor",
    status: "rejected",
    createdAt: "Apr 25, 2026",
    content:
      "Disputes are filed through the Tribunal Registry portal. Each filing must include a statement of grounds and supporting evidence.",
    sources: ["Interview #4"],
    timeline: [
      { actor: "Dr. Nadia Okafor", action: "Drafted", at: "Apr 24, 2026" },
      { actor: "Dr. Nadia Okafor", action: "SME approved", at: "Apr 25, 2026" },
      {
        actor: "L. Park (Admin)",
        action: "Rejected — needs Article references",
        at: "Apr 26, 2026",
      },
    ],
  },
  {
    id: "ke_006",
    topic: "Compliance Certification Renewals",
    smeId: "sme_001",
    smeName: "Dr. Elara Voss",
    status: "sme_approved",
    createdAt: "Apr 29, 2026",
    content:
      "Compliance certifications under MCC Article 11 are renewed on a 12-month cycle. Renewal requires an updated risk assessment, confirmation of officer accreditation, and a fresh statement of restricted commodity inventory.",
    sources: ["Interview #3", "Compliance_Guide.pdf"],
    timeline: [
      { actor: "Dr. Elara Voss", action: "Drafted", at: "Apr 28, 2026" },
      { actor: "Dr. Elara Voss", action: "SME approved", at: "Apr 29, 2026" },
    ],
  },
  {
    id: "ke_007",
    topic: "Tribunal Filing Procedures",
    smeId: "sme_003",
    smeName: "Dr. Nadia Okafor",
    status: "sme_approved",
    createdAt: "Apr 28, 2026",
    content:
      "Filings with the MEZ Tribunal must be lodged through the Tribunal Registry portal within 30 days of the disputed event. Each filing requires a statement of grounds, supporting evidence indexed by Article reference, and the filing fee receipt.",
    sources: ["Interview #4"],
    timeline: [
      { actor: "Dr. Nadia Okafor", action: "Drafted", at: "Apr 27, 2026" },
      { actor: "Dr. Nadia Okafor", action: "SME approved", at: "Apr 28, 2026" },
    ],
  },
];

// ─── Admin SME directory stats ─────────────────────────────────────────

export const smeStats: Record<string, { interviews: number; approved: number; role: string; department: string }> = {
  sme_001: { interviews: 4, approved: 12, role: "Senior Compliance Officer", department: "Compliance Office" },
  sme_002: { interviews: 3, approved: 8, role: "Principal Engineer — Digital IP", department: "Digital Asset Protections" },
  sme_003: { interviews: 5, approved: 9, role: "Tribunal Counsel", department: "Dispute Resolution" },
};

// ─── SME knowledge approval (editable drafts) ──────────────────────────

export type SmePendingKnowledge = {
  id: string;
  topic: string;
  status: EntryStatus;
  lastUpdated: string;
  reviewDue: string;
  sources: string[];
  content: string;
  rejectionComment?: string;
};

export const smePendingKnowledge: SmePendingKnowledge[] = [
  {
    id: "ke_003",
    topic: "Vendor Compliance Escalations",
    status: "draft",
    lastUpdated: "Apr 28, 2026",
    reviewDue: "May 5, 2026",
    sources: ["Interview #3"],
    content:
      "Vendor compliance escalations follow a three-tier model. Tier 1: account manager attempts resolution within 5 working days. Tier 2: regional compliance officer reviews and decides whether to remediate or refer. Tier 3: MEZ Compliance Tribunal hears unresolved cases. Each tier must record the basis of decision in the central audit log.",
  },
  {
    id: "ke_005",
    topic: "Article 14 worked examples — clean draft",
    status: "in_progress",
    lastUpdated: "Apr 29, 2026",
    reviewDue: "May 6, 2026",
    sources: ["Interview #1", "Article14_Examples.pdf"],
    content:
      "Worked example A: a controlled commodity is moved across the border under an expired licence, declaration filed on day 13. Outcome: not a violation — declaration window met. Worked example B: same facts but declaration filed on day 16. Outcome: violation — even if intent was honest, the post-transfer declaration window failed.",
  },
  {
    id: "ke_004",
    topic: "Dispute Filing Procedures",
    status: "rejected",
    lastUpdated: "Apr 26, 2026",
    reviewDue: "May 3, 2026",
    sources: ["Interview #4"],
    content:
      "Disputes are filed through the Tribunal Registry portal. Each filing must include a statement of grounds and supporting evidence.",
    rejectionComment:
      "Please add explicit Article references (Articles 42–48) and clarify the late-filing exception under Article 47.",
  },
];

export const smeExistingEntries: { id: string; topic: string; status: EntryStatus; approvedOn: string }[] = [
  { id: "ke_001", topic: "Restricted Transfer Violations", status: "approved", approvedOn: "Apr 22, 2026" },
  { id: "ke_010", topic: "Compliance Officer Accreditation", status: "approved", approvedOn: "Apr 18, 2026" },
  { id: "ke_011", topic: "Restricted Commodity Inventory Filings", status: "completed", approvedOn: "Apr 12, 2026" },
];

// ─── SME escalated thread (read-only history + reply) ──────────────────

export type EscalatedThread = {
  id: string;
  question: string;
  history: { role: "user" | "ai"; content: string }[];
};

export const escalatedThreads: Record<string, EscalatedThread> = {
  eq_001: {
    id: "eq_001",
    question:
      "A vendor moved encryption hardware across the border before the licence renewed — is the 14-day window paused?",
    history: [
      {
        role: "user",
        content:
          "A vendor moved encryption hardware across the border before the licence renewed — is the 14-day window paused?",
      },
      {
        role: "ai",
        content:
          "Article 14 doesn't explicitly address paused windows during licence renewal. The post-transfer declaration window appears to start from the moment of transfer regardless of licence state, but I don't have an approved expert ruling on this exact scenario in my knowledge base.",
      },
      {
        role: "user",
        content: "So what should the vendor do right now? They are on day 9.",
      },
      {
        role: "ai",
        content:
          "I can't give you operational advice on an active matter without a grounded expert source. I'm forwarding this to the responsible SME for a definitive answer.",
      },
    ],
  },
  eq_002: {
    id: "eq_002",
    question:
      "Does Article 14 apply to dual-use items already classified under Annex II?",
    history: [
      {
        role: "user",
        content:
          "Does Article 14 apply to dual-use items already classified under Annex II?",
      },
      {
        role: "ai",
        content:
          "Annex II items are typically governed by their own classification regime, but I don't have an explicit answer on whether Article 14 stacks on top of that classification.",
      },
    ],
  },
};

// ─── SME interview thread ──────────────────────────────────────────────

export type InterviewTurn =
  | { role: "ai"; content: string }
  | { role: "sme"; content: string };

export type InterviewThread = {
  id: string;
  topic: string;
  status: EntryStatus;
  turn: number;
  history: InterviewTurn[];
};

export const interviewThreads: Record<string, InterviewThread> = {
  iv_001: {
    id: "iv_001",
    topic: "Restricted commodity transfers — edge cases",
    status: "in_progress",
    turn: 3,
    history: [
      {
        role: "ai",
        content:
          "Let's start with a baseline: in your experience, what are the two or three most common ways a restricted transfer goes wrong even when the licence is technically valid?",
      },
      {
        role: "sme",
        content:
          "Three patterns dominate: (1) commodity reclassification mid-shipment that the carrier doesn't notice, (2) destination changes after transfer initiation, (3) post-transfer declarations filed by the wrong legal entity within the corporate group.",
      },
      {
        role: "ai",
        content:
          "On pattern (3), how should an investigator decide whether to treat a misfiled declaration as a procedural lapse versus a violation under Article 14?",
      },
      {
        role: "sme",
        content:
          "Look at corporate authority. If the entity that filed had documented authority to file on behalf of the licence-holder, treat it as procedural. Otherwise it is a violation — the declaration is legally void.",
      },
      {
        role: "ai",
        content:
          "Got it. Final question for this turn: are there any edge cases where the 14-day declaration window should be tolled, even though Article 14 makes no explicit provision for tolling?",
      },
    ],
  },
  iv_002: {
    id: "iv_002",
    topic: "Compliance certification renewals",
    status: "draft",
    turn: 1,
    history: [
      {
        role: "ai",
        content:
          "To begin: when an Article 11 certification lapses, what is the practical impact on a firm's day-to-day compliance posture before re-certification?",
      },
    ],
  },
  iv_003: {
    id: "iv_003",
    topic: "Article 14 worked examples",
    status: "completed",
    turn: 5,
    history: [
      {
        role: "ai",
        content: "Could you walk me through a textbook violation case under Article 14?",
      },
      {
        role: "sme",
        content:
          "Sure. A controlled commodity moves across the border, the licence has expired, and the post-transfer declaration is filed late. All four elements present.",
      },
      {
        role: "ai",
        content: "And a case that looks like a violation but isn't?",
      },
      {
        role: "sme",
        content:
          "Same scenario but the declaration is timely, all four elements aren't satisfied, no violation.",
      },
      {
        role: "ai",
        content: "Thank you — this gives us enough for the worked-example draft.",
      },
    ],
  },
};

// Admin approve page — sme_approved entries with content
export const pendingAdminApprovals: {
  id: string;
  topic: string;
  smeName: string;
  smeApprovedOn: string;
  content: string;
  sources: string[];
}[] = [
  {
    id: "ke_002",
    topic: "Digital Algorithm Registration",
    smeName: "Marcus Tanaka",
    smeApprovedOn: "Apr 30, 2026",
    content:
      "Registration of a digital algorithm under MEZ Digital Asset Protections requires submission of the algorithm fingerprint, a description of training data provenance, and a declaration of intended deployment scope. Once accepted, registrations are valid for 24 months and must be re-attested if the algorithm undergoes material change. Material change includes any modification that alters the model's output distribution by more than 5% on the standard MEZ evaluation benchmark.",
    sources: ["Interview #2", "DigitalAssets_Handbook.pdf"],
  },
  {
    id: "ke_006",
    topic: "Compliance Certification Renewals",
    smeName: "Dr. Elara Voss",
    smeApprovedOn: "Apr 29, 2026",
    content:
      "Compliance certifications under MCC Article 11 are renewed on a 12-month cycle. Renewal requires (1) an updated risk assessment, (2) confirmation that the responsible compliance officer remains accredited, and (3) a fresh statement of restricted commodity inventory. Certifications lapse 30 days after expiry; lapsed certifications cannot be reinstated and must be re-applied as new.",
    sources: ["Interview #3", "Compliance_Guide.pdf"],
  },
  {
    id: "ke_007",
    topic: "Tribunal Filing Procedures",
    smeName: "Dr. Nadia Okafor",
    smeApprovedOn: "Apr 28, 2026",
    content:
      "Filings with the MEZ Tribunal must be lodged through the Tribunal Registry portal within 30 days of the disputed event. Each filing requires a statement of grounds, supporting evidence indexed by Article reference, and the filing fee receipt. Late filings are accepted only on showing of exceptional circumstance under Article 47.",
    sources: ["Interview #4"],
  },
];

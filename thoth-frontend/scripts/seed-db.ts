/* eslint-disable no-console */
// Seeds 3 SMEs and 1 interview each into the running backend.
// Run from the thoth-frontend directory:
//   npx tsx scripts/seed-db.ts
// Configurable via env:
//   API_BASE_URL       — defaults to http://localhost:8000/api/v1
//   BENCHMARK_API_KEY  — defaults to thoth-secret-2026

const API_BASE_URL = process.env.API_BASE_URL ?? "http://localhost:8000/api/v1";
const API_TOKEN = process.env.BENCHMARK_API_KEY ?? "thoth-secret-2026";

type SmeSeed = {
  name: string;
  specialization: string;
  sub_areas: string[];
  contact_email: string;
};

const SMES: SmeSeed[] = [
  {
    name: "Dr. Elara Voss",
    specialization: "MEZ Trade Compliance",
    sub_areas: [
      "Restricted commodity transfers",
      "Compliance certifications",
    ],
    contact_email: "e.voss@mez.org",
  },
  {
    name: "Marcus Tanaka",
    specialization: "MEZ Digital Asset Protections",
    sub_areas: ["Registered algorithms", "Digital IP licensing"],
    contact_email: "m.tanaka@mez.org",
  },
  {
    name: "Dr. Nadia Okafor",
    specialization: "MEZ Dispute Resolution",
    sub_areas: ["Arbitration procedures", "MEZ Tribunal filing"],
    contact_email: "n.okafor@mez.org",
  },
];

type Result = {
  sme: SmeSeed;
  smeId?: string;
  smeError?: string;
  smeRecovered?: boolean;
  interviewOk?: boolean;
  interviewError?: string;
};

type ListedSme = {
  sme_id: string;
  name: string;
  contact_email: string;
};

async function rawFetch(
  path: string,
  init: { method?: string; body?: unknown } = {},
): Promise<Response> {
  return fetch(`${API_BASE_URL}${path}`, {
    method: init.method ?? "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${API_TOKEN}`,
    },
    body: init.body !== undefined ? JSON.stringify(init.body) : undefined,
  });
}

async function api<T>(
  path: string,
  init: { method?: string; body?: unknown; retries?: number } = {},
): Promise<T> {
  const retries = init.retries ?? 0;
  let lastErr: unknown;
  for (let attempt = 0; attempt <= retries; attempt++) {
    const res = await rawFetch(path, init);
    const text = await res.text();
    if (res.ok) {
      return text ? (JSON.parse(text) as T) : (undefined as T);
    }
    let detail = text;
    try {
      const parsed = JSON.parse(text) as { detail?: string };
      if (parsed?.detail) detail = parsed.detail;
    } catch {
      /* leave as raw text */
    }
    lastErr = new Error(`HTTP ${res.status} ${res.statusText} — ${detail}`);
    if (attempt < retries) {
      await new Promise((r) => setTimeout(r, 250 * (attempt + 1)));
    }
  }
  throw lastErr;
}

async function findSmeIdByEmail(email: string): Promise<string | null> {
  try {
    const list = await api<{ smes: ListedSme[] }>("/smes", { retries: 3 });
    // The backend uses createdAt-desc order, so the most recent match wins.
    const match = list.smes.find(
      (s) => s.contact_email.toLowerCase() === email.toLowerCase(),
    );
    return match ? match.sme_id : null;
  } catch {
    return null;
  }
}

async function seedOne(sme: SmeSeed): Promise<Result> {
  const result: Result = { sme };

  // Idempotent: skip POST if an SME with this email already exists.
  const existing = await findSmeIdByEmail(sme.contact_email);
  if (existing) {
    result.smeId = existing;
    result.smeRecovered = true;
    result.smeError = "already exists";
  } else {
    try {
      const created = await api<{ sme_id: string }>("/smes", {
        method: "POST",
        body: sme,
      });
      result.smeId = created.sme_id;
    } catch (err) {
      result.smeError = err instanceof Error ? err.message : String(err);
      // The backend currently 500s on POST /smes even when the row commits,
      // so look up the SME by email before giving up.
      const recovered = await findSmeIdByEmail(sme.contact_email);
      if (recovered) {
        result.smeId = recovered;
        result.smeRecovered = true;
      } else {
        return result;
      }
    }
  }

  try {
    await api(`/smes/${encodeURIComponent(result.smeId!)}/interviews`, {
      method: "POST",
      body: { topic: "Core expertise overview" },
    });
    result.interviewOk = true;
  } catch (err) {
    result.interviewError =
      err instanceof Error ? err.message : String(err);
  }
  return result;
}

async function main() {
  console.log(`▶ Seeding against ${API_BASE_URL}`);
  const results: Result[] = [];
  for (const sme of SMES) {
    const r = await seedOne(sme);
    results.push(r);
    if (r.smeId && !r.smeRecovered) {
      console.log(
        `  ✓ Created SME ${r.smeId} — ${sme.name} <${sme.contact_email}>`,
      );
    } else if (r.smeId && r.smeError === "already exists") {
      console.log(
        `  ↺ Skipped — ${sme.name} <${sme.contact_email}> already exists as ${r.smeId}`,
      );
    } else if (r.smeId && r.smeRecovered) {
      console.log(
        `  ⚠ POST /smes returned ${r.smeError}, but row was committed — recovered ${r.smeId}`,
      );
    } else {
      console.log(`  ✗ SME failed — ${sme.name}: ${r.smeError}`);
    }
    if (r.smeId) {
      if (r.interviewOk) {
        console.log("    ↳ ✓ Interview created");
      } else {
        console.log(`    ↳ ✗ Interview failed: ${r.interviewError}`);
      }
    }
  }

  // Verify
  console.log("\n▶ Verifying with GET /smes …");
  try {
    const list = await api<{
      smes: { sme_id: string; name: string; contact_email: string }[];
    }>("/smes", { retries: 3 });
    const seededEmails = new Set(SMES.map((s) => s.contact_email));
    const seededFound = list.smes.filter((s) =>
      seededEmails.has(s.contact_email),
    );
    console.log(
      `  Total SMEs in DB: ${list.smes.length}. Seeded SMEs found: ${seededFound.length}/${SMES.length}`,
    );
    for (const s of seededFound) {
      console.log(`    • ${s.sme_id} — ${s.name} <${s.contact_email}>`);
    }
  } catch (err) {
    console.log(
      `  ✗ Verification failed: ${err instanceof Error ? err.message : String(err)}`,
    );
  }

  console.log("\n▶ Summary");
  const created = results.filter((r) => r.smeId).length;
  const failed = results.length - created;
  const interviews = results.filter((r) => r.interviewOk).length;
  console.log(`  SMEs created:      ${created}/${results.length}`);
  console.log(`  Interviews created: ${interviews}/${results.length}`);
  if (failed > 0) {
    console.log(`  ${failed} SME create(s) failed.`);
    process.exitCode = 1;
  }
}

main().catch((err) => {
  console.error("Unexpected error:", err);
  process.exit(1);
});

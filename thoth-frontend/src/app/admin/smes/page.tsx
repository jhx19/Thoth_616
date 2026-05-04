"use client";

import { useCallback, useEffect, useState } from "react";
import { AlertCircle, Mail, Building2, RefreshCw, Search } from "lucide-react";
import { AdminShell } from "@/components/layout/admin-shell";
import { Button } from "@/components/ui/button";
import { ApiError, AdminSme, listAdminSmes } from "@/lib/api";

export default function ManageSmesPage() {
  const [q, setQ] = useState("");
  const [debounced, setDebounced] = useState("");
  const [smes, setSmes] = useState<AdminSme[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const t = setTimeout(() => setDebounced(q.trim()), 300);
    return () => clearTimeout(t);
  }, [q]);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const rows = await listAdminSmes(debounced || undefined);
      setSmes(rows);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Failed to load SMEs");
    } finally {
      setLoading(false);
    }
  }, [debounced]);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <AdminShell title="Manage SMEs">
      <div className="px-8 py-6">
        <div className="mb-6 flex items-center justify-between gap-4">
          <h2 className="text-[24px] font-bold text-ink">SME Directory</h2>
          <div className="relative w-[320px]">
            <Search
              size={14}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted"
            />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search by name, specialization, or area"
              className="w-full rounded-input border border-line bg-card py-2 pl-9 pr-3 text-sm text-ink placeholder:text-muted focus:border-magenta focus:outline-none focus:ring-2 focus:ring-magenta/30"
            />
          </div>
        </div>

        {error && (
          <div className="mb-4 flex items-center justify-between gap-3 rounded-card border border-[#FECACA] bg-[#FEF2F2] px-4 py-3 text-sm text-[#991B1B]">
            <div className="flex items-center gap-2">
              <AlertCircle size={16} />
              {error}
            </div>
            <Button variant="secondary" size="sm" onClick={() => void load()}>
              <RefreshCw size={14} />
              Retry
            </Button>
          </div>
        )}

        {loading ? (
          <div className="grid grid-cols-2 gap-5">
            {[0, 1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-[200px] animate-pulse rounded-card border border-line bg-card"
              />
            ))}
          </div>
        ) : smes.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-card border border-dashed border-line bg-card py-20 text-center">
            <p className="text-sm font-medium text-ink">No SMEs found</p>
            <p className="mt-1 text-xs text-muted">
              Try a different search term.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-5">
            {smes.map((s) => {
              const initials = s.name
                .replace(/^Dr\.\s*/, "")
                .split(" ")
                .map((p) => p[0])
                .slice(0, 2)
                .join("")
                .toUpperCase();
              return (
                <article
                  key={s.sme_id}
                  className="rounded-card border border-line bg-card p-5 shadow-card"
                >
                  <div className="flex items-start gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-magenta text-sm font-semibold text-white">
                      {initials}
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="truncate text-[15px] font-semibold text-ink">
                        {s.name}
                      </h3>
                      <p className="text-xs text-muted">
                        {s.role ?? "Subject Matter Expert"}
                      </p>

                      <div className="mt-2 flex flex-wrap gap-1.5">
                        <span className="inline-flex items-center rounded-badge bg-magenta-50 px-2 py-0.5 text-[11px] font-medium text-magenta">
                          {s.specialization}
                        </span>
                        {(s.sub_areas ?? []).map((t) => (
                          <span
                            key={t}
                            className="inline-flex items-center rounded-badge border border-line bg-page px-2 py-0.5 text-[11px] text-ink/70"
                          >
                            {t}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 grid grid-cols-2 gap-3 border-t border-line pt-3 text-xs text-muted">
                    <div className="flex items-center gap-1.5">
                      <Mail size={12} />
                      <span className="truncate text-ink/80">{s.contact_email}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Building2 size={12} />
                      <span className="truncate text-ink/80">
                        {s.department ?? "—"}
                      </span>
                    </div>
                  </div>

                  <div className="mt-3 flex items-center justify-between">
                    <p className="text-xs text-muted">
                      <span className="font-medium text-ink">
                        {s.stats.interviews}
                      </span>{" "}
                      interviews ·{" "}
                      <span className="font-medium text-ink">
                        {s.stats.approved}
                      </span>{" "}
                      approved entries
                    </p>
                    <Button variant="secondary" size="sm">
                      View Profile
                    </Button>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </AdminShell>
  );
}

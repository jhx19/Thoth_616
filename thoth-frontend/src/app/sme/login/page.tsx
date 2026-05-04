"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { AlertCircle, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ApiError, createSme, listSmes } from "@/lib/api";
import { cn } from "@/lib/utils";

type Tab = "login" | "register";

function persistSession(smeId: string, name: string) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem("sme_id", smeId);
  window.localStorage.setItem("sme_name", name);
}

function formatApiError(err: unknown, fallback: string): string {
  if (err instanceof ApiError) {
    return err.status ? `${err.message} (HTTP ${err.status})` : err.message;
  }
  if (err instanceof Error) return err.message;
  return fallback;
}

export default function SmeLoginPage() {
  const [tab, setTab] = useState<Tab>("login");

  return (
    <div className="flex min-h-screen min-w-[1024px] items-center justify-center bg-page px-8 py-12">
      <div className="w-[480px]">
        {/* Brand */}
        <Link href="/" className="mb-8 flex items-center justify-center gap-2">
          <span className="inline-block h-3 w-3 rounded-sm bg-magenta" />
          <span className="text-[15px] font-semibold tracking-tight text-ink">
            Thoth · SME
          </span>
        </Link>

        <div className="rounded-card border border-line bg-card shadow-card">
          {/* Tabs */}
          <div className="flex border-b border-line">
            <TabButton active={tab === "login"} onClick={() => setTab("login")}>
              Login
            </TabButton>
            <TabButton active={tab === "register"} onClick={() => setTab("register")}>
              Register
            </TabButton>
          </div>

          {/* Tab content */}
          <div className="px-7 py-6">
            {tab === "login" ? <LoginForm /> : <RegisterForm />}
          </div>
        </div>
      </div>
    </div>
  );
}

function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "relative flex-1 px-4 py-3 text-sm text-ink/70 hover:text-ink",
        active && "font-medium text-magenta"
      )}
    >
      {children}
      {active && (
        <span className="absolute inset-x-4 bottom-0 h-[2px] bg-magenta" />
      )}
    </button>
  );
}

// ─── Login ─────────────────────────────────────────────────────────────

function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [formError, setFormError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = email.trim();
    if (!trimmed) {
      setError("Email is required");
      return;
    }
    setFormError("");
    setSubmitting(true);
    try {
      const { smes } = await listSmes();
      const match = smes.find(
        (s) => s.contact_email.toLowerCase() === trimmed.toLowerCase(),
      );
      if (!match) {
        setFormError("No account found with this email. Please register first.");
        return;
      }
      persistSession(match.sme_id, match.name);
      router.push("/sme/dashboard");
    } catch (err) {
      setFormError(formatApiError(err, "Couldn't reach the server. Please try again."));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={submit} className="space-y-5">
      <div>
        <h2 className="text-[18px] font-semibold text-ink">Welcome back</h2>
        <p className="mt-1 text-sm text-muted">
          Enter your work email to continue.
        </p>
      </div>

      <Field
        label="Email"
        required
        error={error}
        value={email}
        onChange={(v) => {
          setEmail(v);
          if (error) setError("");
          if (formError) setFormError("");
        }}
        placeholder="you@mez.org"
        type="email"
      />

      <Button
        type="submit"
        variant="primary"
        size="lg"
        className="w-full"
        disabled={submitting}
      >
        {submitting ? "Signing in…" : "Continue"}
      </Button>

      {formError && <FormErrorBanner message={formError} />}
    </form>
  );
}

// ─── Register ──────────────────────────────────────────────────────────

function RegisterForm() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [role, setRole] = useState("");
  const [specialization, setSpecialization] = useState("");
  const [tagInput, setTagInput] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [email, setEmail] = useState("");
  const [department, setDepartment] = useState("");

  const [errors, setErrors] = useState<{
    name?: string;
    specialization?: string;
    tags?: string;
    email?: string;
  }>({});
  const [formError, setFormError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  function addTag() {
    const v = tagInput.trim();
    if (!v) return;
    if (!tags.includes(v)) setTags((t) => [...t, v]);
    setTagInput("");
    if (errors.tags) setErrors((e) => ({ ...e, tags: undefined }));
  }

  function removeTag(t: string) {
    setTags((arr) => arr.filter((x) => x !== t));
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const next: typeof errors = {};
    if (!name.trim()) next.name = "Full name is required";
    if (!specialization.trim()) next.specialization = "Specialization is required";
    if (tags.length === 0) next.tags = "Add at least one sub expertise";
    if (!email.trim()) next.email = "Email is required";
    setErrors(next);
    if (Object.keys(next).length > 0) return;

    setFormError("");
    setSubmitting(true);
    try {
      const sme = await createSme({
        name: name.trim(),
        specialization: specialization.trim(),
        sub_areas: tags,
        contact_email: email.trim(),
        ...(role.trim() ? { role: role.trim() } : {}),
        ...(department.trim() ? { department: department.trim() } : {}),
      });
      persistSession(sme.sme_id, sme.name);
      router.push("/sme/dashboard");
    } catch (err) {
      setFormError(formatApiError(err, "Registration failed. Please try again."));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={submit} className="space-y-5">
      <div>
        <h2 className="text-[18px] font-semibold text-ink">
          Register as an SME
        </h2>
        <p className="mt-1 text-sm text-muted">
          Tell us about your expertise so admins can route interviews to you.
        </p>
      </div>

      <Field
        label="Full Name"
        required
        error={errors.name}
        value={name}
        onChange={(v) => {
          setName(v);
          if (errors.name) setErrors((e) => ({ ...e, name: undefined }));
        }}
      />

      <Field
        label="Role"
        value={role}
        onChange={setRole}
        placeholder="e.g. Senior Compliance Officer"
      />

      <Field
        label="Specialization"
        required
        error={errors.specialization}
        value={specialization}
        onChange={(v) => {
          setSpecialization(v);
          if (errors.specialization)
            setErrors((e) => ({ ...e, specialization: undefined }));
        }}
        placeholder="e.g. MEZ Trade Compliance"
      />

      {/* Sub Expertise — tag input */}
      <div>
        <label className="mb-1 block text-xs font-medium text-ink">
          Sub Expertise <span className="text-magenta">*</span>
        </label>
        <div
          className={cn(
            "flex flex-wrap items-center gap-1.5 rounded-input border border-line bg-card px-2 py-1.5",
            "focus-within:ring-2 focus-within:ring-magenta/30 focus-within:border-magenta",
            errors.tags && "border-[#EF4444]"
          )}
        >
          {tags.map((t) => (
            <span
              key={t}
              className="inline-flex items-center gap-1 rounded-badge bg-magenta-50 px-2 py-0.5 text-xs text-magenta"
            >
              {t}
              <button
                type="button"
                onClick={() => removeTag(t)}
                className="text-magenta/70 hover:text-magenta"
                aria-label={`Remove ${t}`}
              >
                <X size={12} />
              </button>
            </span>
          ))}
          <input
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                addTag();
              }
            }}
            placeholder={tags.length === 0 ? "Press Enter to add a tag" : ""}
            className="flex-1 min-w-[120px] bg-transparent px-1.5 py-0.5 text-sm text-ink placeholder:text-muted focus:outline-none"
          />
        </div>
        {errors.tags && (
          <p className="mt-1 text-xs text-[#EF4444]">{errors.tags}</p>
        )}
      </div>

      <Field
        label="Email"
        required
        error={errors.email}
        value={email}
        onChange={(v) => {
          setEmail(v);
          if (errors.email) setErrors((e) => ({ ...e, email: undefined }));
        }}
        placeholder="you@mez.org"
        type="email"
      />

      <Field
        label="Department"
        value={department}
        onChange={setDepartment}
        placeholder="e.g. Compliance Office"
      />

      <Button
        type="submit"
        variant="primary"
        size="lg"
        className="w-full"
        disabled={submitting}
      >
        {submitting ? "Creating account…" : "Submit"}
      </Button>

      {formError && <FormErrorBanner message={formError} />}
    </form>
  );
}

function FormErrorBanner({ message }: { message: string }) {
  return (
    <div
      role="alert"
      className="flex items-start gap-2 rounded-input border border-[#FECACA] bg-[#FEF2F2] px-3 py-2 text-xs text-[#991B1B]"
    >
      <AlertCircle size={14} className="mt-px shrink-0" />
      <span>{message}</span>
    </div>
  );
}

// ─── Field ─────────────────────────────────────────────────────────────

function Field({
  label,
  required,
  error,
  value,
  onChange,
  placeholder,
  type = "text",
}: {
  label: string;
  required?: boolean;
  error?: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
}) {
  return (
    <div>
      <label className="mb-1 block text-xs font-medium text-ink">
        {label}
        {required && <span className="ml-0.5 text-magenta">*</span>}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={cn(
          "w-full rounded-input border border-line bg-card px-3 py-2 text-sm text-ink placeholder:text-muted",
          "focus:outline-none focus:ring-2 focus:ring-magenta/30 focus:border-magenta",
          error && "border-[#EF4444] focus:border-[#EF4444] focus:ring-[#EF4444]/20"
        )}
      />
      {error && <p className="mt-1 text-xs text-[#EF4444]">{error}</p>}
    </div>
  );
}

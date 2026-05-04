"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type Tab = "login" | "register";

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

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) {
      setError("Email is required");
      return;
    }
    router.push("/sme/dashboard");
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
        }}
        placeholder="you@mez.org"
        type="email"
      />

      <Button type="submit" variant="primary" size="lg" className="w-full">
        Continue
      </Button>
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

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const next: typeof errors = {};
    if (!name.trim()) next.name = "Full name is required";
    if (!specialization.trim()) next.specialization = "Specialization is required";
    if (tags.length === 0) next.tags = "Add at least one sub expertise";
    if (!email.trim()) next.email = "Email is required";
    setErrors(next);
    if (Object.keys(next).length > 0) return;
    router.push("/sme/dashboard");
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

      <Button type="submit" variant="primary" size="lg" className="w-full">
        Submit
      </Button>
    </form>
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

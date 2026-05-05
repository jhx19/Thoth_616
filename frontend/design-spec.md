# Project Thoth — Frontend Design Specification
> Give this file to Claude Code to generate the UI

---

## Tech Stack
- **Framework**: Next.js 14 (App Router) + TypeScript
- **Styling**: Tailwind CSS
- **Components**: shadcn/ui
- **Icons**: Lucide React
- **Mock layer**: MSW (Mock Service Worker) — intercepts fetch calls, returns fixture data
- All data uses MSW mock fixtures for now. When backend is ready, only change `NEXT_PUBLIC_API_BASE_URL` env var — no logic changes needed

---

## Design Language — T-Mobile Enterprise Style

### Core Principle
Clean, professional, text-first enterprise tool. Think Linear meets Notion — not a consumer app. No gradients, no decorative illustrations, no heavy animations.

### Colors
```
Primary magenta:   #E20074   (T-Mobile brand, use sparingly — CTAs, active states only)
Primary dark:      #1A1A1A   (headings, primary text)
Secondary text:    #6B7280   (labels, metadata, timestamps)
Background page:   #F9FAFB   (overall page bg)
Background card:   #FFFFFF   (cards, panels)
Border:            #E5E7EB   (all borders, dividers)

Status colors:
  draft:         #F3F4F6 bg  /  #6B7280 text
  in_progress:   #FEF3C7 bg  /  #92400E text
  sme_approved:  #DBEAFE bg  /  #1E40AF text
  approved:      #D1FAE5 bg  /  #065F46 text
  rejected:      #FEE2E2 bg  /  #991B1B text
  completed:     #D1FAE5 bg  /  #065F46 text

Chat bubble colors:
  AI reply:      #F3F4F6 bg  /  #1A1A1A text  (left aligned)
  SME reply:     #EDE9FE bg  /  #4C1D95 text  (left aligned, purple tint)
  Admin reply:   #FEF3C7 bg  /  #78350F text  (left aligned, amber tint)
  User message:  #E20074 bg  /  #FFFFFF text  (right aligned)
```

### Typography
```
Font: Inter (Google Fonts)
Page title:     24px / 700
Section title:  18px / 600
Card title:     15px / 500
Body:           14px / 400
Label/meta:     12px / 400  color: #6B7280
```

### Components
- **Border radius**: 8px for cards, 6px for badges, 4px for inputs
- **Shadows**: shadow-sm only (no heavy drop shadows)
- **Borders**: 1px solid #E5E7EB everywhere
- **Spacing**: 16px / 24px / 32px rhythm
- **Buttons**:
  - Primary: bg #E20074, text white, hover darken 10%
  - Secondary: bg white, border #E5E7EB, text #1A1A1A
  - Danger: bg white, border #EF4444, text #EF4444
- **KPI cards**: white bg, border, 12px label on top in gray, 28px number below in dark, subtle left border accent in magenta

### Navigation
- **Sidebar (Admin portal)**: 240px wide, white bg, border-right, logo at top, nav items with icon + label, active item has left border in #E20074 and light magenta bg (#FFF0F8)
- **Top nav (SME portal)**: 56px tall, white bg, 1px border-bottom #E5E7EB. Left: "Thoth · SME" wordmark. Center: nav links (Dashboard · Interviews · Knowledge Approval · Escalated Questions). Active link uses magenta text (#E20074) with a 2px magenta underline; inactive links are #1A1A1A/70 and darken on hover. Right: user avatar circle (initials, magenta bg). **No red badges or notification dots anywhere in the SME nav.**
- **Top bar (Admin portal)**: white, border-bottom, page title left, user avatar right

---

## Pages to Build

---

### 1. USER — Chat Interface (`/`)

**Layout**: Left sidebar (260px) + main chat area

**Left sidebar**:
- "New Chat" button at top (magenta, full width)
- Chat history list below — each item shows first message truncated + timestamp
- Active chat highlighted

**Main area — top header bar**:
- Text: *"Answers are based on approved expert knowledge and do not constitute professional advice"*
- Font: 12px, color #6B7280, centered, border-bottom

**Chat messages area** (scrollable):
Three message types, all use the same bubble component but different styles:

*Type 1 — Answer (grounded)*
- AI bubble (gray, left)
- Answer body text
- Source citation card below bubble:
  ```
  [document icon] Vendor_Compliance_Guide.pdf
  Approved by Sarah Chen · Last Reviewed: Apr 2026
  ```
  Style: white bg, border, 12px text, rounded

*Type 2 — Clarification*
- AI bubble (gray, left) with question text
- Below bubble: category chip buttons (pill style, border, hover fills magenta)
  e.g. [Trade Compliance] [Digital Assets] [Dispute Resolution]

*Type 3 — Routing*
- AI bubble (gray, left) explaining why no answer
- SME recommendation cards below (horizontal scroll if multiple):
  ```
  [avatar initials] Dr. Elara Voss
  MEZ Trade Compliance
  Reason: Encryption hardware falls under Article 14
  [Contact via email →]
  ```
  Style: white card, border, 200px wide

**Bottom input area**:
- Textarea (auto-resize, max 4 rows)
- Send button (magenta icon button, right)
- "Enter to send · Shift+Enter for new line" hint text

---

### 2. SME — Login / Register Page (`/sme/login`)

This is the SME portal entry point. The role-selection home page routes here when the user picks "SME".

**Layout**: Centered card (480px wide) on gray bg #F9FAFB. "Thoth · SME" wordmark above the card, links to `/`.

**Tabs (top of card)**: Two tabs — "Login" (default) and "Register". Active tab uses magenta text + 2px magenta underline; inactive tabs are #1A1A1A/70.

**Login tab**:
- Email input (required)
- "Continue" button — full width, magenta
- On submit → redirect to `/sme/dashboard`

**Register tab fields**:
- Full Name (required)
- Role (optional) — placeholder "e.g. Senior Compliance Officer"
- Specialization (required) — placeholder "e.g. MEZ Trade Compliance"
- Sub Expertise (required) — tag input, press Enter to add a tag, show as removable pills (magenta text on light magenta bg, ✕ to remove)
- Email (required)
- Department (optional)
- "Submit" button — full width, magenta
- On submit → redirect to `/sme/dashboard`

**Validation** (both tabs): show red border + 12px red error text below the field on empty required fields. Errors clear as soon as the user types in the offending field.

---

### 3. SME — Dashboard (`/sme/dashboard`)

**Layout**: Top nav (see Navigation section) + main content. No sidebar in the SME portal.

**Top nav links** (centered):
- Dashboard
- Interviews
- Knowledge Approval
- Escalated Questions

No red badges / notification dots are shown on any link.

**Main content**:

*Welcome header*: "Welcome back, [Name]" + specialization in gray below

*KPI cards row* (4 cards):
- Pending Interviews
- Pending Reviews
- Escalated Questions
- Approved Entries

*Interview list section*:
Table with columns: Topic · Requested by · Status badge · Timestamp
- Status badges use the status colors defined above
- **No Action column.** The entire row is clickable and navigates to `/sme/interview/[id]`
- Row hover state: bg #F9FAFB, `cursor: pointer`

*Pending reviews section*:
Small preview list — topic + status badge + "Review" button

*Escalated questions (unanswered)*:
List items — question text truncated + timestamp + "Answer" button

---

### 4. SME — Interview Chatbox (`/sme/interview/[id]`)

**Layout**: Full page, split — left panel (interview) + right panel (context, collapsible)

**Top bar**:
- Back arrow + Topic title
- Turn counter: "Turn 3 · In Progress"
- "End Interview" button (secondary, right)

**Chat area**:
- AI questions: left-aligned, gray bubble, labeled "AI Interviewer"
- SME answers: right-aligned, magenta bg, white text
- Current/latest AI question: highlighted with left border in magenta, slightly larger

**Bottom input**:
- Large textarea (6 rows minimum) — "Share your expertise in detail..."
- "Submit Answer" button (magenta, full width below textarea)
- Character count hint

---

### 5. SME — Knowledge Approval (`/sme/knowledge`)

**Layout**: Two-panel — left list (340px) + right editor (remaining)

**Left panel — pending list**:
Each item card shows:
- Topic (bold)
- Status badge
- Last updated + Review due date
- Source count ("2 sources")
- Active item has magenta left border

**Right panel — editor**:
*Header*:
- Topic title
- Source pills: "From: Interview #3" "From: Compliance_Guide.pdf"
- If rejected: red banner "Rejected by Admin" + comment text in amber bg box

*Content area*:
- Editable textarea (fills remaining height)
- Monospace-ish font, comfortable line height

*Footer action bar*:
- "Save Changes" button (secondary, left)
- "Approve" button (green, right)

**Below left panel — existing entries**:
Completed/approved entries list, read-only, collapsed by default

---

### 6. SME — Escalated Question Answer (`/sme/escalated/[id]`)

**Layout**: Full page chat view

**Top bar**:
- Question title (first 60 chars of question)
- "Cannot Answer — Escalate to Admin" button (secondary danger, top right)

**Chat history area** (read-only):
- Shows full User ↔ AI conversation in chronological order
- User bubbles: magenta right
- AI bubbles: gray left
- Divider line + label "Forwarded to SME" at the handoff point

**SME reply area** (bottom):
- Textarea: "Type your answer..."
- "Send Answer" button (magenta)

---

### 7. ADMIN — Dashboard (`/admin/dashboard`)

**Layout**: Sidebar nav + main content

**Sidebar nav items**:
- Dashboard
- Manage SMEs
- Approve Knowledge
- Knowledge Base
- Start Interview
- Escalated Questions — red badge

**KPI cards row** (4 cards):
- Pending Approvals
- SMEs Onboarded
- Approved Entries
- Escalated Questions

**Pending admin approvals section**:
- Section title + "View All" link
- 3 preview cards: topic + SME name + sme_approved badge + "Review" button

**Escalated questions — unanswered**:
- List: question text + routed from + timestamp + "Answer" button

**Escalated questions — answered**:
- Collapsed list, "Show X answered" toggle

---

### 8. ADMIN — Start Interview (`/admin/interview/new`)

**Layout**: Centered form card (560px)

**Fields**:
- Topic (required, textarea, 2 rows)
- Select SME:
  - "Recommend" tab: show AI-suggested SMEs based on topic (mock: just show list with match reason)
  - "Select manually" tab: searchable dropdown of all SMEs
- Selected SME preview card: name + specialization + email

**Submit**: "Start Interview" button (magenta, full width)
After submit: show success toast "Interview created · Dr. Elara Voss has been notified"

---

### 9. ADMIN — Manage SMEs (`/admin/smes`)

**Layout**: Full width list page

**Top bar**: "SME Directory" title + search input (right)

**SME cards grid** (2 columns):
Each card:
- Avatar circle (initials, magenta bg)
- Name (bold) + Role
- Specialization + sub-expertise tags (pill style)
- Email + Department
- Stats row: "4 interviews · 12 approved entries"
- "View Profile" button

---

### 10. ADMIN — Approve Knowledge (`/admin/approve`)

**Layout**: Full width, paginated list

**Section header**: "Pending Approval" + count badge (highlighted in magenta)
Only shows `sme_approved` status entries.

**Each approval module** (10 per page):
Card layout:
- Topic + SME name + sme_approved badge
- "SME Approved on [date]" in gray
- Full content text (read-only, scroll if long)
- Source pills: "Interview #2" "material.pdf"
- Action bar:
  - "Approve" button (green)
  - "Reject" button (red, outlined) → expands inline comment textarea → "Confirm Reject"
- Cannot edit content

---

### 11. ADMIN — Knowledge Base Browse (`/admin/knowledge`)

**Layout**: Filter sidebar (220px) + entries list

**Filter sidebar**:
- Filter by SME (checkboxes)
- Filter by Status: sme_approved / approved / rejected (checkboxes)
- Filter by Topic (text search)
- "Clear filters" link

**Entries list**:
Each row: Topic · SME name · Status badge · Created date · "View" button
Click row → slide-in detail panel from right showing full content + sources + approval timeline

---

## Mock Data to Use

This is the shared fixture — same data used by frontend MSW and backend `seed.py`. Do not invent new IDs.

```typescript
// frontend/lib/mock/fixtures.json

// 3 SMEs
const smes = [
  { sme_id: "sme_001", name: "Dr. Elara Voss", specialization: "MEZ Trade Compliance",
    sub_areas: ["Restricted commodity transfers", "Compliance certifications"],
    contact_email: "e.voss@mez.org", created_at: "2026-05-01T10:00:00Z" },
  { sme_id: "sme_002", name: "Marcus Tanaka", specialization: "MEZ Digital Asset Protections",
    sub_areas: ["Registered algorithms", "Digital IP licensing"],
    contact_email: "m.tanaka@mez.org", created_at: "2026-05-02T10:00:00Z" },
  { sme_id: "sme_003", name: "Dr. Nadia Okafor", specialization: "MEZ Dispute Resolution",
    sub_areas: ["Arbitration procedures", "MEZ Tribunal filing"],
    contact_email: "n.okafor@mez.org", created_at: "2026-05-03T10:00:00Z" },
]

// 2 interviews with turns
const interviews = [
  { interview_id: "int_001", sme_id: "sme_001", topic: "Restricted Transfer Violations",
    status: "completed", created_at: "2026-05-02T09:00:00Z" },
  { interview_id: "int_002", sme_id: "sme_002", topic: "Algorithm Registration Process",
    status: "in_progress", created_at: "2026-05-03T14:00:00Z" },
]

// 3 materials
const materials = [
  { material_id: "mat_001", sme_id: "sme_001", title: "Vendor Compliance Guide",
    file_type: "application/pdf", status: "processed", created_at: "2026-05-01T11:00:00Z" },
  { material_id: "mat_002", sme_id: "sme_001", title: "MCC Article 14 Reference",
    file_type: "text/plain", status: "processed", created_at: "2026-05-01T12:00:00Z" },
  { material_id: "mat_003", sme_id: "sme_002", title: "Digital Assets Framework",
    file_type: "application/pdf", status: "processed", created_at: "2026-05-02T10:00:00Z" },
]

// 5 knowledge entries — all 4 statuses covered
const entries = [
  { entry_id: "ke_001", sme_id: "sme_001", topic: "Restricted Transfer Violations",
    status: "approved", content: "Under MCC Article 14...",
    sources: { interviews: ["int_001"], materials: ["mat_001", "mat_002"] },
    created_at: "2026-05-03T10:00:00Z", updated_at: "2026-05-04T10:00:00Z",
    admin_approved_at: "2026-05-04T10:00:00Z" },
  { entry_id: "ke_002", sme_id: "sme_002", topic: "Algorithm Registration Process",
    status: "sme_approved", content: "To register a digital algorithm under MEZ...",
    sources: { interviews: ["int_002"], materials: ["mat_003"] },
    created_at: "2026-05-04T09:00:00Z", updated_at: "2026-05-04T09:00:00Z" },
  { entry_id: "ke_003", sme_id: "sme_001", topic: "Vendor Compliance Escalations",
    status: "draft", content: "Vendor compliance escalations are handled by...",
    sources: { interviews: ["int_001"], materials: ["mat_001"] },
    created_at: "2026-05-04T11:00:00Z", updated_at: "2026-05-04T11:00:00Z" },
  { entry_id: "ke_004", sme_id: "sme_003", topic: "Tribunal Filing Procedures",
    status: "rejected", content: "Filing a dispute with the MEZ Tribunal requires...",
    sources: { interviews: [], materials: [] },
    created_at: "2026-05-03T15:00:00Z", updated_at: "2026-05-04T08:00:00Z",
    rejection_reason: "Content is incomplete. Please add the filing fee schedule." },
  { entry_id: "ke_005", sme_id: "sme_001", topic: "Export Control Classifications",
    status: "approved", content: "Category B items under MEZ export control include...",
    sources: { interviews: ["int_001"], materials: ["mat_002"] },
    created_at: "2026-05-02T16:00:00Z", updated_at: "2026-05-03T09:00:00Z",
    admin_approved_at: "2026-05-03T09:00:00Z" },
]

// Sample chat showing all 3 response types + SME/Admin bubble
const sampleChat = [
  { role: "user", content: "What are the four elements of a restricted transfer violation?" },
  { role: "ai", response_type: "answer", grounded: true,
    content: "Under MCC Article 14, a restricted transfer violation requires four elements...",
    sources: [{ entry_id: "ke_001", sme_name: "Dr. Elara Voss", topic: "Restricted Transfer Violations" }],
    disclaimer: "This information is based on approved expert knowledge and does not constitute professional advice." },
  { role: "user", content: "What are the compliance requirements?" },
  { role: "ai", response_type: "clarification", grounded: false,
    content: "Could you clarify which compliance area you are asking about?",
    chips: ["Trade Compliance", "Digital Assets", "Dispute Resolution"] },
  { role: "user", content: "How do I file with the MEZ Tribunal?" },
  { role: "ai", response_type: "routing", grounded: false,
    content: "I don't have detailed information on tribunal filing in my knowledge base.",
    routed_to: [{ type: "sme", sme_name: "Dr. Nadia Okafor",
      specialization: "MEZ Dispute Resolution",
      reason: "Tribunal filing falls under Articles 42-48 which is Dr. Okafor's specialization.",
      email: "n.okafor@mez.org" }] },
  { role: "sme", sme_name: "Dr. Nadia Okafor",
    content: "To file with the MEZ Tribunal, you must first submit Form T-14 within 30 days..." },
]
```

---

## Critical Business Rules (do not get these wrong)

1. **Only `approved` entries are visible to users** — `draft` and `sme_approved` entries must never appear in the User chat interface or be cited as sources
2. **Status flow is strict**: `draft → sme_approved → approved`. Skipping steps is not allowed. Any button that would cause an invalid transition should be hidden or disabled
3. **Admin cannot edit knowledge content** — on the Admin Approve page, the content area is read-only. Only SMEs can edit via PUT
4. **Rejection reason** — only show the admin comment box in the SME editor when status is `rejected`
5. **Interview is started by Admin** — SMEs cannot create interviews themselves. The "Start Interview" flow lives only in the Admin portal
6. **Session ID** — every `/query` call must include a `session_id`. Generate a UUID when "New Chat" is clicked and reuse it for all messages in that conversation

1. **Navigation**: Use Next.js `Link` for all routing, no page reloads
2. **Active nav item**: highlight with left border `border-l-2 border-[#E20074]` + `bg-pink-50`
3. **Status badges**: always use the color map defined above, never plain gray for all
4. **Chat bubbles**: user = right + magenta, AI = left + gray, SME = left + purple tint, Admin = left + amber tint
5. **Tag input** (sub expertise): on Enter key, push to array and clear input, show as removable pills
6. **KPI cards**: large number centered, small gray label above, thin magenta left border accent
7. **Toast notifications**: bottom-right, auto-dismiss after 3s
8. **Empty states**: when a list is empty, show centered gray text + icon, not a blank space
9. **Loading states**: use skeleton loaders (gray animated bars), not spinners
10. **Mobile**: not required, desktop-first only (min-width 1024px)

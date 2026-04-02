# Anne OS — Data Model

How Anne organizes information in Airtable (base: `app0QFzXHkZ6MeiO1`).

---

## Open Loops vs Action Items

| | Open Loops | Action Items |
|---|---|---|
| **What it is** | Unresolved things needing follow-up | Concrete next steps with a clear owner |
| **Example** | "Figure out Dante's online school options" | "Email Excel High School for enrollment info" |
| **When Anne creates one** | You mention something to track or revisit | A specific task is identified |
| **Has due date?** | No | Yes |
| **Resolved by** | Status → Done | Status → Done |

**Rule of thumb:** Open Loops are *things on your mind*. Action Items are *things on your to-do list*.

An Open Loop often spawns one or more Action Items once you decide how to act on it.

---

## Tables

### Open Loops (`tblgs70GonCWpyNGA`)
Unresolved items Anne is tracking on your behalf.

| Field | Type | Notes |
|---|---|---|
| Loop Name | Text | The thing being tracked |
| Domain | Text | AI, Thai Moon, National Grid, Family, Health, Finance, Vision, Personal |
| Priority | Select | Urgent, High, Medium, Normal, Low |
| Status | Select | Open, In Progress, Done |
| Description | Text | Context or background |
| Anne's Watch Note | Text | Anne's internal note on this loop |
| Last Touched | Date | When it was last updated |
| Resolved Date | Date | When it was closed |

---

### Action Items (`tblFHz0ru74OXCBQP`)
Concrete tasks with a clear next step.

| Field | Type | Notes |
|---|---|---|
| Task | Text | What needs to be done |
| Domain | Text | Which area of life this belongs to |
| Assigned To | Text | Who owns it |
| Due Date | Date | YYYY-MM-DD |
| Priority | Select | Urgent, High, Medium, Normal, Low |
| Status | Select | Open, In Progress, Done, Blocked |
| Notes | Text | Additional context |

---

### Sessions (`tblvfxo7ixl84jgbw`)
Log of every Anne ↔ Tammy conversation.

| Field | Type | Notes |
|---|---|---|
| Title | Text | Session summary title |
| Date | Date | When the session happened |
| Domain(s) | Text | Topics covered |
| Summary | Long text | What was discussed |
| Key Decisions | Long text | Decisions made |
| Session Type | Select | Planning, Check-in, Deep Work, etc. |
| Mood/Energy | Select | Tammy's state during the session |

---

### People (`tblFhh0JE7VIcVMDf`)
Relationship map — people in Tammy's life and work.

| Field | Type | Notes |
|---|---|---|
| Name | Text | Full name |
| Role | Text | What they do |
| Domain | Text | Which area they relate to |
| Relationship | Text | How they connect to Tammy |
| Contact Priority | Select | How often to stay in touch |
| Notes | Text | Key context |
| Last Mentioned | Date | When they last came up |

---

### Anne's Observations (`tblQsIyAVzdVZlcDD`)
Patterns and insights Anne notices over time.

| Field | Type | Notes |
|---|---|---|
| Observation | Text | What Anne noticed |
| Date | Date | When observed |
| Category | Select | Pattern, Risk, Opportunity, etc. |
| Domain | Text | Which area it relates to |
| Detail | Long text | Full context |
| Acknowledged | Checkbox | Tammy has seen this |
| Outcome | Text | What happened as a result |

---

### Routines (`tblNTsh2IA7VORdQ4`)
Recurring habits and rituals Anne tracks.

| Field | Type | Notes |
|---|---|---|
| Routine | Text | Name of the habit |
| Frequency | Select | Daily, Weekly, Monthly |
| Timing | Text | When it happens |
| Domain | Text | Which area it belongs to |
| Last Completed | Date | Most recent completion |
| Next Due | Date | When it's due next |
| Status | Select | Active, Paused, Retired |
| Notes | Text | Context |

---

### Message Buffer (`tblLYhdmNLzLQjb1h`)
Raw Telegram message log used internally by n8n.

| Field | Notes |
|---|---|
| Message | Tammy's incoming message |
| Response | Anne's reply |
| Timestamp | When the exchange happened |
| Chat ID | Telegram chat identifier |
| Logged | Whether it's been processed |

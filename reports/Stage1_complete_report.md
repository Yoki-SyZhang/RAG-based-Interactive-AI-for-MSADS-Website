# Stage 1 Data Cleaning Pipeline — Complete Report

## Overview

`scripts/Stage1_data_processing/clean_for_structure.ipynb` is the full Stage 1 pipeline for the RAG chatbot project. It ingests 176 raw-scraped pages of the UChicago DSI website, classifies them by relevance, cleans and structures the text of the 14 highest-priority pages, applies PII redaction and content warnings, and exports one JSON file per page to `data/cleaned_sections/`.

---

## Section-by-Section Summary

### § 1 — Priority Classification

Loads all `page_*.json` files from `data/raw_scraped_pages/` (176 pages) and the hand-authored `docs/url_classification.json` (68 entries, 19 URL patterns). Each page URL is looked up against the classification table; unmatched URLs are tested against regex patterns.

**Result:**

| Priority    | Count |
|-------------|-------|
| must        | 14    |
| dsi-general | 7     |
| optional    | 10    |
| alias       | 0     |
| skip        | 145   |

A gap-check confirms all `must` and `should` entries from the classification table have corresponding raw files — no pages are missing.

---

### § 2 — Header & Footer Classification

Loads `footer.json` (21 links found in the site footer). Each link is matched against the raw page set:

- **dsi-general** (12): URLs that exist as scraped pages — institutional pages like `/about`, `/research`, `/education`
- **footer-only** (9): External links (social media, UChicago accessibility, physical sciences division) — no raw page content

---

### § 3 — Generate Bottom Table

#### § 3.1 — Build `url_classes`

Merges § 1 and § 2 results into a unified `url_classes` dict. Footer links already in the raw pages are promoted to `dsi-general` if not already in a higher tier. Final counts:

| Class       | Count |
|-------------|-------|
| must        | 14    |
| dsi-general | 14    |
| optional    | 10    |
| footer-only | 9     |


#### § 3.2 — Build `records`

Constructs a unified `records` list (38 rows) for all must/dsi-general/optional pages. Each row includes: `source_file`, `url`, `canonical_url`, `priority`, `depth`, `special_handling`, `page_title`, `meta_description`, `breadcrumbs`, `scraped_at`, `all_text_markdown`, `sections`.

Also builds `footer_links` (21 entries with `text` + `href`) for potential footer context injection.

---

### § 4 — Clean Universal Artifacts

Deep-copies `records` → `cleaned_records` to preserve the raw foundational table.

#### § 4.1 — `must` batch

Converts raw `sections` (nested content items from the spider) into `structured_sections` — a flat list of heading-anchored markdown blocks. Each `## Heading` starts a new section; all following text appends to it until the next heading. Two nav artifacts (section_index 0 = breadcrumb nav, section_index 1 = social Follow sidebar) are stripped from all must pages except `page_042` and `page_159`, which have different structures.


#### § 4.2 — dsi-general / optional batch

Loaded and indexed but **not yet processed**. Structured section extraction for these 24 pages is pending the professor's decision on whether they enter RAG.

---

### § 5 — Per `special_handling` Cleaning

Initializes a `Note` field (empty string) on all 38 records, then populates it for two pages:

- **§ 5.1** — `page_164` (Events & Deadlines): Note warns that the content is time-sensitive, records the scrape timestamp, and recommends verifying on the official website.
- **§ 5.2** — `page_165` (Career Outcomes): Note warns that employer logos and career outcome charts are embedded as images and cannot be interpreted by the model.

---

### § 6 — PII Redaction

Applies regex-based redaction across `all_text_markdown` and all `structured_sections[*].text_markdown` for all 14 must records:

- Personal email addresses are replaced with `***`, except two whitelisted program addresses (`applieddatascience-advising@uchicago.edu`, `applieddatascience-admissions@uchicago.edu`)
- Personal office/room numbers (e.g., "Room 340", "Office 12") are replaced with `***`
- When redaction occurs, the `Note` field is prepended with a standard PII-redaction disclaimer

**Result:** 0 records modified — no personal PII was found in the current must-page content.

---

### § 7 — Export

#### § 7.1 — Format `records_for_RAG`

Selects only the 14 `must` records and drops internal-only fields (`priority`, `depth`, `special_handling`, `all_text_markdown`, `sections`). URLs are normalized (trailing slash added). Breadcrumbs list is flattened to a `" > "` separated string.

Two post-processing steps follow:

1. **Alias URL merging**: If a page's `canonical_url` has alias URLs in `url_classification.json`, those aliases are appended to the `url` field as a list. The operation is idempotent.

2. **Redundant first section removal**: If `structured_sections[0].text_markdown` — after stripping to plain ASCII letters, spaces, hyphens, commas, and ampersands — is a substring of `page_title`, that section is deleted. This removes section headers that simply echo the page title (e.g., a section containing only "How to Apply" on the "How to Apply | DSI" page). Applied to 8 of 14 records.

#### § 7.2 — Export

Saves each of the 14 `records_for_RAG` entries as an individual JSON file to `data/cleaned_sections/`, named `{source_file_stem}_cleaned.json` (e.g., `page_042_cleaned.json`).

---

## Final Output Schema

Each file in `data/cleaned_sections/` is a single JSON object with the following fields:

```json
{
  "source_file":       "page_042.json",
  "url":               "https://.../" ,
  "canonical_url":     "https://.../",
  "page_title":        "Master's in Applied Data Science | DSI",
  "meta_description":  "...",
  "breadcrumbs":       "Home > Education > Masters Programs > Ms In Applied Data Science",
  "scraped_at":        "2026-04-19T01:41:58.015608+00:00",
  "structured_sections": [
    { "section_index": 0, "text_markdown": "## Heading\n...content..." },
    { "section_index": 1, "text_markdown": "## Next Section\n..." }
  ],
  "Note":              ""
}
```

**Field notes:**

| Field | Type | Notes |
|---|---|---|
| `url` | string or list | List when aliases exist (e.g., in-person program has two public URLs) |
| `canonical_url` | string | Always a single normalized URL |
| `breadcrumbs` | string | Flattened from list; empty string if unavailable |
| `structured_sections` | array | Ordered heading-anchored markdown blocks; variable count per page (4–52) |
| `Note` | string | Empty or contains time-sensitivity / image-content / PII-redaction warnings |

---

## Why Page-Level Output (Not Section-Level)

The sections within a single page vary enormously in length and semantic weight. Some sections are one sentence; others span multiple paragraphs.

Deciding whether to merge adjacent sections, split a long section, or keep a short section standalone is a **chunking problem** that requires knowledge of surrounding context — page type, topic coherence, and target chunk token size. That decision belongs to the Stage 2 chunking layer, not the cleaning layer.

Exporting at page-level preserves:
- **All metadata** (title, breadcrumbs, URL, note) accessible alongside every chunk
- **Section boundaries** as natural split points the chunker can use or merge across
- **Full page context** so the chunker can make informed decisions (e.g., merge the two-line "Apply Today!" section into the preceding one)

Splitting into sections at Stage 1 would force the chunker to reconstruct context it no longer has, or duplicate metadata across dozens of tiny files.

---

## URL Coverage Status

**Currently in RAG (this pipeline):** 14 `must` pages — the core MS-ADS program pages (program overview, how to apply, FAQs, course progressions, in-person/online programs, instructors, tuition, students, events, career outcomes, capstone archive, capstone projects, campus tour).

**Pending professor's decision:**

| Class | Count | Description |
|---|---|---|
| dsi-general | 14 | DSI institutional pages (about, research, education, news, events, etc.) |
| optional | 10 | Capstone project showcase pages (individual research project pages) |

These 24 pages are loaded into `cleaned_records` (§ 3.2) but their `structured_sections` have not been extracted (§ 4.2 is a stub). They will enter the RAG pipeline only after the professor confirms which priority classes should be included.

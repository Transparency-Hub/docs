# Public API (Phase 1) — QA Guide

A step-by-step test plan for the **new Public API and the API Keys settings page**. Part A is done in a normal web browser. Part B needs a tool that can send web requests — **Postman** (free desktop app) or the `curl` command in a terminal. Copy-paste commands are given for `curl`; every one has a Postman equivalent (method + URL + header + body).

> **How to read this**: each test has **Steps** (what you do) and **Expected** (what you should see). If what you see matches → tick the box. If it doesn't → write it up using the **Bug Reporting Template** at the bottom.

### What this feature is (in plain English)

- Chapter admins can now create **API keys** under **Settings → API Keys**. A key is a long secret string that starts with `thn_test_` (test environment) or `thn_live_` (production).
- External tools (a CRM, Zapier, a spreadsheet script) present that key to a new set of web addresses — the **public API** — to read and update **members**, **membership types** and **events** for the chapter, without logging in to the app.
- Each key only has the **scopes** (permissions) the admin ticked when creating it, e.g. "Read members" but not "Create and update members".
- A key can be **revoked** at any time; tools using it stop working immediately.

Run the **P0** sections first (1–4). **P1** (5–7) is the deeper pass. **P2** (8) is polish.

---

## 0. Before You Start

Ask the person who set up your test environment to give you / confirm the following. If any are missing, pause and ask.

- [ ] The **website address** to test on (e.g. `https://testapp.transparencyhubnetwork.ai`).
- [ ] The **API address** for the same environment. Everything in Part B goes under `<API>/api/v1/...`. On test this is normally `https://testapp.transparencyhubnetwork.ai/api/v1` — confirm it.
- [ ] Confirmation that **the public API is switched on** in this environment (the setting is called `PUBLIC_API_ENABLED`). If it is off, every Part B test returns `404` — ask for it to be enabled before starting.
- [ ] An **admin login** for a chapter you can experiment in freely (must be able to see **Settings**).
- [ ] A **second admin login for a different chapter** in the same association (for the "wrong chapter" tests in section 6). If none exists, note it and skip 6.3–6.4.
- [ ] A **login that is NOT an admin** (a plain member of the same chapter) — for test 1.7.
- [ ] The chapter's **numeric id** (ask; it appears in some admin URLs). Write it here: `CHAPTER_ID = ______`
- [ ] **Postman** installed, or a terminal where `curl` works (`curl --version` prints something).
- [ ] The chapter should already have **at least 3 members, 1 membership type and 1 event**. If not, create them in the app first.

> **Tip:** keep a text file open while testing. You will be pasting keys and ids into it; the key is shown **only once**.

### Setting up the request tool (do once)

**curl:** in the commands below, replace `<API>` with the API address and `<KEY>` with the key you create in test 1.2. Keep the quotes.

**Postman:** create a Collection, add a variable `api` = the API address and `key` = your key. For every request: set the method and URL as written, and add a header `Authorization` with value `Bearer {{key}}`. For POST/PATCH set Body → raw → JSON.

---

## Part A — API Keys page (browser)

## 1. Creating and managing keys (P0)

Where: **Admin → Settings → API Keys** (new entry under Settings in the left menu).

### 1.1 The page exists and is empty
**Steps:** Log in as the chapter admin. Open Settings → API Keys.
**Expected:**
- [ ] The page opens with the normal admin header and the title **"API Keys"**.
- [ ] A table with columns *Name, Key, Scopes, Created, Last used, Status* and a **Create key** button.
- [ ] If no keys exist yet, the table says **"No API keys yet."**

### 1.2 Create a read-only key
**Steps:** Click **Create key**. Name: `QA read only`. Tick **Read members**, **Read membership types**, **Read events**. Leave expiry empty. Click **Create**.
**Expected:**
- [ ] The dialog closes and a yellow panel appears at the top: **New key "QA read only"** with the full key in a box, a **Copy** button and the text *"Copy this key now — it will not be shown again."*
- [ ] The key starts with `thn_test_` (on production it would start with `thn_live_`) and is long (about 40 characters).
- [ ] **Copy** puts the key on your clipboard (paste it into your text file — this is `<KEY>` for Part B) and shows a "Copied" toast.
- [ ] The table now lists **QA read only**, with only the first 12 characters of the key followed by `…`, the three scopes as small badges, today's date under *Created*, `—` under *Last used*, and status **active**.
- [ ] Click **Dismiss** on the yellow panel. Reload the page. The full key is **not shown anywhere** — only the 12-character prefix.

### 1.3 Create a read-write key
**Steps:** Create key. Name: `QA read write`. Tick **all six** scopes. Click **Create**. Copy the key into your text file as `<RW_KEY>`.
**Expected:**
- [ ] Same as 1.2; the table shows six scope badges.

### 1.4 Validation in the dialog
**Steps:** Click **Create key**. Click **Create** with nothing filled.
**Expected:** [ ] Red text **"Name is required"**; nothing created.
**Steps:** Type a name, tick no scopes, click **Create**.
**Expected:** [ ] Red text **"Select at least one scope"**; nothing created.
**Steps:** Click **Cancel**.
**Expected:** [ ] Dialog closes, table unchanged.

### 1.5 Key with an expiry
**Steps:** Create key. Name: `QA expiring`. Tick **Read events**. Set *Expires* to **tomorrow**. Create.
**Expected:** [ ] Created and listed as **active**. (You will use it in test 8.1 if you can test again after it expires.)
**Steps:** Create another key, name `QA past`, tick a scope, set *Expires* to **yesterday**. Create.
**Expected:** [ ] An error is shown in the dialog (mentions expiry must be in the future); nothing is created.

### 1.6 Revoke a key
**Steps:** On `QA expiring`, click **Revoke**. Read the confirmation.
**Expected:**
- [ ] A confirmation dialog: *Revoke "QA expiring"?* with text saying integrations using it will stop working immediately, and buttons **Revoke** / **Cancel**.
- [ ] **Cancel** leaves it active.
- [ ] Clicking **Revoke** again and confirming: toast **"API key revoked"**, status becomes **revoked**, and the **Revoke** button disappears for that row.

### 1.7 Non-admins cannot see the page
**Steps:** Log out. Log in as the plain (non-admin) member. Try to open the API Keys page directly by typing its address: `<website>/admin/settings/api-keys`.
**Expected:** [ ] You land on a "not allowed" (403) page, or are redirected away; the keys table is never shown.

---

## Part B — Using the API (Postman / curl)

Replace `<API>`, `<KEY>`, `<RW_KEY>` and `<CHAPTER_ID>` in every command. Responses are JSON; read the `status`, `code` and `data` fields.

## 2. Reading data (P0)

### 2.1 List members
**Steps:**
```
curl -s "<API>/members?limit=5" -H "Authorization: Bearer <KEY>"
```
**Expected:**
- [ ] `"status": "success"`.
- [ ] `"data"` is a list of up to 5 members, each with `id, firstname, lastname, email, chapter_id, status ("active"/"inactive"), createddate …`.
- [ ] `"pagination": {"total": <number of members in the chapter>, "offset": 0, "limit": 5}`.
- [ ] **Nothing secret is present**: search the response for `password`, `otp`, `token` — none of these words should appear.
- [ ] Dates end with `Z` (e.g. `2026-01-15T10:00:00Z`).

### 2.2 Paging
**Steps:** Run 2.1 with `?limit=2&offset=0`, then `?limit=2&offset=2`.
**Expected:** [ ] Different members in each call; no member appears twice; `pagination.total` is the same in both.

### 2.3 Search and status filters
**Steps:** `?search=<part of a real member's last name>` then `?status=active` then `?status=inactive`.
**Expected:**
- [ ] Search returns only matching members (first name, last name or email contains the text, case-insensitive).
- [ ] `status=active` and `status=inactive` split the members; the two `total`s add up to the unfiltered total.
- [ ] `?status=nonsense` → `"code": "validation_error"` with HTTP 400.

### 2.4 Get one member
**Steps:** Take an `id` from 2.1:
```
curl -s "<API>/members/<id>" -H "Authorization: Bearer <KEY>"
```
**Expected:** [ ] `success`, `data` is that one member (same fields as in the list).
**Steps:** Use an id that does not exist, e.g. `999999999`.
**Expected:** [ ] HTTP 404, `"code": "not_found"`.

### 2.5 Membership types
**Steps:** `<API>/membership-types` and then `<API>/membership-types/<id>` with an id from the list.
**Expected:**
- [ ] List and single both `success`; fields include `name, category, description, duration, renewal_timeline, deactivation_timeline, is_end_date_fixed, autorecurring_payment, membership_privacy`.
- [ ] The names match what you see under **Admin → Membership Types** in the app.

### 2.6 Events
**Steps:** `<API>/events?limit=5`, then `<API>/events/<id>`.
**Expected:**
- [ ] `success`; events are listed **newest start first**; fields include `title, venue, start_date_time, end_date_time, timezone, all_participant, record_meeting, waiting_room_enabled`.
- [ ] `?from=2030-01-01T00:00:00Z` returns only events starting after 2030 (probably none → empty `data`, `total: 0`).
- [ ] `?from=yesterday` → 400 `validation_error`.

### 2.7 Every response carries rate-limit headers
**Steps:** Run any successful call with `curl -s -i ...` (the `-i` shows headers), or look at the Headers tab in Postman.
**Expected:** [ ] Headers `X-RateLimit-Limit: 100` is present.

---

## 3. Writing data (P0)

Use `<RW_KEY>` for this section.

### 3.1 Create a member
**Steps:**
```
curl -s -X POST "<API>/members" -H "Authorization: Bearer <RW_KEY>" -H "Content-Type: application/json" -d "{\"firstname\":\"Api\",\"lastname\":\"Tester\",\"email\":\"api.tester.<today>@example.com\"}"
```
(Use a fresh email each run, e.g. add the date.)
**Expected:**
- [ ] HTTP **201**, `success`, `data.id` is a new number, `data.status` is `"inactive"` (new members start inactive, as when an admin adds one in the app).
- [ ] In the app (**Admin → Members**) the new member **Api Tester** appears.
- [ ] Run the same command again with the **same email**: HTTP 400, `"code": "request_failed"`, message says the email already exists for the chapter.

### 3.2 Create — validation
**Steps:** POST with body `{"firstname":"Only"}`.
**Expected:** [ ] 400 `validation_error`, `details.missing` lists `lastname` and `email`.
**Steps:** POST with body `not json`.
**Expected:** [ ] 400 `validation_error` ("must be valid JSON").

### 3.3 Update a member
**Steps:** With the id from 3.1:
```
curl -s -X PATCH "<API>/members/<id>" -H "Authorization: Bearer <RW_KEY>" -H "Content-Type: application/json" -d "{\"firstname\":\"Changed\",\"email\":\"hacked@example.com\",\"password\":\"x\"}"
```
**Expected:**
- [ ] HTTP 200; `data.firstname` is `Changed`; `data.email` is **unchanged** (email and password cannot be changed via the API).
- [ ] In the app the member's first name shows **Changed**.
- [ ] PATCH with body `{"email":"x@y.z"}` only → 400 `validation_error` ("No editable fields supplied"), and `details.editable` lists the allowed fields.

### 3.4 Update a membership type
**Steps:** Note the current `description` of a membership type from 2.5, then:
```
curl -s -X PATCH "<API>/membership-types/<id>" -H "Authorization: Bearer <RW_KEY>" -H "Content-Type: application/json" -d "{\"description\":\"Updated by QA via API\"}"
```
**Expected:**
- [ ] 200; `data.description` is the new text; **every other field is unchanged** (name, category, duration, timelines).
- [ ] **Admin → Membership Types** shows the new description; the type's dues, workflow and application form are untouched.
- [ ] Put the original description back with another PATCH.

### 3.5 Create an event
**Steps:**
```
curl -s -X POST "<API>/events" -H "Authorization: Bearer <RW_KEY>" -H "Content-Type: application/json" -d "{\"title\":\"QA API Event\",\"start_date_time\":\"2030-06-01T10:00:00Z\",\"end_date_time\":\"2030-06-01T11:00:00Z\",\"venue\":\"QA Hall\",\"should_notify\":false}"
```
**Expected:**
- [ ] HTTP 201; `data.title` is `QA API Event`, `data.start_date_time` is `2030-06-01T10:00:00Z`, `data.all_participant` is `true`.
- [ ] In the app (**Admin → Events**, June 2030) the event exists and **all chapter members are invited**.
- [ ] Because `should_notify` was `false`, **no invitation emails** were sent (check the inbox of a member you control).
- [ ] POST again with `end_date_time` **before** `start_date_time` → 400 `validation_error`.
- [ ] POST with body `{"title":"x"}` → 400, `details.missing` lists `start_date_time`, `end_date_time`.

### 3.6 Update an event (invitations must survive)
**Steps:** In the **app**, create an event "QA targeted event" (any future date) inviting **only 2 specific members**, not everyone. Note its id (from `<API>/events?limit=3` — it will be near the top). Then:
```
curl -s -X PATCH "<API>/events/<id>" -H "Authorization: Bearer <RW_KEY>" -H "Content-Type: application/json" -d "{\"venue\":\"Moved by API\"}"
```
**Expected:**
- [ ] 200; `data.venue` is `Moved by API`; title and dates unchanged.
- [ ] In the app, the event still shows the **same 2 invited members** — nobody was removed or added.
- [ ] Repeat the PATCH on the `QA API Event` from 3.5 (an "everyone" event): still invites everyone afterwards.

---

## 4. Keys, scopes and revocation (P0)

### 4.1 No key / bad key
**Steps:** Run 2.1 **without** the `Authorization` header. Then with `Authorization: Bearer thn_test_madeup`.
**Expected:** [ ] Both: HTTP **401**, `"code": "unauthorized"`. The message does **not** say whether the key exists.

### 4.2 The other header form works
**Steps:** Run 2.1 with `-H "X-API-Key: <KEY>"` instead of the Authorization header.
**Expected:** [ ] Works exactly like Bearer.

### 4.3 Scope enforcement
**Steps:** Try 3.1 (create member) with the **read-only** `<KEY>`.
**Expected:** [ ] HTTP **403**, `"code": "insufficient_scope"`, `details.required` is `["members:write"]`; **no member was created**.
**Steps:** Create a key in the app with **only** "Create and update members" (no read). List members with it.
**Expected:** [ ] 403 `insufficient_scope` — write scope does not include read.

### 4.4 Revoked key stops immediately
**Steps:** In the app, revoke `QA read only`. Immediately run 2.1 with `<KEY>`.
**Expected:** [ ] 401 `unauthorized`. (No wait or logout needed.)

### 4.5 "Last used" updates
**Steps:** Make a call with `<RW_KEY>`, then reload the API Keys page.
**Expected:** [ ] *Last used* for `QA read write` now shows today's date.

---

## 5. Rate limiting (P1)

### 5.1 Hit the limit
**Steps:** Send **101 requests within one minute** with `<RW_KEY>`. Postman: use the Collection Runner with 101 iterations of the list-members request. curl (bash):
```
for i in $(seq 1 101); do curl -s -o /dev/null -w "%{http_code}\n" "<API>/members?limit=1" -H "Authorization: Bearer <RW_KEY>"; done | sort | uniq -c
```
**Expected:**
- [ ] The first 100 return `200`; from the 101st you get **429**.
- [ ] A 429 response has `"code": "rate_limited"`, header `Retry-After: <seconds>` (≤ 60) and `X-RateLimit-Remaining: 0`.
- [ ] Wait for the next minute; requests succeed again.
- [ ] The limit is **per key**: while `<RW_KEY>` is blocked, a different active key still works.

---

## 6. Chapter isolation (P1)

The key belongs to **one chapter**. It must never see or touch another chapter's data.

### 6.1 Wrong chapter in the query
**Steps:** `<API>/members?chapter_id=<a different chapter's id>` with `<RW_KEY>`.
**Expected:** [ ] HTTP **403**, `"code": "chapter_forbidden"`.
**Steps:** `<API>/members?chapter_id=<CHAPTER_ID>` (your own chapter).
**Expected:** [ ] Works normally.

### 6.2 Foreign ids look like they don't exist
**Steps:** Get a member id, membership-type id and event id **from another chapter** (log in as the second admin, or ask). Call `<API>/members/<foreign id>`, `<API>/membership-types/<foreign id>`, `<API>/events/<foreign id>` with `<RW_KEY>`. Also PATCH each.
**Expected:** [ ] Every call returns **404** `not_found` — never the other chapter's data, and nothing is changed.

### 6.3 Keys are listed per chapter
**Steps:** Log in as the **second chapter's** admin. Open Settings → API Keys.
**Expected:** [ ] The keys you created for the first chapter (`QA read only`, `QA read write` …) are **not** listed.

### 6.4 Cannot revoke another chapter's key
**Steps (Postman only, logged-in web session required — skip if you can't obtain the app's login token):** ask a developer to help send `DELETE <API without /v1>/api_keys/<id of a first-chapter key>?chapter_id=<second chapter id>` as the second admin.
**Expected:** [ ] 403 or 404, and the key stays active in the first chapter.

---

## 7. Association-wide keys (P1) — only if your login is an admin of a **root** chapter

A root chapter is the association's top-level chapter (it has sub-chapters under it). Ask if unsure; if not applicable, skip this section.

### 7.1 Create
**Steps:** Ask a developer to create an association-wide key for you via the API keys endpoint with `chapter_id: null` and `admin_chapter_id: <root chapter id>` (the Phase 1 web page always creates chapter-bound keys). Note the key as `<ORG_KEY>`.
**Expected:** [ ] Listed on the root chapter's API Keys page with an **association-wide** badge, and **also** on every sub-chapter's page.

### 7.2 Must name a chapter
**Steps:** `<API>/members` with `<ORG_KEY>` and **no** `chapter_id`.
**Expected:** [ ] 400 `validation_error` ("chapter_id is required for association-wide keys").
**Steps:** `<API>/members?chapter_id=<a sub-chapter id>`.
**Expected:** [ ] Works; returns that sub-chapter's members.
**Steps:** `<API>/members?chapter_id=<a chapter id from a DIFFERENT association>`.
**Expected:** [ ] 403 `chapter_forbidden`.

---

## 8. Polish (P2)

### 8.1 Expired key
**Steps:** The day after creating `QA expiring` (test 1.5), use it.
**Expected:** [ ] 401 `unauthorized`; the API Keys page shows its status as **expired** with no Revoke button.

### 8.2 Documentation endpoint
**Steps:** Open `<API>/openapi.json` in a browser (no key needed).
**Expected:** [ ] A JSON document listing paths `/v1/members`, `/v1/membership-types`, `/v1/events` and their methods.

### 8.3 Page on a small screen
**Steps:** Narrow the browser window (or use phone view in devtools) on the API Keys page.
**Expected:** [ ] Table scrolls horizontally, nothing overlaps, the Create dialog fits and can be submitted.

### 8.4 Nothing leaks in errors
**Steps:** Send obviously broken input, e.g. `<API>/members/abc`, `<API>/members?limit=99999`, `<API>/members?offset=-1`.
**Expected:** [ ] `/members/abc` → 404 `not_found`; the others → 400 `validation_error`. No stack traces, file names or SQL ever appear in any response.

---

## 9. Clean-up

- [ ] Revoke every `QA …` key you created.
- [ ] Delete or deactivate **Api Tester / Changed Tester** (created in 3.1) and the events **QA API Event** and **QA targeted event** in the app.
- [ ] Restore the membership-type description if you didn't in 3.4.

---

## Bug Reporting Template

```
Title: [Public API] <short summary>
Section/test: e.g. 3.6 Update an event
Environment: <website / API address>, date & time
Key used: name of the key (never paste the key itself), its scopes
Request: method + full URL + body (redact the Authorization header)
Expected: <from this guide>
Actual: HTTP status, full JSON response, and what the app shows
Screenshots / response headers: attach
Repeatable: always / sometimes / once
```

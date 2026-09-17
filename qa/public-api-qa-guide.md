# Public API (Phase 1) — QA Guide

A step-by-step test plan for the **new Public API and the API Keys settings page**. Part A is done in a normal web browser. Part B uses **Postman**, a free app for sending messages to the API by clicking — every step is spelled out, and **you do not need to know anything about how the feature was built.** (If you prefer the command line, there is a short appendix at the end.)

> **How to read this**: each test has **Steps** (what you do) and **Expected** (what you should see). If what you see matches → tick the box. If it doesn't → write it up using the **Bug Reporting Template** at the bottom.

### What this feature is (in plain English)

- Chapter admins can now create **API keys** under **Settings → API Keys**. A key is a long secret string that starts with `thn_test_` (test environment) or `thn_live_` (production).
- External tools (a CRM, Zapier, a spreadsheet script) present that key to a new set of web addresses — the **public API** — to read and update **members**, **membership types** and **events** for the chapter, without logging in to the app.
- Each key only has the **permissions** (the app calls them *scopes*) the admin ticked when creating it, e.g. "Read members" but not "Create and update members".
- A key can be **revoked** at any time; tools using it stop working immediately.

Run the **P0** sections first (1–4). **P1** (5–7) is the deeper pass. **P2** (8) is polish. **Part C** (10–14) covers the second release — payments, community, meetings and creating membership types. **Part D** (15–21) covers the third release — chapter, roles, tasks, contacts, projects, fundraising, gatherings, elections, Drive and the activity log. Both are all P0.

---

## 0. Before You Start

Ask the person who set up your test environment to give you / confirm the following. If any are missing, pause and ask.

- [ ] The **website address** to test on (e.g. `https://testapp.transparencyhubnetwork.ai`).
- [ ] The **API address** for the same environment — the web address the API answers on. On test this is normally `https://testapi.transparencyhubnetwork.ai/api/v1`; confirm it.
- [ ] Confirmation that **the public API is switched on** in this environment (the developers call the switch `PUBLIC_API_ENABLED`). If it is off, every Part B test just says "not found" — ask for it to be enabled before starting.
- [ ] An **admin login** for a chapter you can experiment in freely (must be able to see **Settings**).
- [ ] A **second admin login for a different chapter** in the same association (for the "wrong chapter" tests in section 6). If none exists, note it and skip 6.3–6.4.
- [ ] A **login that is NOT an admin** (a plain member of the same chapter) — for test 1.7.
- [ ] The chapter's **numeric id** (ask; it appears in some admin URLs). Write it here: `CHAPTER_ID = ______`
- [ ] **Postman** installed (free, postman.com/downloads). Part B explains how to use it — you don't need to have used it before.
- [ ] The chapter should already have **at least 3 members, 1 membership type and 1 event**. If not, create them in the app first.

> **Tip:** keep a text file open while testing. You will be pasting keys and ids into it; the key is shown **only once**.

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

## Part B — Talking to the API with Postman

The public API has no screens. To test it you send it **requests** — the same thing a CRM or Zapier would do — and read the **replies**. You'll use **Postman**, a free app that lets you do this by clicking. No coding needed.

### Words you'll see in this part

- **Request**: one message to the API. It has a *method* (what you want: **GET** = read, **POST** = create, **PATCH** = change), an *address* (which thing), and sometimes a *body* (the details you're sending).
- **Reply**: what the API sends back. It always includes a **status number** — `200` = OK, `201` = created, `400` = you sent something wrong, `401` = key not accepted, `403` = key not allowed to do that, `404` = not found, `429` = too many requests — and a block of text in curly braces (called JSON). Inside it look for `"status"` (`success` or `error`), `"code"` (a short reason when it's an error) and `"data"` (the actual members/events).
- **Header**: an extra label attached to a request. The only one you'll use carries your key.

### One-time Postman setup

1. Install Postman (postman.com/downloads) and open it. You can skip creating an account ("Lightweight API client").
2. Click **New → Collection**, name it `Public API QA`.
3. Click the collection → **Variables** tab. Add two rows and fill the *Current value* column:
   - `api` = the API address from section 0 (e.g. `https://testapi.transparencyhubnetwork.ai/api/v1`)
   - `key` = the key you copied in test 1.2
4. Click **Save**.
5. Click the collection → **Authorization** tab → Type **Bearer Token** → Token: `{{key}}` → **Save**. Every request in the collection now sends your key automatically.
6. To make a request: right-click the collection → **Add request**, pick the **method** from the dropdown on the left, type the **address** in the long box, and click **Send**. The reply appears at the bottom; the status number is at the top right of the reply (e.g. `200 OK`).
7. For POST/PATCH requests: open the **Body** tab under the address, choose **raw**, choose **JSON** in the little dropdown, and paste the body text given in the test.

> **Switching keys:** several tests use a second key (`QA read write`). Change the `key` variable's *Current value* in the collection's Variables tab and Save — every request picks it up.
>
> **Filters** like `?limit=5` are just typed at the end of the address.

---

## 2. Reading data (P0)

Use the **read-only** key (`QA read only`) for this section.

### 2.1 List members
**Steps:** New request: **GET** `{{api}}/members?limit=5`. Send.
**Expected:**
- [ ] Status `200 OK` and the reply starts with `"status": "success"`.
- [ ] `"data"` contains up to 5 members, each showing things like `id`, `firstname`, `lastname`, `email`, `chapter_id`, `status` (`"active"` or `"inactive"`) and `createddate`.
- [ ] Near the end there is `"pagination"` with `"total"` = the number of members in your chapter, `"offset": 0`, `"limit": 5`.
- [ ] **Nothing secret is present**: press Ctrl+F in the reply area and search for `password`, then `otp`, then `token` — none should be found.
- [ ] Dates look like `2026-01-15T10:00:00Z` (they end with `Z`).

### 2.2 Paging (getting the next page)
**Steps:** Send `{{api}}/members?limit=2&offset=0`, then `{{api}}/members?limit=2&offset=2`.
**Expected:** [ ] Two different pairs of members; nobody appears in both; `"total"` is the same both times.

### 2.3 Searching and filtering
**Steps:** Send `{{api}}/members?search=<part of a real member's last name>`. Then `{{api}}/members?status=active`. Then `{{api}}/members?status=inactive`. Then `{{api}}/members?status=nonsense`.
**Expected:**
- [ ] Search returns only members whose first name, last name or email contains that text (capital letters don't matter).
- [ ] The `active` total plus the `inactive` total equals the total from 2.1.
- [ ] `nonsense` gives status `400` with `"code": "validation_error"`.

### 2.4 One member
**Steps:** Copy an `id` number from 2.1. Send **GET** `{{api}}/members/<that id>`.
**Expected:** [ ] `200`, and `"data"` is just that member.
**Steps:** Send `{{api}}/members/999999999`.
**Expected:** [ ] `404` with `"code": "not_found"`.

### 2.5 Membership types
**Steps:** **GET** `{{api}}/membership-types`, then `{{api}}/membership-types/<an id from the list>`.
**Expected:**
- [ ] Both `200`. Each type shows `name`, `category`, `description`, `duration`, `renewal_timeline`, `deactivation_timeline` and a few yes/no settings.
- [ ] The names match **Admin → Membership Types** in the app.

### 2.6 Events
**Steps:** **GET** `{{api}}/events?limit=5`, then `{{api}}/events/<an id from the list>`.
**Expected:**
- [ ] `200`; the events are listed **newest start date first**; each shows `title`, `venue`, `start_date_time`, `end_date_time`, `timezone`, `all_participant`.
- [ ] `{{api}}/events?from=2030-01-01T00:00:00Z` shows only events starting after 2030 (probably an empty list and `"total": 0`).
- [ ] `{{api}}/events?from=yesterday` gives `400` `validation_error`.

### 2.7 The "how many requests are left" labels
**Steps:** After any successful request, click the **Headers** tab in the reply area (next to Body).
**Expected:** [ ] A row `X-RateLimit-Limit` with value `100` is there.

---

## 3. Writing data (P0)

Switch the `key` variable to the **read-write** key (`QA read write`).

### 3.1 Create a member
**Steps:** New request: **POST** `{{api}}/members`. Body (raw, JSON) — change the email so it's new each time, e.g. add today's date:
```
{ "firstname": "Api", "lastname": "Tester", "email": "api.tester.16sep@example.com" }
```
Send.
**Expected:**
- [ ] Status `201 Created`; `"data"` shows the new member with an `id`, and `"status": "inactive"` (new members start inactive, just like when an admin adds one in the app). Write the id down.
- [ ] In the app, **Admin → Members** now lists **Api Tester**.
- [ ] Send the exact same request again: `400` with `"code": "request_failed"` and a message saying the email already exists for the chapter.

### 3.2 Create — missing details
**Steps:** POST the same address with body `{ "firstname": "Only" }`.
**Expected:** [ ] `400` `validation_error`; inside `"details"` → `"missing"` lists `lastname` and `email`.
**Steps:** Change the body to the plain word `hello` (not JSON). Send.
**Expected:** [ ] `400` `validation_error` saying the body must be valid JSON.

### 3.3 Change a member
**Steps:** **PATCH** `{{api}}/members/<id from 3.1>`. Body:
```
{ "firstname": "Changed", "email": "hacked@example.com", "password": "x" }
```
**Expected:**
- [ ] `200`; `"firstname"` is now `Changed`; `"email"` is **unchanged** — email and password cannot be changed through the API.
- [ ] The app shows the member's first name as **Changed**.
- [ ] PATCH again with body `{ "email": "x@y.z" }` only → `400` `validation_error` "No editable fields supplied", and `"details"` → `"editable"` lists what *can* be changed.

### 3.4 Change a membership type
**Steps:** Note the current `description` of a membership type (from 2.5). **PATCH** `{{api}}/membership-types/<its id>` with body:
```
{ "description": "Updated by QA via API" }
```
**Expected:**
- [ ] `200`; `"description"` is the new text; **everything else is the same** (name, category, duration, timelines).
- [ ] **Admin → Membership Types** shows the new description; the type's dues, workflow and application form are untouched.
- [ ] Send another PATCH putting the original description back.

### 3.5 Create an event
**Steps:** **POST** `{{api}}/events` with body:
```
{ "title": "QA API Event", "start_date_time": "2030-06-01T10:00:00Z", "end_date_time": "2030-06-01T11:00:00Z", "venue": "QA Hall", "should_notify": false }
```
**Expected:**
- [ ] `201`; `"title"` is `QA API Event`, `"start_date_time"` is `2030-06-01T10:00:00Z`, `"all_participant"` is `true`.
- [ ] In the app (**Admin → Events**, go to June 2030) the event exists and **everyone in the chapter is invited**.
- [ ] Because `should_notify` was `false`, **no invitation emails** went out (check the inbox of a member you control).
- [ ] Send again with the two dates swapped (end before start) → `400` `validation_error`.
- [ ] Send with body `{ "title": "x" }` → `400`; `"missing"` lists `start_date_time` and `end_date_time`.

### 3.6 Change an event (invitations must survive)
**Steps:** In the **app**, create an event called "QA targeted event" (any future date) and invite **only 2 specific members**, not everyone. Find its id: send **GET** `{{api}}/events?limit=3` — it will be near the top. Then **PATCH** `{{api}}/events/<that id>` with body:
```
{ "venue": "Moved by API" }
```
**Expected:**
- [ ] `200`; `"venue"` is `Moved by API`; title and dates unchanged.
- [ ] In the app, the event still shows the **same 2 invited members** — nobody removed, nobody added.
- [ ] Do the same PATCH on the `QA API Event` from 3.5 (an "everyone" event): afterwards it still invites everyone.

---

## 4. Keys, permissions and revoking (P0)

### 4.1 No key / made-up key
**Steps:** Open any GET request → **Authorization** tab → set Type to **No Auth** → Send. Then set Type to **Bearer Token** with Token `thn_test_madeup` → Send. (Afterwards set it back to **Inherit auth from parent**.)
**Expected:** [ ] Both give `401` with `"code": "unauthorized"`. The message does **not** say whether the key exists.

### 4.2 The other way of sending a key also works
**Steps:** On a GET request, set Authorization to **No Auth**, open the **Headers** tab and add a row: Key `X-API-Key`, Value `{{key}}`. Send. (Remove the row and restore auth afterwards.)
**Expected:** [ ] Works exactly like before (`200`).

### 4.3 Permissions (scopes) are enforced
**Steps:** Switch the `key` variable to the **read-only** key. Try 3.1 (create a member) again.
**Expected:** [ ] `403` with `"code": "insufficient_scope"`; `"details"` → `"required"` says `members:write`; **no member was created** (check the app).
**Steps:** In the app, create a key ticking **only** "Create and update members" (nothing else). Put it in the `key` variable and send **GET** `{{api}}/members`.
**Expected:** [ ] `403` `insufficient_scope` — being allowed to *write* does not include *reading*.

### 4.4 A revoked key stops at once
**Steps:** In the app, revoke `QA read only`. Straight away, with that key in the variable, send **GET** `{{api}}/members`.
**Expected:** [ ] `401` `unauthorized`. No waiting, no logging out needed.

### 4.5 "Last used" updates
**Steps:** Send any request with `QA read write`, then reload the API Keys page in the app.
**Expected:** [ ] *Last used* for `QA read write` shows today's date.

---

## 5. Too many requests (P1)

Each key may make **100 requests per minute**. Going over is refused until the minute is up.

### 5.1 Hit the limit
**Steps:** Right-click the `Public API QA` collection → **Run collection**. Untick everything except the *list members* GET request. Set **Iterations** to `101` and **Delay** to `0`. Click **Run**.
**Expected:**
- [ ] The first 100 runs show `200`; the last one (or last few) show **`429`**.
- [ ] Click a `429` result: the reply has `"code": "rate_limited"`; in its Headers there is `Retry-After` (a number of seconds, 60 or less) and `X-RateLimit-Remaining` is `0`.
- [ ] Wait until the next minute starts, send one request by hand: `200` again.
- [ ] The limit is **per key**: while one key is blocked, switch the variable to a different active key — it still works.

---

## 6. Keys only see their own chapter (P1)

A key belongs to **one chapter**. It must never see or change another chapter's data.

### 6.1 Asking for another chapter by number
**Steps:** **GET** `{{api}}/members?chapter_id=<a different chapter's id>`.
**Expected:** [ ] `403` with `"code": "chapter_forbidden"`.
**Steps:** **GET** `{{api}}/members?chapter_id=<CHAPTER_ID>` (your own).
**Expected:** [ ] Works normally.

### 6.2 Other chapters' records look like they don't exist
**Steps:** Get a member id, a membership-type id and an event id **from another chapter** (log in to the app as the second admin and look, or ask). Send **GET** `{{api}}/members/<that id>`, `{{api}}/membership-types/<that id>`, `{{api}}/events/<that id>`. Then send a **PATCH** to each with body `{ "firstname": "x" }` / `{ "description": "x" }` / `{ "venue": "x" }`.
**Expected:** [ ] Every one returns `404` `not_found` — never the other chapter's data — and nothing changes in the other chapter.

### 6.3 Keys are listed per chapter
**Steps:** Log in to the app as the **second chapter's** admin. Open Settings → API Keys.
**Expected:** [ ] The keys you created for the first chapter (`QA read only`, `QA read write` …) are **not** listed.

### 6.4 Cannot revoke another chapter's key
This one needs a developer's help (it means pretending to be the app). Ask them to try revoking one of your first-chapter keys while logged in as the second chapter's admin.
**Expected:** [ ] It is refused, and the key stays active on the first chapter's page.

---

## 7. Association-wide keys (P1) — only if you're an admin of the **top-level** chapter

The top-level ("root") chapter is the one that has other chapters under it. Ask if unsure; if this doesn't apply to your login, skip this section.

### 7.1 Create one
**Steps:** The Phase 1 API Keys page always creates keys for one chapter, so ask a developer to create an **association-wide** key for you (they'll know what that means). Put it in the `key` variable.
**Expected:** [ ] It appears on the top-level chapter's API Keys page with an **association-wide** badge, and **also** on every sub-chapter's page.

### 7.2 It must say which chapter
**Steps:** **GET** `{{api}}/members` (no `chapter_id`).
**Expected:** [ ] `400` `validation_error` saying chapter_id is required for association-wide keys.
**Steps:** **GET** `{{api}}/members?chapter_id=<a sub-chapter id>`.
**Expected:** [ ] Works; shows that sub-chapter's members.
**Steps:** **GET** `{{api}}/members?chapter_id=<a chapter id from a DIFFERENT association>`.
**Expected:** [ ] `403` `chapter_forbidden`.

---

## 8. Polish (P2)

### 8.1 Expired key
**Steps:** The day after creating `QA expiring` (test 1.5), put it in the `key` variable and send any GET.
**Expected:** [ ] `401` `unauthorized`; the API Keys page shows it as **expired** with no Revoke button.

### 8.2 The API describes itself
**Steps:** In a normal browser tab open `<API address>/openapi.json` (no key needed).
**Expected:** [ ] A page of text mentioning `/v1/members`, `/v1/membership-types` and `/v1/events`.

### 8.3 API Keys page on a small screen
**Steps:** Make the browser window narrow (or use the phone view) on the API Keys page.
**Expected:** [ ] The table scrolls sideways, nothing overlaps, the Create dialog fits and can be submitted.

### 8.4 Errors never reveal internals
**Steps:** Send **GET** `{{api}}/members/abc`, then `{{api}}/members?limit=99999`, then `{{api}}/members?offset=-1`.
**Expected:** [ ] `abc` → `404` `not_found`; the other two → `400` `validation_error`. No reply ever contains file names, code, or database text.

---

## Part C — Payments, community and meetings (Phase 2)

Phase 2 adds **read-only** information: payments and dues, the community feed and groups, and in-app meetings with their recordings and minutes. It also lets a key **create a membership type**. Nothing here can take money, post to the feed or change a meeting.

### Set-up for Part C

- [ ] In the app, create a key named `QA phase 2` and tick **every** box in the Create dialog. There are three new permissions: **Read payments and dues**, **Read posts, comments and groups**, **Read meetings, recordings and minutes**. Put this key in the Postman `key` variable.
- [ ] Also create a key named `QA no phase 2` ticking only **Read members**. You will use it once, in test 10.5.
- [ ] The chapter should have at least one **payment**, one **post with a comment**, one **group with members**, one **in-app meeting that has taken place** (so it has a recording) and one set of **minutes**. If any are missing, ask for a chapter that has them or create them in the app first.

---

## 10. Payments and dues (P0)

### 10.1 List payments
**Steps:** **GET** `{{api}}/transactions?limit=5`.
**Expected:**
- [ ] `200`; each item shows `amount`, `currency`, `payment_status`, `payment_method`, `transactionref`, `payment_date` and `member_id`.
- [ ] The most recent payment is first.
- [ ] Search the reply (Ctrl+F) for `settings_id` and `linked_due` — neither appears.

### 10.2 Filters
**Steps:** Add `&member_id=<a member id from 2.1>`; then instead `&status=success`; then `&from=2030-01-01T00:00:00Z`.
**Expected:** [ ] Only that member's payments / only successful ones / an empty list for the future date. `&member_id=abc` gives `400`.

### 10.3 One payment
**Steps:** **GET** `{{api}}/transactions/<an id from 10.1>`, then `{{api}}/transactions/999999999`.
**Expected:** [ ] `200` with that payment; then `404` `not_found`.

### 10.4 A member's dues
**Steps:** **GET** `{{api}}/members/<a member id>/dues`.
**Expected:**
- [ ] `200`; each item shows `amount`, `currency`, `status` (e.g. `paid` / `unpaid`) and `due_date`.
- [ ] Compare with the app: open that member in **Admin → Members** — the dues and their paid/unpaid state match.
- [ ] `{{api}}/members/999999999/dues` → `404`.

### 10.5 Fees of a membership type
**Steps:** **GET** `{{api}}/membership-types/<a type id from 2.5>/dues`.
**Expected:** [ ] `200`; each fee shows `dues_name`, `amount`, `currency`, `due_frequency`; these match **Admin → Membership Types** for that type.
**Steps:** Switch the `key` variable to `QA no phase 2` and send **GET** `{{api}}/transactions`.
**Expected:** [ ] `403` `insufficient_scope`; `"required"` says `payments:read`. Switch back to `QA phase 2`.

---

## 11. Community (P0)

### 11.1 Posts
**Steps:** **GET** `{{api}}/posts?limit=5`.
**Expected:** [ ] `200`; newest post first; each shows `content`, `member_id`, `is_edited`, `createddate`. The text matches what you see in the app's community feed.

### 11.2 One post and its comments
**Steps:** **GET** `{{api}}/posts/<an id>`, then `{{api}}/posts/<that id>/comments`.
**Expected:**
- [ ] `200` for both; comments are oldest first and show `content`, `member_id`, and `parent_comment_id` (filled in only for replies).
- [ ] `{{api}}/posts/999999999/comments` → `404`.

### 11.3 Groups
**Steps:** **GET** `{{api}}/groups`, then `{{api}}/groups/<an id>/members`.
**Expected:**
- [ ] `200`; each group shows `name`, `is_private`, `member_count`; the members list shows `member_id`, `role` (e.g. `admin`, `member`) and `joined_at`.
- [ ] `member_count` equals the number of members returned (use a group with fewer than 50 members).
- [ ] Search the groups reply for `thread_id` — it does not appear.

---

## 12. Meetings, recordings and minutes (P0)

### 12.1 Meetings
**Steps:** **GET** `{{api}}/meetings?limit=5`.
**Expected:**
- [ ] `200`; newest first; each shows `title`, `meeting_start`, `valid_from`, `valid_until`, `status`, `event_id`.
- [ ] **Very important:** search the reply for `room`, `share_handle` and `chat` — **none** of these words appear. (These are the secret join details of the meeting.)

### 12.2 Recordings
**Steps:** **GET** `{{api}}/meetings/<id of a meeting that took place>/recordings`.
**Expected:**
- [ ] `200`; each recording shows `format` (e.g. `mp4`), `duration_seconds`, `file_size`, `processing_status`.
- [ ] Search the reply for `http` and `transcript` — neither appears (no download links or transcripts through the API).
- [ ] `{{api}}/meetings/999999999/recordings` → `404`.

### 12.3 Minutes
**Steps:** **GET** `{{api}}/minutes`, then `{{api}}/minutes/<an id>`, then `{{api}}/minutes?event_id=<an event id>`.
**Expected:** [ ] `200`; minutes show `title`, `motion`, `minute_text` (the full text), `adopted_by`, `seconded_by`; the `event_id` filter narrows the list; `?event_id=abc` → `400`.

---

## 13. Creating a membership type (P0)

### 13.1 Create
**Steps:** **POST** `{{api}}/membership-types` with body:
```
{ "name": "QA API Type", "category": "Individual", "duration": 12, "description": "Created by QA via API" }
```
**Expected:**
- [ ] `201`; `"data"` shows the new type with `renewal_timeline` `30` and `deactivation_timeline` `60` (the defaults).
- [ ] In the app, **Admin → Membership Types** lists **QA API Type** with no fees; opening it shows the chapter's **Default** application form and the standard workflow and notification settings switched on.
- [ ] **GET** `{{api}}/membership-types` now includes it.

### 13.2 Validation
**Steps:** POST with body `{ "name": "x" }`; then `{ "name": "x", "category": "c", "duration": "twelve" }`.
**Expected:** [ ] Both `400` `validation_error` (the first lists `category` and `duration` as missing).
**Steps:** Switch the `key` variable to `QA read only` (from Part A, if still active — otherwise any key without **Update membership types**) and POST again with a valid body.
**Expected:** [ ] `403` `insufficient_scope`. Nothing was created.

---

## 14. Clean-up for Part C

- [ ] Delete **QA API Type** in **Admin → Membership Types**.
- [ ] Revoke `QA phase 2` and `QA no phase 2`.

---

## Part D — Everything else (third release)

The third release opens up the rest of the app for **reading**: the chapter and association, roles, tasks, contacts, projects, fundraising, gatherings, elections, Drive (names and sizes only, never the files) and the activity log. It also lets a key **create** three simple things: a task, a contact and a project card. Nothing can be deleted, paid, voted or downloaded.

### Set-up for Part D

- [ ] In the app, create a key named `QA phase 3` and tick **every** box. Put it in the Postman `key` variable.
- [ ] Use a chapter that has at least: one task, one contact, one project with a few cards, one fundraising campaign, one gathering with tickets, one election that has **finished**, and a few Drive folders/files. Ask if you're unsure which chapter to use.

---

## 15. Chapter, roles and activity (P0)

### 15.1 Chapter and association
**Steps:** **GET** `{{api}}/chapter`, then `{{api}}/association`, then `{{api}}/chapter/children`.
**Expected:**
- [ ] `200`; the chapter reply shows your chapter's `title`, `slug` and `timezone` as in **Admin → Chapter**; the association reply shows its `name`.
- [ ] `chapter/children` lists sub-chapters (an empty list if there are none).

### 15.2 Roles
**Steps:** **GET** `{{api}}/roles`.
**Expected:** [ ] `200`; every role from **Admin → Roles** is listed with `rolename`, `is_super_admin` and a `permissions` block that mirrors the tick-boxes in the app.

### 15.3 Activity log
**Steps:** **GET** `{{api}}/activity?limit=5`, then `{{api}}/activity?entity_type=member`.
**Expected:**
- [ ] `200`; newest entries first; each has `action`, `description`, `performed_at`, `performed_by`.
- [ ] The entries match the top of **Admin → Activity log**.
- [ ] With `entity_type=member`, every entry's `entity_type` is `member`.
- [ ] Search the reply for `"json"` — it does not appear.

---

## 16. Tasks and contacts (P0)

### 16.1 Read tasks
**Steps:** **GET** `{{api}}/tasks`, then `{{api}}/tasks/<an id>`, then `{{api}}/tasks/999999999`.
**Expected:** [ ] `200` / `200` / `404`; tasks show `name`, `progress`, `due_date`, `member_id` (the assignee).

### 16.2 Create a task
**Steps:** **POST** `{{api}}/tasks` with body (use a real member id from Part B 2.1):
```
{ "name": "QA API task", "description": "Created via API", "member_id": <member id>, "due_date": "2030-01-15T00:00:00Z" }
```
**Expected:**
- [ ] `201`; the reply shows the task with `progress` `0`.
- [ ] **Admin → Task** lists **QA API task** assigned to that member.
- [ ] POST again with `"member_id": 999999999` → `400` saying the member is not an active member of this chapter.
- [ ] POST with `"progress": 150` → `400`.

### 16.3 Read contacts
**Steps:** **GET** `{{api}}/contacts?limit=5`, `{{api}}/contacts/groups`, then `{{api}}/contacts?search=<part of a contact's name>`.
**Expected:** [ ] `200`; contacts show `name`, `email`, `phone`, `class_of`, `group_name`; the groups reply lists each group name with a `count`; search narrows the list.

### 16.4 Create a contact
**Steps:** **POST** `{{api}}/contacts` with body (make the email unique, e.g. add today's date):
```
{ "name": "QA API Contact", "email": "qa.api.17sep@example.com", "group_name": "QA" }
```
**Expected:**
- [ ] `201`; **Admin → Contacts** shows **QA API Contact** in group **QA**.
- [ ] Send the same body again → `409` with a message that the email already exists.
- [ ] POST with body `{ "name": "No details" }` → `400` (email or phone is required).

---

## 17. Projects (P0)

### 17.1 Boards
**Steps:** **GET** `{{api}}/projects`, then for one project id: `{{api}}/projects/<id>/columns`, `{{api}}/projects/<id>/labels`, `{{api}}/projects/<id>/tasks`.
**Expected:**
- [ ] `200` for all; columns come in board order with `wip_limit` and `is_done_column`; each card shows `title`, `column_id`, `priority`, `assignee_ids` and `label_ids` that match the board in **Admin → Projects**.
- [ ] `{{api}}/projects/<id>/tasks?column_id=<a column id>` returns only that column's cards.
- [ ] `{{api}}/projects/999999999/columns` → `404`.

### 17.2 One card, its comments and time
**Steps:** **GET** `{{api}}/project-tasks/<a card id>`, then `/updates` and `/time-logs` on the same address.
**Expected:** [ ] `200`; updates show the card's comments (`body`, `author_member_id`); time logs show `minutes` and `note` as in the card's side panel.

### 17.3 Create a card
**Steps:** **POST** `{{api}}/projects/<project id>/tasks` with body:
```
{ "title": "QA API card", "column_id": <a column id from 17.1>, "priority": "high" }
```
**Expected:**
- [ ] `201` **if the key's creator is a project admin** in the chapter (the admin who created the key needs Projects → Create). The card appears in that column on the board.
- [ ] If the key was created by someone without that permission: `403` with `"code": "request_failed"` — and no card is created. (Either outcome is correct; note which one you got and why.)

---

## 18. Fundraising, gatherings and elections (P0)

### 18.1 Fundraising
**Steps:** **GET** `{{api}}/fundraising/campaigns`, then `{{api}}/fundraising/campaigns/<id>/payments`.
**Expected:** [ ] `200`; campaigns show `name`, `status`, `expected_amount`, dates; payments list who gave (`name`, `email`, `transaction_id`). Search the campaign reply for `settings_id` — absent.

### 18.2 Gatherings
**Steps:** **GET** `{{api}}/gatherings`, then for one id: `/ticket-classes`, `/attendees`, `/orders`.
**Expected:**
- [ ] `200`; the gathering shows `title`, dates, `venue_name`, `capacity`; ticket classes show `price` and `quantity_sold`; attendees show `name`, `email`, `checked_in`.
- [ ] Search every reply for `eventbrite_` (with the underscore) — it never appears. (The plain word may show up as the gathering's `source` or inside an image address; that is fine — what must never appear are Eventbrite id fields.)

### 18.3 Elections
**Steps:** **GET** `{{api}}/elections`, then `{{api}}/elections/<id>/questions`, then `{{api}}/elections/<id>/results`.
**Expected:**
- [ ] `200`; the election shows `title`, `state`, dates, `results_visibility`.
- [ ] Questions come with their `candidates` (`display_name`).
- [ ] **Results:** for a finished election whose results are visible to members → `200` with `results` (counts per candidate) and `turnout`. For an election whose results are **not yet** visible (e.g. still running with "after close" visibility) → `403` with the message *Results are not available yet*.
- [ ] Search the election replies for `eligibility`, `override` and `ballot` — none appear.

---

## 19. Drive (P0)

**Steps:** **GET** `{{api}}/drive/items`, then `{{api}}/drive/items?parent_id=<a folder id from the first reply>`, then `{{api}}/drive/items/<a file id>`.
**Expected:**
- [ ] `200`; the top level lists the folders you see in **Admin → Drive**; a folder id lists what's inside; a file shows `name`, `file_size`, `content_type`.
- [ ] Items in the Drive bin do **not** appear.
- [ ] Search the replies for `blob` and `http` — neither appears (no storage paths or download links).

---

## 20. Permissions for the new areas (P0)

**Steps:** In the app create a key `QA read members only` ticking only **Read members**. Put it in the `key` variable and send **GET** `{{api}}/chapter`, `{{api}}/tasks`, `{{api}}/projects`, `{{api}}/drive/items`, and **POST** `{{api}}/contacts` with a valid body.
**Expected:** [ ] Every one returns `403` `insufficient_scope`, and no contact was created. Switch back to `QA phase 3`.

---

## 21. Clean-up for Part D

- [ ] Delete **QA API task** (Admin → Task), **QA API Contact** (Admin → Contacts) and the **QA API card** on the board if one was created.
- [ ] Revoke `QA phase 3` and `QA read members only`.

---

## 9. Clean-up

- [ ] Revoke every `QA …` key you created.
- [ ] Delete or deactivate **Api Tester / Changed Tester** (created in 3.1) and the events **QA API Event** and **QA targeted event** in the app.
- [ ] Restore the membership-type description if you didn't in 3.4.

---

## Appendix — the same requests on the command line (optional, for technical testers)

Replace `<API>` with the API address and `<KEY>` with your key.

```
List members:      curl -s "<API>/members?limit=5" -H "Authorization: Bearer <KEY>"
One member:        curl -s "<API>/members/<id>" -H "Authorization: Bearer <KEY>"
Create member:     curl -s -X POST "<API>/members" -H "Authorization: Bearer <KEY>" -H "Content-Type: application/json" -d '{"firstname":"Api","lastname":"Tester","email":"api.tester@example.com"}'
Change member:     curl -s -X PATCH "<API>/members/<id>" -H "Authorization: Bearer <KEY>" -H "Content-Type: application/json" -d '{"firstname":"Changed"}'
Membership types:  curl -s "<API>/membership-types" -H "Authorization: Bearer <KEY>"
Events:            curl -s "<API>/events?limit=5" -H "Authorization: Bearer <KEY>"
Create event:      curl -s -X POST "<API>/events" -H "Authorization: Bearer <KEY>" -H "Content-Type: application/json" -d '{"title":"QA API Event","start_date_time":"2030-06-01T10:00:00Z","end_date_time":"2030-06-01T11:00:00Z","should_notify":false}'
See headers too:   add -i right after curl
```

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

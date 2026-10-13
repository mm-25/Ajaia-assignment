# Marsh & Colby · Shared submission workspace

A clickable, frontend-only prototype for the Ajaia application assignment. All people, companies, source documents, and values in the interface are illustrative.

[Open the clickable prototype](https://mm-25.github.io/Ajaia-assignment/)

## Try the complete flow
1. Start in the broker portal. Inspect the application, sample documents, and early discrepancy flags. Correct a value or leave it for human review.
2. Select **Submit for review**. Maya stays in the broker portal with an Under review status. Select **Underwriting** in the top prototype role switch to continue as Anika.
3. Open each evidence bookmark. Compare the application field with the highlighted source. Confirm the discrepancy, or dismiss it with a reason.
4. Select **Publish correction request**. Review/edit the issue instructions and approve the notification. No real email is sent.
5. Select **Broker** in the top role switch, then open **Requested changes**. Correct the application or upload a sample replacement document. Questions remain attached to the issue.
6. Select **Send updates for review**. Maya stays in the broker portal. Select **Underwriting** explicitly to continue; Anika must verify each update and complete the familiar coverage checklist before completing the review.

Use **View journey** for the design rationale, **Jump to review / corrections** for scenario shortcuts, and **Reset demo** to restart. Demo state is saved only in the current browser. Only the top role switch changes identity. Sidebar navigation and submission actions never switch roles. Role switching illustrates both parties; it is not authentication. Email, file uploads, and AI extraction are simulated. Review completion does not authorize binding.

## Why these screens
- Broker intake reduces scattered document collection and exposes possible differences early.
- Assistant review shortens reconciliation with evidence bookmarks and side-by-side source values.
- Broker corrections keeps issues, discussion, versions, and returned changes in one shared record.

Human checkpoints: broker verifies intended information; assistant verifies automated findings before requesting action; assistant approves instructions before notification; assistant checks returned evidence before resolving an issue.

## Run locally
```sh
python3 -m http.server 4173
```
Open http://localhost:4173. No build or dependency installation required.

## Verify
```sh
node --test tests/*.test.mjs
node --check app.mjs
```
Workflow tests cover publication gating, returned correction verification, checklist completion, help, new versions reopening review, early corrections, mixed outcomes, and partial returns.

Static GitHub Pages deployment serves the repository root. Inter is loaded from Google Fonts with a local system-font fallback.

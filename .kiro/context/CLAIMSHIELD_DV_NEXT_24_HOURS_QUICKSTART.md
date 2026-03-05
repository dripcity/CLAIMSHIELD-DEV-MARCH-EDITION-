# ClaimShield DV Next 24 Hours Quick Start

Date: March 4, 2026  
Goal: Remove launch-blocking risk and establish deterministic autonomous execution.

## Operating model (first 24 hours)

- Shift 1 (Hours 0-12): Stabilize runtime/tooling, patch security-critical API gaps, align monetization constants.
- Shift 2 (Hours 12-24): Complete schema/migration baseline, fix wizard path/state correctness, lock CI gates.

## Immediate task queue (ordered)

1. `CS-LR-001` Resolve Clerk/React runtime incompatibilities.
2. `CS-LR-002` Restore deterministic lint/build/test commands.
3. `CS-LR-003` Enforce ownership checks on comparables endpoints.
4. `CS-LR-004` Enforce ownership checks on document upload/delete.
5. `CS-LR-005` Remove mass assignment in appraisal update/auto-save.
6. `CS-LR-008` Align individual checkout price to $129.
7. `CS-LR-009` Align plan model to individual/professional/attorney/body_shop.
8. `CS-LR-010` Implement Stripe webhook idempotent fulfillment.
9. `CS-LR-006` Move blob storage to private access + signed URL model.
10. `CS-LR-011` Add indexes and generate checked-in migrations.
11. `CS-LR-012` Add deterministic seed scripts.
12. `CS-LR-013` Add CI quality gate workflow.
13. `CS-LR-014` Replace onboarding role update webhook misuse.
14. `CS-LR-015` Normalize wizard route paths.
15. `CS-LR-016` Wire wizard state + autosave consistency.
16. `CS-LR-017` Fix Step 4 extraction payload contract.
17. `CS-LR-018` Upgrade Gemini integration to 3.1 Pro contract.
18. `CS-LR-019` Replace Apify placeholder actor with production mapping.

## First 12-hour execution plan

- Hour 0-2: `CS-LR-001`, `CS-LR-002`.
- Hour 2-6: `CS-LR-003`, `CS-LR-004`, `CS-LR-005` in parallel.
- Hour 6-8: `CS-LR-008`, `CS-LR-009`.
- Hour 8-12: `CS-LR-010` plus `CS-LR-006` kickoff.

## Second 12-hour execution plan

- Hour 12-16: `CS-LR-011`, `CS-LR-012`, `CS-LR-013`.
- Hour 16-20: `CS-LR-014`, `CS-LR-015`, `CS-LR-016`.
- Hour 20-24: `CS-LR-017`, `CS-LR-018`, `CS-LR-019`.

## Mandatory checkpoints

- Checkpoint A (Hour 6): App boots, root route is no longer internal server error.
- Checkpoint B (Hour 12): Critical authz vulnerabilities patched and reviewed.
- Checkpoint C (Hour 18): Migrations and CI gates operational.
- Checkpoint D (Hour 24): Wizard path/state and extraction integration stable enough for E2E automation.

## Human approvals required in first 24h

- Confirm Stripe product/price IDs for all plans.
- Confirm signed-URL expiry policy for report sharing.
- Confirm any data migration strategy if schema enum/field changes are applied.


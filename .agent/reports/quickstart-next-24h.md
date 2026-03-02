# ClaimShield DV Next 24 Hours Quick-Start

## Objective

Close the highest-impact launch blockers first so parallel agents can move without rework.

## Immediate Execution Queue (First 10-20 Tasks)

1. `CS-P1-001` - Secure Clerk webhook/onboarding role flow.
2. `CS-P1-003` - Enforce ownership checks on all document/comparable endpoints.
3. `CS-P1-002` - Switch Blob to private + signed URL access model.
4. `CS-P1-004` - Fix `/appraisals/*` route namespace defects.
5. `CS-P1-005` - Reconcile extraction API/UI payload mismatch.
6. `CS-P1-006` - Generate baseline migrations + required indexes.
7. `CS-P1-008` - Repair wizard state propagation and autosave integrity.
8. `CS-P1-007` - Add rate limiting to sensitive routes.
9. `CS-P1-009` - Stand up test harness for security + core flows.
10. `CS-P2-006` - Fix valuation output completeness (`dvPercentOfRepair`, input guards).
11. `CS-P2-005` - Replace placeholder Apify actor, add min-count fallback logic.
12. `CS-P2-011` - Normalize Stripe price env keys and webhook idempotency.
13. `CS-P2-004` - Implement normalized document metadata model and document tab functionality.
14. `CS-P2-001` - Build full 14-section PDF report generator.
15. `CS-P2-002` - Implement narrative engines and legal content insertion.

## Parallel Assignment Plan (24/7)

### Track 1 - Backend/API Security

- `CS-P1-001`, `CS-P1-003`, `CS-P1-007`
- Agent Type: Code Generation
- Human Checkpoint: endpoint auth matrix review

### Track 2 - Storage/Data Foundation

- `CS-P1-002`, `CS-P1-006`, `CS-P2-004`
- Agent Type: Database
- Human Checkpoint: migration and data privacy sign-off

### Track 3 - Wizard and UX Critical Path

- `CS-P1-004`, `CS-P1-005`, `CS-P1-008`
- Agent Type: Code Generation
- Human Checkpoint: E2E wizard demo

### Track 4 - Monetization Reliability

- `CS-P2-011`, `CS-P2-006`
- Agent Type: Code Generation
- Human Checkpoint: Stripe test-mode verification

### Track 5 - Report Deliverable Core

- `CS-P2-001`, `CS-P2-002`
- Agent Type: Code Generation
- Human Checkpoint: legal/compliance content approval

## 24-Hour Success Criteria

- All P0 security route and ownership defects patched.
- Wizard can complete without routing or extraction payload failure.
- Migration artifacts committed and reproducible.
- Test harness exists with at least auth/ownership/calculation smoke coverage.
- PDF pipeline implementation started with at least 5/14 sections complete.

## Blockers Requiring Human Decision in First 24 Hours

- Final role entitlement policy by plan tier (individual/appraiser/attorney/body_shop/admin).
- Choice of rate-limiter backing store (edge store/redis/local fallback).
- Legal text acceptance for multi-state template expansions.

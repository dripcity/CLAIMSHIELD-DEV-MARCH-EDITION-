# ClaimShield DV Detailed Task Roadmap

Generated: 2026-03-02

## Parallel Workstream Mapping

- Track 1: Frontend Components and UX (`app/(dashboard)/**`, `app/_components/**`)
- Track 2: Backend API Development (`app/api/**`)
- Track 3: Database and Data Layer (`lib/db/**`, `drizzle/**`)
- Track 4: Integration and Testing (`tests/**`, external API adapters)
- Track 5: Documentation and DevOps (`docs/**`, release runbooks, CI)

## Tasks

### Task ID: CS-P1-001

**Priority**: P0
**Category**: Security
**Phase**: 1
**Estimated Agent-Hours**: 8
**Dependencies**: None
**Assignable to Agent Type**: Code Generation

**Description**:
Replace insecure Clerk role endpoint pattern with verified webhook + authenticated onboarding role API.

**Acceptance Criteria**:

- [ ] Clerk webhook signature validation implemented
- [ ] Onboarding uses authenticated internal API, not webhook path
- [ ] Role updates cannot be spoofed by unauthenticated callers

**Files to Modify**:

- app/api/webhooks/clerk/route.ts
- app/(auth)/onboarding/page.tsx
- lib/utils/auth.ts

**Technical Approach**:
Introduce dedicated `/api/users/role` route guarded by `requireAuth`; keep webhook route limited to Clerk events with signature verification and event schema validation.

**Validation Method**:
Integration tests for unauthorized role-change attempts + signed webhook acceptance path.

**Risks/Blockers**:
Requires Clerk webhook secret configuration.

### Task ID: CS-P1-002

**Priority**: P0
**Category**: Security
**Phase**: 1
**Estimated Agent-Hours**: 12
**Dependencies**: None
**Assignable to Agent Type**: Code Generation

**Description**:
Enforce private Blob access and signed URL retrieval for all uploaded documents and reports.

**Acceptance Criteria**:

- [ ] Blob uploads are private
- [ ] Signed URLs expire and are ownership-validated
- [ ] Public direct access to sensitive files is blocked

**Files to Modify**:

- lib/storage/blob.ts
- app/api/documents/upload/route.ts
- app/api/documents/[id]/route.ts
- app/api/email/send/route.ts

**Technical Approach**:
Switch Blob access mode, add signed URL helper with TTL, and resolve file access through authenticated server routes.

**Validation Method**:
Attempt unauthenticated URL access should fail; authenticated signed URL works within TTL only.

**Risks/Blockers**:
May require document metadata normalization first for robust ownership checks.

### Task ID: CS-P1-003

**Priority**: P0
**Category**: Security
**Phase**: 1
**Estimated Agent-Hours**: 14
**Dependencies**: None
**Assignable to Agent Type**: Code Generation

**Description**:
Add resource ownership checks to all document/comparable routes.

**Acceptance Criteria**:

- [ ] Every appraisal-linked endpoint validates ownership
- [ ] Cross-tenant access returns 403
- [ ] Ownership checks are covered by tests

**Files to Modify**:

- app/api/comparables/[id]/route.ts
- app/api/comparables/search/route.ts
- app/api/documents/[id]/route.ts
- app/api/documents/extract/route.ts
- app/api/documents/upload/route.ts
- lib/utils/auth.ts

**Technical Approach**:
Add lookup helpers for resource-to-appraisal mapping and enforce `requireAppraisalOwnership` before mutate/read operations.

**Validation Method**:
Integration tests with two users and shared IDs to confirm denial paths.

**Risks/Blockers**:
Needs stable document/comparable ID relation model.

### Task ID: CS-P1-004

**Priority**: P0
**Category**: Bug Fix
**Phase**: 1
**Estimated Agent-Hours**: 4
**Dependencies**: None
**Assignable to Agent Type**: Code Generation

**Description**:
Fix broken wizard/report routing to use `/dashboard/appraisals/*` consistently.

**Acceptance Criteria**:

- [ ] No router.push target points to invalid `/appraisals/*` paths
- [ ] Step transitions and preview routes resolve correctly
- [ ] No 404 from wizard navigation

**Files to Modify**:

- app/_components/wizard/WizardLayout.tsx
- app/_components/wizard/Step7Review.tsx
- app/_components/wizard/Step8Generate.tsx

**Technical Approach**:
Introduce centralized route builder utility and replace hardcoded strings.

**Validation Method**:
E2E wizard navigation smoke test.

**Risks/Blockers**:
None.

### Task ID: CS-P1-005

**Priority**: P0
**Category**: Feature
**Phase**: 1
**Estimated Agent-Hours**: 10
**Dependencies**: CS-P1-003
**Assignable to Agent Type**: Code Generation

**Description**:
Unify document extraction API/UI contract and persist extraction-ready document metadata.

**Acceptance Criteria**:

- [ ] Step4 sends documentUrl + documentType expected by API
- [ ] Extraction response maps to form fields deterministically
- [ ] Extraction failures return structured errors

**Files to Modify**:

- app/_components/wizard/Step4DocumentUpload.tsx
- app/api/documents/extract/route.ts
- app/_components/DocumentPreview.tsx

**Technical Approach**:
Store uploaded document metadata in appraisal/document model and call extraction using canonical URL/type payload.

**Validation Method**:
Upload + extract flow test across repair estimate and insurance docs.

**Risks/Blockers**:
Will surface downstream type/schema mismatches requiring follow-up fixes.

### Task ID: CS-P1-006

**Priority**: P0
**Category**: Architecture
**Phase**: 1
**Estimated Agent-Hours**: 6
**Dependencies**: None
**Assignable to Agent Type**: Database

**Description**:
Generate and commit baseline Drizzle migrations, including missing indexes.

**Acceptance Criteria**:

- [ ] Migration directory exists and is committed
- [ ] Indexes for user_id/appraisal_id/status are created
- [ ] Fresh DB can migrate from zero state

**Files to Modify**:

- drizzle.config.ts
- lib/db/schema.ts
- drizzle/*

**Technical Approach**:
Define missing index declarations, generate migrations, validate up/down strategy in staging.

**Validation Method**:
Run migration on empty DB and verify schema parity checks.

**Risks/Blockers**:
Requires stable DB URL in env.

### Task ID: CS-P1-007

**Priority**: P0
**Category**: Security
**Phase**: 1
**Estimated Agent-Hours**: 8
**Dependencies**: CS-P1-003
**Assignable to Agent Type**: Code Generation

**Description**:
Add rate limiting and abuse protection on sensitive API routes.

**Acceptance Criteria**:

- [ ] Rate limits exist for auth-adjacent, upload, extraction, checkout, webhook endpoints
- [ ] 429 responses are consistent and logged
- [ ] No regression on normal usage

**Files to Modify**:

- app/api/**/*
- lib/utils/*

**Technical Approach**:
Implement middleware/route-level limiter with per-user/IP buckets and configurable thresholds.

**Validation Method**:
Synthetic burst tests confirm throttling behavior.

**Risks/Blockers**:
May require Redis/edge store selection.

### Task ID: CS-P1-008

**Priority**: P0
**Category**: Feature
**Phase**: 1
**Estimated Agent-Hours**: 10
**Dependencies**: CS-P1-004, CS-P1-005
**Assignable to Agent Type**: Code Generation

**Description**:
Repair wizard state management so each step persists and auto-save works with real changes.

**Acceptance Criteria**:

- [ ] Step inputs call shared `onChange` handlers
- [ ] Auto-save writes actual delta state every 30s
- [ ] Resume from saved draft restores all step data

**Files to Modify**:

- app/(dashboard)/appraisals/[id]/wizard/page.tsx
- app/_components/wizard/Step1VehicleInfo.tsx
- app/_components/wizard/Step2OwnerInfo.tsx
- app/_components/wizard/Step3AccidentDetails.tsx
- app/_components/wizard/WizardLayout.tsx

**Technical Approach**:
Move to normalized form state contract with typed per-step adapters and controlled components.

**Validation Method**:
E2E save/refresh/resume scenario across 8 steps.

**Risks/Blockers**:
Requires alignment of JSON shapes with DB schema.

### Task ID: CS-P1-009

**Priority**: P0
**Category**: Testing
**Phase**: 1
**Estimated Agent-Hours**: 20
**Dependencies**: CS-P1-001, CS-P1-003, CS-P1-008
**Assignable to Agent Type**: Testing

**Description**:
Create baseline automated test harness (unit + integration) for security and core workflows.

**Acceptance Criteria**:

- [ ] Test runner configured in package scripts
- [ ] Auth/ownership tests implemented
- [ ] Calculation and extraction contract tests implemented

**Files to Modify**:

- package.json
- tests/**/*
- vitest.config.ts

**Technical Approach**:
Adopt Vitest + API integration harness; seed deterministic fixtures.

**Validation Method**:
CI test command passes and fails on intentional regressions.

**Risks/Blockers**:
Needs test DB strategy.

### Task ID: CS-P2-001

**Priority**: P0
**Category**: Feature
**Phase**: 2
**Estimated Agent-Hours**: 48
**Dependencies**: CS-P1-006, CS-P1-008
**Assignable to Agent Type**: Code Generation

**Description**:
Implement full 14-section React-PDF appraisal report pipeline per `.agent` spec.

**Acceptance Criteria**:

- [ ] All required report sections render
- [ ] Page headers/footers and pagination present
- [ ] Report meets minimum content depth and includes legal sections

**Files to Modify**:

- lib/pdf/generator.tsx
- lib/pdf/components/*
- app/api/appraisals/[id]/generate-pdf/route.ts

**Technical Approach**:
Split PDF into composable section components with strict typed input assembler.

**Validation Method**:
Golden PDF regression checks and manual legal-content review.

**Risks/Blockers**:
Needs finalized narrative and citation engines.

### Task ID: CS-P2-002

**Priority**: P0
**Category**: Feature
**Phase**: 2
**Estimated Agent-Hours**: 24
**Dependencies**: CS-P2-001
**Assignable to Agent Type**: Code Generation

**Description**:
Implement narrative engines (repair analysis, market stigma, severity justification insertion).

**Acceptance Criteria**:

- [ ] Narrative modules generate deterministic text from appraisal data
- [ ] PDF includes narrative sections
- [ ] State-law and severity narratives match source rules

**Files to Modify**:

- lib/narratives/*
- lib/pdf/generator.tsx
- lib/calculations/severity-classifier.ts

**Technical Approach**:
Use typed template functions with explicit rule-based branching from master schema.

**Validation Method**:
Snapshot tests for GA/NC/default and severity levels 1-5.

**Risks/Blockers**:
Requires clear editorial baseline from SNAPCLAIM sample.

### Task ID: CS-P2-003

**Priority**: P0
**Category**: Feature
**Phase**: 2
**Estimated Agent-Hours**: 12
**Dependencies**: CS-P1-005
**Assignable to Agent Type**: Code Generation

**Description**:
Implement VIN decode integration and equipment enrichment.

**Acceptance Criteria**:

- [ ] Valid VIN triggers decode API
- [ ] Decoded fields populate and remain user-editable
- [ ] Failures degrade gracefully to manual entry

**Files to Modify**:

- app/_components/wizard/Step1VehicleInfo.tsx
- app/api/vin/decode/route.ts
- lib/validation/schemas.ts

**Technical Approach**:
Add server-side VIN decode proxy and normalization layer.

**Validation Method**:
Unit tests for VIN parsing + integration tests for decode success/failure.

**Risks/Blockers**:
External VIN API reliability.

### Task ID: CS-P2-004

**Priority**: P0
**Category**: Feature
**Phase**: 2
**Estimated Agent-Hours**: 16
**Dependencies**: CS-P1-003, CS-P1-006
**Assignable to Agent Type**: Database

**Description**:
Implement normalized document metadata model and full document-library features.

**Acceptance Criteria**:

- [ ] Documents tab lists type/name/size/date
- [ ] Preview/download/delete are ownership-safe
- [ ] Deleting removes Blob object and DB reference

**Files to Modify**:

- lib/db/schema.ts
- app/(dashboard)/appraisals/[id]/documents/page.tsx
- app/api/documents/[id]/route.ts
- app/api/documents/upload/route.ts

**Technical Approach**:
Add documents table linked to appraisal/user and backfill existing URL fields.

**Validation Method**:
Integration tests for upload->preview->delete lifecycle.

**Risks/Blockers**:
Requires migration and data backfill strategy.

### Task ID: CS-P2-005

**Priority**: P0
**Category**: Feature
**Phase**: 2
**Estimated Agent-Hours**: 14
**Dependencies**: CS-P1-006
**Assignable to Agent Type**: Code Generation

**Description**:
Harden comparables search with production actor, retries, and min-count expansion logic.

**Acceptance Criteria**:

- [ ] Apify actor ID configurable and non-placeholder
- [ ] Search expands radius/tolerance when <3 results
- [ ] Pre/post-accident filters correctly enforced

**Files to Modify**:

- lib/scraping/apify-search.ts
- app/api/comparables/search/route.ts
- lib/env.ts

**Technical Approach**:
Implement resilient search loop with bounded retries and fallback controls.

**Validation Method**:
Mocked API tests proving min/max comp behavior and timeout handling.

**Risks/Blockers**:
Apify usage cost controls must be tuned.

### Task ID: CS-P2-006

**Priority**: P0
**Category**: Feature
**Phase**: 2
**Estimated Agent-Hours**: 8
**Dependencies**: CS-P1-008
**Assignable to Agent Type**: Code Generation

**Description**:
Finalize valuation output correctness (including dvPercentOfRepair) and validation.

**Acceptance Criteria**:

- [ ] All required valuation fields computed
- [ ] Server rejects invalid comp sets
- [ ] Median and constants are test-verified

**Files to Modify**:

- lib/calculations/valuation.ts
- app/api/calculations/route.ts
- lib/validation/schemas.ts

**Technical Approach**:
Use strict DTOs + guard clauses and derive repair-percent from accident details.

**Validation Method**:
Unit + property tests for constants, median, and percentage outputs.

**Risks/Blockers**:
Dependent on clean input data model.

### Task ID: CS-P2-007

**Priority**: P1
**Category**: Feature
**Phase**: 2
**Estimated Agent-Hours**: 16
**Dependencies**: CS-P1-008
**Assignable to Agent Type**: Code Generation

**Description**:
Implement missing appraisal management actions: duplicate, archive, share, bulk download.

**Acceptance Criteria**:

- [ ] Duplicate creates full draft clone
- [ ] Archive is soft delete and hidden by default
- [ ] Share creates expiring signed URL
- [ ] Bulk download returns zip of selected reports

**Files to Modify**:

- app/(dashboard)/appraisals/[id]/page.tsx
- app/(dashboard)/dashboard/page.tsx
- app/api/appraisals/*
- app/api/share/*

**Technical Approach**:
Add action routes with ownership checks and background zip generation for bulk downloads.

**Validation Method**:
E2E tests for each action and permission checks.

**Risks/Blockers**:
Bulk download may require async job queue.

### Task ID: CS-P2-008

**Priority**: P0
**Category**: Feature
**Phase**: 2
**Estimated Agent-Hours**: 18
**Dependencies**: CS-P2-001, CS-P2-002
**Assignable to Agent Type**: Code Generation

**Description**:
Complete document template engine with all required templates and placeholder substitution guarantees.

**Acceptance Criteria**:

- [ ] All 7 templates implemented
- [ ] No unresolved {{placeholders}} remain
- [ ] State/role gating works

**Files to Modify**:

- lib/templates/*
- app/api/templates/[type]/route.ts

**Technical Approach**:
Introduce shared template renderer with strict key coverage checks and fallback values.

**Validation Method**:
Snapshot tests per template + placeholder scan assertions.

**Risks/Blockers**:
Legal copy review needed for jurisdiction language.

### Task ID: CS-P2-009

**Priority**: P1
**Category**: Feature
**Phase**: 2
**Estimated Agent-Hours**: 10
**Dependencies**: CS-P2-008
**Assignable to Agent Type**: Code Generation

**Description**:
Add DOCX export pipeline for templates.

**Acceptance Criteria**:

- [ ] Template endpoint can return DOCX for supported types
- [ ] DOCX formatting preserves key sections
- [ ] Downloads work for large docs

**Files to Modify**:

- lib/templates/*
- app/api/templates/[type]/route.ts

**Technical Approach**:
Use `docx` package with template->doc conversion service.

**Validation Method**:
Generated DOCX opens in Word/Google Docs without corruption.

**Risks/Blockers**:
Formatting parity with PDF templates may require iteration.

### Task ID: CS-P2-010

**Priority**: P0
**Category**: Security
**Phase**: 2
**Estimated Agent-Hours**: 12
**Dependencies**: CS-P1-001
**Assignable to Agent Type**: Code Generation

**Description**:
Implement RBAC enforcement across API and UI capability surfaces.

**Acceptance Criteria**:

- [ ] Role policy matrix defined
- [ ] Role-restricted endpoints return 403
- [ ] UI hides/protects inaccessible actions

**Files to Modify**:

- lib/utils/auth.ts
- app/api/**/*
- app/(dashboard)/**/*

**Technical Approach**:
Introduce permission helpers per role and central route guards.

**Validation Method**:
Role-based integration tests across individual/appraiser/attorney/body_shop/admin.

**Risks/Blockers**:
Business policy confirmation required for final entitlement matrix.

### Task ID: CS-P2-011

**Priority**: P0
**Category**: Feature
**Phase**: 2
**Estimated Agent-Hours**: 12
**Dependencies**: CS-P1-001, CS-P1-006
**Assignable to Agent Type**: Code Generation

**Description**:
Fix payment env model, entitlement updates, and webhook idempotency/role mapping.

**Acceptance Criteria**:

- [ ] Price IDs validated at startup
- [ ] Webhook processing idempotent
- [ ] Plan->role and entitlement transitions implemented

**Files to Modify**:

- app/api/checkout/route.ts
- app/api/webhooks/stripe/route.ts
- lib/env.ts
- lib/payments/stripe.ts

**Technical Approach**:
Normalize env names, add event dedupe store, and explicit entitlement state machine.

**Validation Method**:
Stripe webhook replay tests and checkout integration tests.

**Risks/Blockers**:
Requires Stripe test fixtures and webhook secrets.

### Task ID: CS-P2-012

**Priority**: P1
**Category**: Feature
**Phase**: 2
**Estimated Agent-Hours**: 10
**Dependencies**: CS-P2-011
**Assignable to Agent Type**: Code Generation

**Description**:
Complete SendGrid workflows: welcome, payment confirmation, renewal reminders, failed payment alerts.

**Acceptance Criteria**:

- [ ] All required email types send via templates
- [ ] Events are triggered from payment/user lifecycle
- [ ] Ownership/privacy constraints maintained

**Files to Modify**:

- lib/email/sendgrid.ts
- app/api/email/send/route.ts
- app/api/webhooks/stripe/route.ts

**Technical Approach**:
Create event-driven email dispatcher with template map and retryable send jobs.

**Validation Method**:
Email integration tests with mocked SendGrid and event fixtures.

**Risks/Blockers**:
Production sender domain verification needed.

### Task ID: CS-P3-001

**Priority**: P1
**Category**: Feature
**Phase**: 3
**Estimated Agent-Hours**: 14
**Dependencies**: CS-P2-010
**Assignable to Agent Type**: Code Generation

**Description**:
Implement professional role feature surfaces (appraiser USPAP/signature, attorney team management, body shop white-label controls).

**Acceptance Criteria**:

- [ ] Role-specific UI modules are available and secured
- [ ] USPAP fields render for appraisers only
- [ ] Attorney/body_shop scoped features enabled

**Files to Modify**:

- app/(dashboard)/**/*
- lib/db/schema.ts
- lib/pdf/generator.tsx

**Technical Approach**:
Add modular feature flags by role and extend profile/data schema for role-specific settings.

**Validation Method**:
Role matrix E2E tests.

**Risks/Blockers**:
Requires policy decisions on attorney team model.

### Task ID: CS-P3-002

**Priority**: P1
**Category**: Feature
**Phase**: 3
**Estimated Agent-Hours**: 12
**Dependencies**: CS-P2-005
**Assignable to Agent Type**: Code Generation

**Description**:
Implement advanced before/after image comparison logic for requirement-level completeness.

**Acceptance Criteria**:

- [ ] Multiple images supported
- [ ] Before/after comparison summary generated
- [ ] Confidence and panel suggestions surfaced

**Files to Modify**:

- lib/ai/analyze-images.ts
- app/_components/wizard/Step4DocumentUpload.tsx
- lib/ai/schemas.ts

**Technical Approach**:
Batch image handling with deterministic prompt framing and output normalization.

**Validation Method**:
Fixture-based image extraction regression suite.

**Risks/Blockers**:
Model variability requires robust parsing fallback.

### Task ID: CS-P3-003

**Priority**: P2
**Category**: Feature
**Phase**: 3
**Estimated Agent-Hours**: 16
**Dependencies**: CS-P2-001
**Assignable to Agent Type**: Documentation

**Description**:
Build educational resources and negotiation guidance module.

**Acceptance Criteria**:

- [ ] Resources pages exist and are navigable
- [ ] State-specific and methodology guidance included
- [ ] Content is searchable by topic

**Files to Modify**:

- app/resources/*
- app/(dashboard)/layout.tsx
- lib/content/*

**Technical Approach**:
Static content modules with markdown-driven topic taxonomy.

**Validation Method**:
Content QA checklist and route smoke tests.

**Risks/Blockers**:
Legal review recommended before publication.

### Task ID: CS-P3-004

**Priority**: P1
**Category**: Performance
**Phase**: 3
**Estimated Agent-Hours**: 10
**Dependencies**: CS-P2-001, CS-P2-005
**Assignable to Agent Type**: Code Generation

**Description**:
Performance tuning pass for API hotspots, comparables search latency, and PDF generation throughput.

**Acceptance Criteria**:

- [ ] Dashboard/API p95 latency baselines established
- [ ] Comparable search under 15s target in test environment
- [ ] PDF generation under 45s for representative sample

**Files to Modify**:

- app/api/**/*
- lib/pdf/*
- lib/scraping/*

**Technical Approach**:
Add timed instrumentation, optimize query/data transforms, and parallelize heavy operations where safe.

**Validation Method**:
Benchmark script reports and tracked p95 metrics.

**Risks/Blockers**:
External API variability can skew benchmarks.

### Task ID: CS-P4-001

**Priority**: P0
**Category**: Testing
**Phase**: 4
**Estimated Agent-Hours**: 36
**Dependencies**: CS-P2-001, CS-P2-004, CS-P2-011
**Assignable to Agent Type**: Testing

**Description**:
Deliver full test coverage pack (unit + integration + E2E + browser automation for critical flows).

**Acceptance Criteria**:

- [ ] Critical-path E2E suite passes
- [ ] Auth/ownership/security test scenarios pass
- [ ] PDF/template/payment workflows tested end-to-end

**Files to Modify**:

- tests/**/*
- package.json
- playwright.config.ts

**Technical Approach**:
Add Playwright-based browser suite with deterministic fixtures and parallel shards.

**Validation Method**:
CI runs full matrix with artifact capture on failures.

**Risks/Blockers**:
Needs stable seeded environment.

### Task ID: CS-P4-002

**Priority**: P1
**Category**: Security
**Phase**: 4
**Estimated Agent-Hours**: 12
**Dependencies**: CS-P1-001, CS-P1-002, CS-P1-003, CS-P1-007
**Assignable to Agent Type**: Testing

**Description**:
Run security hardening sweep (OWASP-focused) and remediate findings.

**Acceptance Criteria**:

- [ ] No high/critical unresolved security findings
- [ ] Webhook/auth/upload abuse tests documented
- [ ] Security logging coverage expanded

**Files to Modify**:

- app/api/**/*
- lib/utils/*
- docs/security.md

**Technical Approach**:
Automate threat checklist and targeted negative tests for high-risk endpoints.

**Validation Method**:
Security regression report with pass/fail evidence.

**Risks/Blockers**:
Potential late-breaking P0 findings.

### Task ID: CS-P4-003

**Priority**: P1
**Category**: Performance
**Phase**: 4
**Estimated Agent-Hours**: 8
**Dependencies**: CS-P3-004
**Assignable to Agent Type**: Code Generation

**Description**:
Implement bundle/performance budgets and alerts.

**Acceptance Criteria**:

- [ ] Bundle-size budget checks in CI
- [ ] Lighthouse or equivalent baselines stored
- [ ] Regressions fail CI thresholds

**Files to Modify**:

- package.json
- next.config.js
- scripts/perf/*

**Technical Approach**:
Add analysis tooling and enforce thresholds in pipeline.

**Validation Method**:
Intentional regression triggers failing check.

**Risks/Blockers**:
Threshold calibration needed.

### Task ID: CS-P4-004

**Priority**: P1
**Category**: Documentation
**Phase**: 4
**Estimated Agent-Hours**: 10
**Dependencies**: CS-P4-001, CS-P4-002
**Assignable to Agent Type**: Documentation

**Description**:
Produce operational runbooks (deploy, rollback, migration, incident response, key rotation).

**Acceptance Criteria**:

- [ ] Runbooks exist and are versioned
- [ ] On-call playbook includes critical failure paths
- [ ] External service setup docs are complete

**Files to Modify**:

- docs/runbooks/*
- README.md

**Technical Approach**:
Codify release and recovery procedures aligned with tested workflows.

**Validation Method**:
Tabletop exercise using runbook steps.

**Risks/Blockers**:
Requires final architecture stabilization.

### Task ID: CS-P4-005

**Priority**: P0
**Category**: Testing
**Phase**: 4
**Estimated Agent-Hours**: 8
**Dependencies**: CS-P4-001, CS-P4-002, CS-P4-003, CS-P4-004
**Assignable to Agent Type**: Browser Testing

**Description**:
Execute production-readiness launch rehearsal with synthetic user journeys.

**Acceptance Criteria**:

- [ ] Full signup->appraisal->payment->report->email flow succeeds
- [ ] All launch blockers closed or accepted with waiver
- [ ] Go-live checklist signed by human overseer

**Files to Modify**:

- .agent/reports/launch-rehearsal.md

**Technical Approach**:
Run scripted end-to-end rehearsal in staging and capture artifacts/screenshots.

**Validation Method**:
Launch rehearsal report with timestamps, logs, and pass/fail matrix.

**Risks/Blockers**:
Requires stable staging credentials and external service quotas.


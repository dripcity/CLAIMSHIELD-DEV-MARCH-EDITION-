# ClaimShield DV - Day 1 Execution Prompts

Copy and paste these prompts into Kiro chat at each stage of Day 1 execution.

---

## Kickoff Prompt (Hour 0)

```
#file:.kiro/context/NEXT_24_HOURS_QUICKSTART.md
#file:.kiro/context/CLAIMSHIELD_DV_TASK_ROADMAP.json

I'm ready to begin autonomous execution of the ClaimShield DV launch roadmap.

**Day 1 Objective**: Complete first 24 hours of critical path (CS-LR-001 through CS-LR-019).

**Execution Protocol**:
1. Reference #task-execution-protocol for each task
2. Load task details from roadmap JSON
3. Verify all dependencies complete before starting
4. Implement per technical approach
5. Validate against ALL acceptance criteria
6. Run quality gates (lint, build, tests where applicable)
7. Report completion status with evidence

**Security Reminders**:
- Apply #security-requirements patterns for all auth-related tasks
- Never skip authorization checks
- Use strict Zod validation for all input

**Checkpoints**:
- Checkpoint A (Hour 6): App boots cleanly, root route works
- Checkpoint B (Hour 12): All P0 security patches reviewed
- Checkpoint C (Hour 18): Migrations and CI gates operational  
- Checkpoint D (Hour 24): Wizard paths stable, extraction working

Begin with **CS-LR-001**: Resolve Clerk/React runtime incompatibilities.
```

---

## Task Completion Verification (After Each Task)

```
Verify task CS-LR-[XXX] completion:

Checklist:
- [ ] All acceptance criteria met (list each with status)
- [ ] npm run lint passes
- [ ] npm run build succeeds
- [ ] Relevant tests pass (if applicable)
- [ ] Security review complete (if auth-related)
- [ ] Files modified match roadmap expectation

Provide completion report with:
- Status: Complete/Partial/Blocked
- Evidence: [output of validation commands]
- Next task: CS-LR-[XXX+1]
- Estimated time to complete: [X hours]

If complete, update roadmap JSON status and proceed to next task.
```

---

## Checkpoint A Prompt (Hour 6 - After CS-LR-002)

```
**CHECKPOINT A VERIFICATION**

Tasks expected complete: CS-LR-001, CS-LR-002

Verification required:
1. Run `npm run dev` from terminal
2. Confirm server starts without errors
3. Open browser to http://localhost:3000
4. Verify root route renders (no 500 error)
5. Test sign-in route loads

Report:
- [ ] App boots successfully
- [ ] Root route accessible  
- [ ] No runtime dependency errors
- [ ] Quality gates (lint/build/test) deterministic

If all checks pass, proceed to CS-LR-003 (security patches phase).

If any check fails, diagnose and fix before continuing.
```

---

## Checkpoint B Prompt (Hour 12 - After CS-LR-007)

```
**CHECKPOINT B VERIFICATION**

Tasks expected complete: CS-LR-001 through CS-LR-007

Security patch verification:
1. Review CS-LR-003: Comparables ownership checks implemented
2. Review CS-LR-004: Documents ownership checks implemented
3. Review CS-LR-005: Mass assignment protection added
4. Review CS-LR-006: Private blob storage configured
5. Review CS-LR-007: Signed share tokens implemented

For each security task, verify:
- [ ] Authorization pattern from #security-requirements applied
- [ ] Test coverage exists for auth paths
- [ ] Error handling doesn't leak sensitive data
- [ ] Code follows Zod validation patterns

Generate security audit report with:
- Vulnerabilities fixed: [count]
- Test coverage: [%]
- Remaining risks: [list or "None"]
- Ready for production: [Yes/No]

If audit passes, proceed to CS-LR-008 (monetization alignment).
```

---

## Checkpoint C Prompt (Hour 18 - After CS-LR-013)

```
**CHECKPOINT C VERIFICATION**

Tasks expected complete: CS-LR-001 through CS-LR-013

Database & CI verification:
1. Verify migrations generated in drizzle/ directory
2. Confirm indexes present in schema for:
   - appraisals.user_id
   - appraisals.status  
   - comparable_vehicles.appraisal_id
3. Run seed script: `npm run db:seed` (if exists)
4. Verify CI pipeline file exists: `.github/workflows/ci.yml`
5. Test CI locally or push branch to trigger

Report:
- [ ] Migrations checked in and executable
- [ ] All required indexes present
- [ ] Seed data loads successfully
- [ ] CI pipeline runs lint/build/test
- [ ] No schema drift vs spec

If verification passes, proceed to CS-LR-014 (wizard fixes phase).
```

---

## Checkpoint D Prompt (Hour 24 - After CS-LR-019)

```
**CHECKPOINT D VERIFICATION**

Tasks expected complete: CS-LR-001 through CS-LR-019 (full Day 1)

End-of-day comprehensive check:

**Runtime Stability**:
- [ ] App boots without errors
- [ ] All quality gates pass
- [ ] No TypeScript compilation errors

**Security**:
- [ ] All P0 vulnerabilities patched
- [ ] Authorization checks on all mutating endpoints
- [ ] Private storage model enforced

**Monetization**:
- [ ] Individual report price: $129 (12900 cents)
- [ ] Plan model: individual/professional/attorney/body_shop
- [ ] Webhook fulfillment idempotent

**Wizard**:
- [ ] Routes use /dashboard/ namespace
- [ ] State wiring complete for steps 1-3
- [ ] Autosave functional

**Integrations**:
- [ ] Gemini 3.1 Pro model configured
- [ ] Apify actor production-ready
- [ ] Document extraction payload aligned

**Data Layer**:
- [ ] Migrations checked in
- [ ] Indexes created
- [ ] Seed scripts available

Generate Day 1 summary report:
- Tasks completed: X/19
- Blockers encountered: [list or "None"]
- Checkpoint status: [All Pass / Issues Found]
- Ready for Phase 2: [Yes/No]
- Estimated Phase 2 start: [timestamp]

Commit checkpoint:
```bash
git add .
git commit -m "checkpoint: Day 1 complete - CS-LR-001 through CS-LR-019"
git tag day-1-complete
git push origin kiro-autonomous-execution --tags
```
```

---

## Recovery Prompt (If Session Interrupted)

```
**SESSION RECOVERY**

Last known state query:
#file:.kiro/context/CLAIMSHIELD_DV_TASK_ROADMAP.json

Analyze roadmap and determine:
1. Last completed task: CS-LR-[XXX]
2. Current task status: [In Progress/Blocked/Not Started]
3. Checkpoint status: [Passed Checkpoint A/B/C/D or None]
4. Blockers: [list or "None"]

Resume from:
- If task in progress: Continue CS-LR-[XXX] from last known state
- If task complete: Proceed to next dependency-free task
- If checkpoint failed: Re-verify checkpoint requirements

Provide recovery plan:
- Resume point: [task ID]
- Actions required: [list]
- Estimated time to sync: [X hours]

Begin execution from recovery point.
```

---

## Escalation Prompt (If Stuck on Task)

```
**ESCALATION REQUEST**

Task ID: CS-LR-[XXX]
Status: Blocked

Issue encountered:
[Describe the problem]

Attempted solutions:
1. [What you tried]
2. [What you tried]
3. [What you tried]

Diagnosis:
- Root cause: [analysis]
- Upstream dependencies: [affected tasks]
- Impact on roadmap: [high/medium/low]

Recommended action:
Option 1: [workaround approach]
Option 2: [alternative implementation]  
Option 3: [human review required]

Requesting human review for:
- [ ] Acceptance criteria clarification
- [ ] Technical approach approval
- [ ] External dependency resolution
- [ ] Scope adjustment

Provide detailed context for human review.
```

---

## Phase 2 Kickoff Prompt (After Day 1 Complete)

```
#file:.kiro/context/CLAIMSHIELD_DV_TASK_ROADMAP.json

**PHASE 2 KICKOFF**

Day 1 (Phase 1) complete. Beginning Phase 2: Core Feature Completion.

**Phase 2 Objective**: Complete CS-LR-015 through CS-LR-026 (estimated 212 agent-hours).

**Key deliverables**:
- Wizard routing and state consistency
- Full document extraction pipeline  
- Complete PDF report generation (15-25 pages)
- Template engine with all 7 templates
- Email delivery integration
- Payment webhook fulfillment

**Execution strategy**:
- Continue task-by-task execution per roadmap
- Apply same quality gates and checkpoints
- Reference #security-requirements for auth tasks
- Use specs for complex features (CS-LR-021, CS-LR-023)

**Phase 2 Checkpoint** (after CS-LR-026):
- Full wizard flow manual QA required
- Report generation visual review
- Template accuracy validation

Begin with **CS-LR-015**: Normalize wizard routing paths.
```

---

## Quick Reference Commands

During execution, use these in Kiro chat as needed:

**Load security patterns**:
```
#security-requirements
```

**Load pricing specs**:
```
#pricing-requirements
```

**Check task protocol**:
```
#task-execution-protocol
```

**Update roadmap status manually**:
```
/update-roadmap-status
```

**Load specific context section**:
```
#file:.kiro/context/COMPREHENSIVE_LAUNCH_READINESS_REPORT.md
Jump to section: [section name]
```

**Quick roadmap query**:
```
#file:.kiro/context/CLAIMSHIELD_DV_TASK_ROADMAP.json
What tasks are complete? What's next in the critical path?
```

---

**Pro Tip**: Save these prompts locally and paste them at appropriate checkpoints. Adjust task IDs and checkpoints as execution progresses.

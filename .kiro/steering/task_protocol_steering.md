---
title: Task Execution Protocol
inclusion: auto
description: Task execution workflow and quality gates. Use when starting any roadmap task.
---

# Task Execution Protocol

## Before Starting Any Task

1. **Load Task Context**:
   ```
   #file:.kiro/context/CLAIMSHIELD_DV_TASK_ROADMAP.json
   ```

2. **Identify Task Details**:
   - Task ID (e.g., CS-LR-001)
   - Dependencies (check `dependencies` array)
   - Acceptance criteria (verify each criterion)
   - Files to modify (reference `filesToModify`)

3. **Check Dependencies**:
   - All blocking tasks marked "Done" in roadmap
   - No unresolved merge conflicts in target files

## During Task Execution

1. **Create Feature Branch** (if not in autonomous mode):
   ```bash
   git checkout -b task/CS-LR-XXX-description
   ```

2. **Implement Changes**:
   - Follow technical approach from roadmap
   - Reference acceptance criteria continuously
   - Apply security patterns from steering files

3. **Validate Implementation**:
   - Run `npm run lint`
   - Run `npm run build`
   - Execute relevant tests
   - Manual verification if E2E required

## Task Completion Checklist

Before marking task complete:

- [ ] All acceptance criteria met
- [ ] Lint passes
- [ ] Build passes
- [ ] Tests updated/added (if applicable)
- [ ] Security review (for P0/P1 security tasks)
- [ ] Documentation updated (if API/behavior changed)
- [ ] Files match `filesToModify` expectation

## Escalation Triggers

**Stop and request human review if**:
- Acceptance criteria unclear or contradictory
- Technical approach blocked by external dependency
- Test failures unrelated to current changes
- Security implications beyond task scope
- Estimated hours exceeded by >50%

## Status Update Format

When updating roadmap status, use this comment format:

```
Task CS-LR-XXX: [Status]
Completed: [timestamp]
Acceptance Criteria: X/Y met
Blockers: [None | Description]
Next Action: [Next task ID | Human review required]
```

## Checkpoint Gates

**Phase 1 Checkpoint** (after CS-LR-014):
- Human reviews all P0 security patches
- Runtime stability verified (`npm run dev` boots cleanly)
- Payment/subscription pricing verified against spec

**Phase 2 Checkpoint** (after CS-LR-026):
- Full wizard flow manual QA
- Report generation visual review
- Template accuracy validation

**Phase 3 Checkpoint** (after CS-LR-029):
- Role-based feature matrix review
- Educational content legal review
- Team management UX validation

**Phase 4 Checkpoint** (before production):
- Full E2E test suite passing
- Load testing results reviewed
- Security audit sign-off
- Launch runbook dry-run

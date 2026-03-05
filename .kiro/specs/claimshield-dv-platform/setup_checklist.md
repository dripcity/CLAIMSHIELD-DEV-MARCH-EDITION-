# ClaimShield DV - Kiro Setup Checklist

Complete this checklist in order. Estimated time: 2-3 hours.

## Phase 1: Environment Preparation (30 mins)

- [ ] **Install Kiro IDE** from https://kiro.dev/downloads/
- [ ] **Login** to Kiro (GitHub/Google/AWS Builder ID)
- [ ] **Allow shell integration** when prompted
- [ ] **Navigate to project**: `cd ~/Documents/CLAIMSHIELD\ DEV\ \(MARCH\ EDITION\)`
- [ ] **Create execution branch**: `git checkout -b kiro-autonomous-execution`
- [ ] **Verify .env.local exists** with all required keys populated

## Phase 2: Directory Structure (15 mins)

Run these commands from project root:

```bash
# Create Kiro directory structure
mkdir -p .kiro/{steering,specs,hooks,context}
mkdir -p .kiro/specs/{phase1,phase2,phase3,phase4}

# Copy roadmap and reports
cp /path/to/CLAIMSHIELD_DV_TASK_ROADMAP.json .kiro/context/
cp /path/to/CLAIMSHIELD_DV_COMPREHENSIVE_LAUNCH_READINESS_REPORT.md .kiro/context/
cp /path/to/CLAIMSHIELD_DV_NEXT_24_HOURS_QUICKSTART.md .kiro/context/
```

Verification:
```bash
ls -la .kiro/context/
# Should show: CLAIMSHIELD_DV_TASK_ROADMAP.json, COMPREHENSIVE..., NEXT_24_HOURS...
```

- [ ] **Directories created**
- [ ] **Documents copied to .kiro/context/**

## Phase 3: Steering Files (45 mins)

### A. Generate Foundation Files

- [ ] Open Kiro IDE: `kiro .` (from project root)
- [ ] Click **Kiro icon** in left sidebar
- [ ] Under **Agent Steering**, click **Generate Steering Docs**
- [ ] Verify creation of: `product.md`, `tech.md`, `structure.md` in `.kiro/steering/`

### B. Create Custom Steering Files

Copy these from the artifacts I provided:

- [ ] Create `.kiro/steering/security-requirements.md` (from artifact)
- [ ] Create `.kiro/steering/claimshield-conventions.md` (from artifact)
- [ ] Create `.kiro/steering/task-execution-protocol.md` (from artifact)
- [ ] Create `.kiro/steering/pricing-requirements.md` (from artifact)

Verification:
```bash
ls -la .kiro/steering/
# Should show: product.md, tech.md, structure.md, security-requirements.md, 
# claimshield-conventions.md, task-execution-protocol.md, pricing-requirements.md
```

### C. Verify Steering Loaded

- [ ] In Kiro sidebar, expand **Agent Steering**
- [ ] Confirm all 7 steering files appear
- [x] Check **Always Included**: `claimshield-conventions.md`, `product.md`, `tech.md`, `structure.md`
- [x] Check **Auto**: `security-requirements.md`, `task-execution-protocol.md`, `pricing-requirements.md`

## Phase 4: Agent Hooks (30 mins)

Create these hook files:

### A. Pre-Commit Quality Gate

Create `.kiro/hooks/pre-commit-quality.kiro.hook`:

```json
{
  "enabled": true,
  "name": "Pre-Commit Quality Gate",
  "description": "Run lint and build before allowing commits",
  "when": {
    "type": "beforeCommit"
  },
  "action": {
    "type": "shellCommand",
    "command": "npm run lint && npm run build",
    "onFailure": "block"
  }
}
```

- [ ] **File created**

### B. API Route Testing Hook

Create `.kiro/hooks/test-api-routes.kiro.hook`:

```json
{
  "enabled": true,
  "name": "Test API Routes on Save",
  "description": "Run integration tests when API routes change",
  "when": {
    "type": "fileEdited",
    "patterns": ["app/api/**/route.ts"]
  },
  "action": {
    "type": "agentPrompt",
    "prompt": "Run integration tests for the modified API route. Verify:\n1. Authorization checks work correctly\n2. Input validation rejects invalid data\n3. Success cases return expected responses\n\nReport test results."
  }
}
```

- [ ] **File created**

### C. Security Review Hook

Create `.kiro/hooks/security-review.kiro.hook`:

```json
{
  "enabled": true,
  "name": "Security Review for Auth Routes",
  "description": "Trigger security checklist for authorization-related changes",
  "when": {
    "type": "fileEdited",
    "patterns": [
      "app/api/appraisals/**/route.ts",
      "app/api/comparables/**/route.ts",
      "app/api/documents/**/route.ts",
      "lib/utils/auth.ts"
    ]
  },
  "action": {
    "type": "agentPrompt",
    "prompt": "Review this file against security requirements from #security-requirements steering file.\n\nVerify:\n- [ ] Authorization check present before data access\n- [ ] No mass assignment vulnerabilities\n- [ ] Input validation with Zod schema\n- [ ] Error messages don't leak data\n\nReport findings and any violations."
  }
}
```

- [ ] **File created**

### D. Roadmap Status Update Hook

Create `.kiro/hooks/update-roadmap-status.kiro.hook`:

```json
{
  "enabled": false,
  "name": "Update Roadmap Status",
  "description": "Manually update task status in roadmap JSON. Use /update-roadmap-status",
  "when": {
    "type": "manual"
  },
  "action": {
    "type": "agentPrompt",
    "prompt": "Update the task roadmap JSON:\n1. Ask me for the task ID and new status\n2. Update .kiro/context/CLAIMSHIELD_DV_TASK_ROADMAP.json\n3. Add completion timestamp\n4. Commit with message 'chore: mark [task-id] as [status]'"
  }
}
```

- [ ] **File created**

### E. Verify Hooks Loaded

- [ ] Restart Kiro IDE
- [ ] In Kiro sidebar, expand **Agent Hooks**
- [ ] Confirm all 4 hooks appear
- [ ] Verify enabled status matches expectations

## Phase 5: Model Configuration (10 mins)

- [ ] Open Kiro Settings (Cmd/Ctrl + ,)
- [ ] Search "Model"
- [ ] Set **Default Model** to: **Claude Sonnet 4.6**
- [ ] Enable **Model Selection in Chat** (optional, for cost-conscious task switching)

## Phase 6: MCP Servers (Optional, 15 mins)

### Web Search (Recommended)

- [ ] Open Command Palette (Cmd/Ctrl + Shift + P)
- [ ] Type: "Kiro: Configure MCP Servers"
- [ ] Add web search configuration (if you have Brave API key)

### Database Inspection (Optional)

- [ ] Add Postgres MCP config (if needed for schema work)

## Phase 7: Validation (15 mins)

### Test Steering File Loading

In Kiro chat, type:
```
#security-requirements
```

- [ ] **Steering file loads** (you'll see content in context)

### Test Hook Triggering

1. Edit any file in `app/api/appraisals/`
2. Save the file

- [ ] **Security review hook triggers** (check Kiro agent activity)

### Test Slash Command

In Kiro chat, type:
```
/
```

- [ ] **Slash commands appear** (should include manual hooks and steering files)

### Load Roadmap

In Kiro chat, type:
```
#file:.kiro/context/CLAIMSHIELD_DV_TASK_ROADMAP.json
```

- [ ] **Roadmap JSON loads** successfully

## Phase 8: Day 1 Kickoff (Ready!)

You're ready to execute. Run this in Kiro chat:

```
#file:.kiro/context/NEXT_24_HOURS_QUICKSTART.md
#file:.kiro/context/CLAIMSHIELD_DV_TASK_ROADMAP.json

I'm ready to begin autonomous execution of the ClaimShield DV roadmap.

Day 1 Objective: Complete CS-LR-001 through CS-LR-019 (first 24 hours).

Follow the task execution protocol for each task:
1. Load task details from roadmap
2. Verify dependencies complete
3. Implement per technical approach
4. Validate against acceptance criteria
5. Report status

Begin with CS-LR-001: Resolve Clerk/React runtime incompatibilities.
```

## Checkpoint Verification

After first task (CS-LR-001) completes:

- [ ] **App boots** (`npm run dev` runs without errors)
- [ ] **Root route accessible** (no internal server error)
- [ ] **Kiro marked task complete** in roadmap

## Troubleshooting

If something isn't working:

1. **Steering files not loading**:
   - Check frontmatter YAML syntax
   - Restart Kiro IDE
   - Verify file permissions

2. **Hooks not triggering**:
   - Check pattern matching in hook definition
   - Test manually: `/hook-name`
   - Verify enabled: true

3. **Context window exceeded**:
   - Remove verbose context files
   - Keep only current task + dependencies

4. **Model errors**:
   - Verify API keys in settings
   - Switch model if needed
   - Check rate limits

## Success Criteria

Setup is complete when:

- [ ] All steering files visible in Kiro sidebar
- [ ] All hooks visible in Agent Hooks panel
- [ ] Roadmap JSON loads successfully in chat
- [ ] First task kickoff prompt executes without error
- [ ] Kiro begins implementing CS-LR-001

---

**Estimated Total Time**: 2-3 hours  
**Next Step**: Execute Day 1 kickoff prompt and monitor first task  
**Support**: Reference main setup guide for detailed troubleshooting

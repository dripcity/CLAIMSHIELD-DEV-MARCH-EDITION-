# ClaimShield DV - Antigravity Custom Rules & Configuration

## Project-Specific Development Guidelines for Autonomous Agent Workflows

---

## 🎯 CRITICAL MISSION PARAMETERS

### Project Identity

- **Project Name**: ClaimShield DV (Diminished Value Claims Management Platform)
- **Development Model**: 24/7 Autonomous Agent-Driven Development
- **Human Oversight**: 12-hour shift rotation with Human-in-the-Loop checkpoints
- **Launch Target**: Full production-ready application (NOT just MVP)
- **Quality Standard**: Enterprise-grade, monetization-ready software

### Master Reference Documents

All development MUST align with:

1. **ClaimShield DV - Master Appraisal Schema & Auto-Generation Logic**
2. **claimshield_greenfield.md**
3. **requirements.md**

These documents are the source of truth. When in conflict, spec docs override code.

---

## 🚫 ABSOLUTE PROHIBITIONS

### Security & Secrets

- **NEVER** commit API keys, credentials, or secrets to the repository
- **NEVER** hardcode sensitive data in any file
- **ALWAYS** use environment variables for configuration
- **ALWAYS** use .env.example templates with placeholder values
- **IMMEDIATELY FLAG** any discovered hardcoded credentials for urgent removal

### Code Quality Red Lines

- **NO** commented-out code blocks (delete or document why preserved)
- **NO** console.log statements in production code (use proper logging)
- **NO** placeholder/dummy data in production code paths
- **NO** "TODO" comments without a linked task ID
- **NO** copy-pasted code without refactoring to shared utilities

### Development Shortcuts Banned

- **NO** workarounds that bypass proper implementation
- **NO** "temporary" fixes without immediate remediation plan
- **NO** skipping error handling because "it probably won't happen"
- **NO** skipping validation because "the frontend handles it"
- **NO** using deprecated APIs/packages without migration plan

---

## 📋 MANDATORY DEVELOPMENT STANDARDS

### Code Structure & Organization

#### File Naming Conventions

- **React Components**: PascalCase (e.g., `AppraisalForm.tsx`)
- **Utility Functions**: camelCase (e.g., `calculateDiminishedValue.ts`)
- **Constants**: UPPER_SNAKE_CASE files (e.g., `API_ENDPOINTS.ts`)
- **Test Files**: Match source file with `.test` or `.spec` suffix
- **Type Definitions**: Descriptive names in `types/` directory

#### Directory Structure Compliance

```text
src/
├── components/          # React components only
├── pages/              # Route-level page components
├── services/           # API calls & external integrations
├── utils/              # Pure utility functions
├── hooks/              # Custom React hooks
├── types/              # TypeScript type definitions
├── constants/          # App-wide constants
├── config/             # Configuration files
├── assets/             # Images, fonts, static files
└── tests/              # Test suites & fixtures
```

**RULE**: If you create a file, it MUST go in the appropriate directory. If unsure, flag for human decision.

### Code Quality Standards

#### TypeScript Requirements

- **STRICT MODE ENABLED**: No implicit any, proper null checks
- **Explicit Return Types**: All functions must declare return types
- **Interface Over Type**: Use interfaces for object shapes
- **Enum for Constants**: Use enums for related constant groups
- **Generic Type Safety**: Leverage generics to avoid type assertions

#### Error Handling Requirements

```typescript
// ❌ BANNED - Silent failure
try {
  await riskyOperation();
} catch {}

// ✅ REQUIRED - Proper error handling
try {
  await riskyOperation();
} catch (error) {
  logger.error("Operation failed", { error, context });
  throw new ApplicationError("User-friendly message", error);
}
```

Every try-catch MUST:

1. Log the error with context
2. Either handle gracefully OR re-throw with context
3. Never silently swallow errors

#### Function Complexity Limits

- **Max Lines**: 50 lines per function (if exceeded, refactor)
- **Max Parameters**: 5 parameters (use object params if more needed)
- **Single Responsibility**: Each function does ONE thing well
- **Pure Functions Preferred**: Avoid side effects when possible

#### Comment & Documentation Rules

- **JSDoc Comments**: Required for all exported functions/components
- **Inline Comments**: Only when logic is non-obvious (not for obvious code)
- **TODO Comments**: Must include assignee and task ID
  ```typescript
  // TODO(TASK-123): Implement rate limiting - @developer-name
  ```

### Testing Requirements

#### Test Coverage Mandates

- **Unit Tests**: Required for all utility functions and business logic
- **Integration Tests**: Required for API endpoints
- **E2E Tests**: Required for critical user journeys
- **Minimum Coverage**: 80% for core business logic

#### Test Structure Standard

```typescript
describe("Feature/Component Name", () => {
  describe("when condition X", () => {
    it("should produce outcome Y", () => {
      // Arrange
      const input = setupTestData();

      // Act
      const result = functionUnderTest(input);

      // Assert
      expect(result).toBe(expected);
    });
  });
});
```

#### Browser Automation Testing

- **Use Antigravity Browser Agent**: For all UI testing workflows
- **Capture Screenshots**: For visual regression detection
- **Record Sessions**: For complex multi-step flows
- **Validate Accessibility**: Check for a11y violations in tests

### Database & Data Layer Rules

#### Query Optimization

- **ALWAYS** use parameterized queries (prevent SQL injection)
- **ALWAYS** index foreign keys and frequently queried fields
- **ALWAYS** use connection pooling
- **NEVER** fetch all records without pagination
- **NEVER** perform N+1 queries (use eager loading/joins)

#### Schema Changes

- **NEVER** modify production schema without migration
- **ALWAYS** write reversible migrations (up & down)
- **ALWAYS** test migrations on production-like data volume
- **ALWAYS** backup before running migrations in any environment

#### Data Validation

- **Backend Validation**: Required on ALL input, regardless of frontend validation
- **Type Checking**: Use schema validation libraries (Zod, Yup, Joi)
- **Sanitization**: Escape/sanitize user input before storage/display

### API & Integration Standards

#### Endpoint Design

- **RESTful Conventions**: Use standard HTTP methods correctly (GET/POST/PUT/DELETE)
- **Version Endpoints**: `/api/v1/` prefix for future-proofing
- **Consistent Responses**: Standardized response format
  ```json
  {
    "success": true,
    "data": {},
    "error": null,
    "meta": { "timestamp": "...", "requestId": "..." }
  }
  ```

#### Error Response Format

```json
{
  "success": false,
  "data": null,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "User-friendly error message",
    "details": [{ "field": "email", "message": "Invalid email format" }]
  },
  "meta": { "timestamp": "...", "requestId": "..." }
}
```

#### Rate Limiting & Throttling

- **ALWAYS** implement rate limiting on public endpoints
- **ALWAYS** implement retry logic with exponential backoff for external APIs
- **ALWAYS** handle API downtime gracefully (fallback/cache)

### Performance Standards

#### Frontend Performance

- **Bundle Size**: Keep total JS bundle < 500KB (gzipped)
- **Code Splitting**: Dynamic imports for routes and heavy components
- **Image Optimization**: Lazy load images, use modern formats (WebP)
- **Memoization**: Use React.memo, useMemo, useCallback appropriately

#### Backend Performance

- **Response Time**: < 200ms for CRUD operations, < 1s for complex calculations
- **Database Queries**: < 50ms for indexed queries
- **Caching Strategy**: Redis/memory cache for frequently accessed data
- **Pagination**: Implement pagination for all list endpoints

### Accessibility Requirements

- **WCAG 2.1 AA Compliance**: Minimum standard for all UI
- **Semantic HTML**: Use correct HTML elements for content structure
- **Keyboard Navigation**: All interactive elements accessible via keyboard
- **Screen Reader Support**: ARIA labels where needed
- **Color Contrast**: Minimum 4.5:1 ratio for normal text

---

## 🤖 AGENT-SPECIFIC WORKFLOW RULES

### Task Execution Protocol

#### Before Starting Any Task

1. **Read Task Description Fully**: Understand acceptance criteria
2. **Check Dependencies**: Verify prerequisite tasks are complete
3. **Review Relevant Spec Docs**: Cross-reference against master documents
4. **Plan Implementation**: Generate implementation plan artifact
5. **Request Human Review**: For complex/ambiguous tasks, pause for approval

#### During Task Execution

1. **Commit Frequently**: Small, atomic commits with clear messages
2. **Write Tests First**: TDD approach when applicable
3. **Document As You Go**: Update relevant documentation immediately
4. **Use Browser Agent**: Test UI changes in real browser automatically
5. **Log Progress**: Update task status with detailed progress notes

#### Before Marking Task Complete

1. **Run Full Test Suite**: Ensure no regressions
2. **Browser Validation**: Use Antigravity browser agent to verify functionality
3. **Code Review Checklist**: Self-review against quality standards
4. **Update Documentation**: README, API docs, inline comments
5. **Create Validation Artifact**: Screenshots/videos showing working feature

### Commit Message Standards

```text
<type>(<scope>): <subject>

<body>

<footer>
```

**Types**: feat | fix | docs | style | refactor | test | chore
**Example**:

```text
feat(appraisal): implement auto-calculation for diminished value

- Added calculateDiminishedValue utility function
- Integrated with AppraisalForm component
- Added unit tests covering edge cases
- Validated calculation accuracy against manual examples

Closes TASK-145
```

### Parallelization Strategy

#### Safe for Parallel Execution

- Frontend component development (different components)
- Backend endpoint development (different routes)
- Test suite development
- Documentation updates
- Database migration development

#### Requires Sequential Execution

- Database schema changes
- Breaking API changes
- Authentication/authorization changes
- Shared utility function modifications

#### Human Synchronization Points

- Major architectural decisions
- Security-related changes
- Payment processing implementation
- External service integration selection

---

## 🎨 PLATFORM-SPECIFIC OPTIMIZATIONS

### Firebase/GCP Free Tier Optimization

- **Minimize Read Operations**: Use caching aggressively
- **Batch Writes**: Combine multiple database writes when possible
- **Cloud Functions Cold Start**: Keep functions warm with scheduled pings
- **Storage Optimization**: Compress images, use CDN for static assets

### Serverless Architecture Best Practices

- **Stateless Functions**: No in-memory state persistence
- **Environment Variables**: Use for all configuration
- **Connection Pooling**: Reuse database connections across invocations
- **Lightweight Dependencies**: Minimize package size for faster cold starts

### Cost Monitoring

- **Log All Expensive Operations**: Track API calls, database queries, storage usage
- **Set Budget Alerts**: Monitor spending in real-time
- **Optimize Before Scale**: Fix inefficiencies before they cost money

---

## 🔍 CODE REVIEW CHECKLIST

### Before Requesting Human Review

Every agent must verify:

- [ ] All tests pass
- [ ] No console errors or warnings
- [ ] Code follows style guide
- [ ] No hardcoded values (use constants/env vars)
- [ ] Error handling implemented
- [ ] Edge cases considered and tested
- [ ] Documentation updated
- [ ] No security vulnerabilities introduced
- [ ] Performance impact assessed
- [ ] Accessibility standards met (for UI changes)
- [ ] Mobile responsiveness verified (for UI changes)
- [ ] Browser compatibility checked (for UI changes)

---

## 🚨 ESCALATION TRIGGERS

### Immediate Human Intervention Required

Agent must PAUSE and request human review when:

- Security vulnerability discovered in existing code
- Breaking change required that affects multiple components
- Spec documents conflict or contain ambiguity
- External API/service is down or changed unexpectedly
- Cost implications exceed expected budget
- Legal/compliance concern identified
- Task cannot be completed due to technical limitation
- Multiple implementation approaches exist with trade-offs

### Flag as High Priority

- User-facing bugs that prevent core functionality
- Data integrity issues
- Payment processing problems
- Authentication/authorization failures
- Performance degradation > 20%

---

## 📊 PROGRESS REPORTING STANDARDS

### Daily Summary Report (Auto-generated)

Each agent should contribute to a daily summary:

- Tasks completed (with IDs)
- Tasks in progress (with % completion)
- Blockers encountered
- Tests added/passed
- Lines of code changed
- Performance improvements/regressions
- Questions requiring human decision

### Artifact Generation Requirements

For significant work, agents must produce:

- **Implementation Plan**: Before starting complex tasks
- **Test Report**: After test suite execution
- **Browser Session Recording**: For UI work validation
- **Performance Benchmark**: For optimization tasks
- **API Documentation**: For new/modified endpoints

---

## 🛠️ TROUBLESHOOTING & DEBUGGING PROTOCOL

### When Encountering Errors

1. **Reproduce the Error**: Confirm it's consistent
2. **Check Logs**: Review all relevant log files
3. **Isolate the Cause**: Use binary search to narrow down
4. **Review Recent Changes**: Check git blame/history
5. **Test Fixes**: Verify solution doesn't cause regressions
6. **Document Resolution**: Add to troubleshooting guide

### When Stuck

1. **Try Alternative Approaches**: Explore 2-3 different solutions
2. **Search Documentation**: Check official docs for APIs/frameworks
3. **Review Similar Code**: Look for patterns in existing codebase
4. **Create Minimal Reproduction**: Isolate the problem
5. **Escalate to Human**: After exhausting automated solutions

---

## 📝 DOCUMENTATION REQUIREMENTS

### Code Documentation

- **README.md**: Comprehensive project overview, setup, and usage
- **API.md**: Complete API endpoint documentation
- **ARCHITECTURE.md**: System design and data flow diagrams
- **CONTRIBUTING.md**: Guidelines for future developers
- **CHANGELOG.md**: Version history and notable changes

### Inline Documentation

- Function purpose and behavior
- Complex algorithm explanations
- Business logic rationale
- Performance considerations
- Known limitations or edge cases

### User Documentation

- User guides for key features
- Admin panel documentation
- Troubleshooting guides
- FAQ section

---

## 🔄 CONTINUOUS IMPROVEMENT

### Code Refactoring Guidelines

- **Boy Scout Rule**: Leave code better than you found it
- **Refactor as You Go**: Don't accumulate technical debt
- **Test Before Refactoring**: Ensure existing tests pass
- **Refactor, Then Extend**: Clean up before adding features

### Performance Monitoring

- Profile code regularly to identify bottlenecks
- Monitor real-world usage patterns
- Optimize hot paths first
- Measure impact of optimizations

### Learning & Adaptation

- Update rules based on patterns discovered
- Share learnings across agent sessions
- Build knowledge base of project-specific solutions

---

## 🎯 SUCCESS METRICS

### Quality Metrics

- Test coverage > 80%
- Zero P0 security vulnerabilities
- Performance benchmarks met
- Accessibility compliance verified

### Velocity Metrics

- Tasks completed per day
- Average task completion time
- Blocker resolution time
- Regression rate

### Code Health Metrics

- Code duplication < 5%
- Function complexity scores
- Documentation coverage
- Dependency freshness

---

## ⚙️ AGENT CONFIGURATION RECOMMENDATIONS

### Antigravity Settings

- **Planning Mode**: ENABLED (for complex tasks requiring multi-step planning)
- **Terminal Policy**: AUTO (with safeguards for destructive commands)
- **Review Policy**: AGENT DECIDES (pauses for major changes, proceeds for routine tasks)
- **Browser Automation**: ENABLED (critical for UI testing)

### Model Selection

- **Primary Model**: Gemini 3 Pro (for complex reasoning and planning)
- **Fast Execution**: Gemini 3 Flash (for simple, well-defined tasks)
- **Alternative**: Claude Sonnet 4.5 (for natural language processing tasks)

### Rate Limit Management

- Prioritize critical path tasks during high-usage periods
- Schedule non-urgent tasks during off-peak hours
- Use fast mode for simple refactoring to conserve quota

---

## 🏁 FINAL NOTES FOR AGENTS

1. **Quality Over Speed**: A correct, well-tested feature is better than a rushed, broken one
2. **Communicate Proactively**: Flag issues early, don't wait until deadlines
3. **Respect the Spec**: Implement what's documented, not what you think is better (unless discussing with humans first)
4. **Think About Scale**: Write code that works for 1 user AND 10,000 users
5. **Security is Non-Negotiable**: When in doubt, be more secure, not less
6. **Document Your Decisions**: Future developers (human and AI) will thank you

---

## 📌 QUICK REFERENCE

### Priority Definitions

- **P0**: Launch blocker - immediate attention required
- **P1**: Revenue risk - complete before scaling
- **P2**: Technical debt - defer to post-launch

### Status Labels

- **Blocked**: Cannot proceed due to external dependency
- **In Progress**: Actively being worked on
- **Review**: Awaiting human review
- **Testing**: Undergoing validation
- **Complete**: Fully implemented and verified

### Common Commands

```bash
# Run tests
npm test

# Start development server
npm run dev

# Build for production
npm run build

# Run linter
npm run lint

# Format code
npm run format
```

---

**These rules are living guidelines. When you discover better practices during development, propose updates with clear rationale.**

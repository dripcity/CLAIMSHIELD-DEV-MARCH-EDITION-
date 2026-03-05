# Runtime Dependency Issues

## Problem (from Comprehensive Report)

**P0-01**: App boot/runtime dependency incompatibility (Clerk/React)

**Evidence**:
- `app/api/appraisals/bulk-download/route.ts` imports `jszip`, but not declared in package.json
- Clerk internal import/export mismatches (multiple `@clerk/backend/internal` export errors)
- React version mismatch at runtime (`react` unresolved vs `react-dom 19.2.4`)
- Root route renders internal server error

## Required Fix

Re-resolve lockfile, align Clerk+React matrix, verify with clean install and smoke build.

## Known-Good Versions

- `next`: 15.x
- `react`: 19.x  
- `react-dom`: 19.x
- `@clerk/nextjs`: (latest compatible with React 19)

## Validation

- `npm run dev` starts without import/export errors
- Root route renders without internal server error
- React and react-dom versions are pinned and matched

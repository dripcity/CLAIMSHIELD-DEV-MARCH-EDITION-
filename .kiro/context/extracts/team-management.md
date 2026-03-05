# Team Management Requirements

## Current Status

`app/api/team/route.ts:18-20,68-73` - stub implementation only.

## Required Functionality

Attorneys can:
- Invite team members (paralegals)
- List team members
- Remove team members
- Scope permissions by role

## Database Schema Addition
```typescript
export const teamMembers = pgTable('team_members', {
  id: uuid('id').defaultRandom().primaryKey(),
  attorneyId: uuid('attorney_id').references(() => users.id),
  memberId: uuid('member_id').references(() => users.id),
  role: text('role').notNull(), // 'paralegal', 'admin'
  invitedAt: timestamp('invited_at').defaultNow(),
  acceptedAt: timestamp('accepted_at'),
});
```

## API Implementation
```typescript
// POST /api/team - Invite member
export async function POST(request: Request) {
  const { userId } = await auth();
  const { email, role } = await request.json();
  
  // Verify user is attorney
  const user = await getUser(userId);
  if (user.role !== 'attorney') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }
  
  // Create invitation
  // Send invite email
}

// GET /api/team - List team
// DELETE /api/team/[memberId] - Remove member
```

## UI Component
```typescript
// app/(dashboard)/team/page.tsx
export default function TeamPage() {
  return (
    <div>
      <TeamMembersList />
      <InviteTeamMemberForm />
    </div>
  );
}
```

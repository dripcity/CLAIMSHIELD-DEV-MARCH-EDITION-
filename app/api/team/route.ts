import { NextRequest, NextResponse } from 'next/server';
import { requireRolePermission } from '@/lib/utils/auth';

/**
 * Team Management API
 * Only accessible to attorneys
 */

// GET - List team members
export async function GET(req: NextRequest) {
  try {
    // Enforce role-based access control
    const user = await requireRolePermission(
      'canManageTeam',
      'Only attorneys can manage team members'
    );

    // TODO: Fetch team members from database
    // For now, return empty array
    const teamMembers: any[] = [];

    return NextResponse.json({
      teamMembers,
      totalCount: teamMembers.length,
    });
  } catch (error) {
    if (error instanceof Error) {
      if (error.message.includes('Forbidden') || error.message.includes('attorneys')) {
        return NextResponse.json(
          { error: error.message },
          { status: 403 }
        );
      }
      if (error.message === 'Unauthorized') {
        return NextResponse.json(
          { error: 'Authentication required' },
          { status: 401 }
        );
      }
    }
    
    console.error('Team list error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch team members' },
      { status: 500 }
    );
  }
}

// POST - Add team member
export async function POST(req: NextRequest) {
  try {
    // Enforce role-based access control
    const user = await requireRolePermission(
      'canManageTeam',
      'Only attorneys can add team members'
    );

    const { email, name, role } = await req.json();

    if (!email || !name) {
      return NextResponse.json(
        { error: 'Email and name are required' },
        { status: 400 }
      );
    }

    // TODO: Implement team member invitation
    // This would include:
    // 1. Create invitation record in database
    // 2. Send invitation email
    // 3. Return invitation details

    return NextResponse.json({
      message: 'Team member invitation not yet implemented',
      email,
      name,
      role: role || 'paralegal',
    });
  } catch (error) {
    if (error instanceof Error) {
      if (error.message.includes('Forbidden') || error.message.includes('attorneys')) {
        return NextResponse.json(
          { error: error.message },
          { status: 403 }
        );
      }
      if (error.message === 'Unauthorized') {
        return NextResponse.json(
          { error: 'Authentication required' },
          { status: 401 }
        );
      }
    }
    
    console.error('Team member add error:', error);
    return NextResponse.json(
      { error: 'Failed to add team member' },
      { status: 500 }
    );
  }
}

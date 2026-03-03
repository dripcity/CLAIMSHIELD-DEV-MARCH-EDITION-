import { requireAuth } from '@/lib/utils/auth';
import { redirect } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Users, UserPlus, Mail, Shield } from 'lucide-react';

export default async function TeamPage() {
  let user;
  
  try {
    user = await requireAuth();
  } catch (error) {
    redirect('/sign-in');
  }

  // Only attorneys can access team management
  if (user.role !== 'attorney') {
    redirect('/dashboard');
  }

  // TODO: Fetch team members from database
  // For now, showing placeholder UI
  const teamMembers: any[] = [];

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Team Management</h1>
          <p className="text-gray-500 mt-2">Manage your paralegal and support staff accounts</p>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700">
          <UserPlus className="h-4 w-4 mr-2" />
          Add Team Member
        </Button>
      </div>

      {/* Team Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">Total Team Members</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900">{teamMembers.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">Active Members</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">
              {teamMembers.filter(m => m.status === 'active').length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">Pending Invites</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-amber-600">
              {teamMembers.filter(m => m.status === 'pending').length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Team Members List */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5 text-blue-600" />
            <CardTitle>Team Members</CardTitle>
          </div>
          <CardDescription>
            Manage access and permissions for your team
          </CardDescription>
        </CardHeader>
        <CardContent>
          {teamMembers.length === 0 ? (
            <div className="text-center py-12">
              <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No team members yet</h3>
              <p className="text-gray-500 mb-6">
                Add paralegal or support staff to collaborate on appraisals
              </p>
              <Button className="bg-blue-600 hover:bg-blue-700">
                <UserPlus className="h-4 w-4 mr-2" />
                Invite Team Member
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {teamMembers.map((member) => (
                <div
                  key={member.id}
                  className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
                >
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                      <span className="text-blue-600 font-semibold">
                        {member.name.charAt(0)}
                      </span>
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-gray-900">{member.name}</p>
                        <Badge variant={member.status === 'active' ? 'default' : 'secondary'}>
                          {member.status}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <Mail className="h-3 w-3 text-gray-400" />
                        <p className="text-sm text-gray-500">{member.email}</p>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm">
                      Edit
                    </Button>
                    <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700">
                      Remove
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Permissions Info */}
      <Card className="border-blue-200 bg-blue-50">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-blue-600" />
            <CardTitle>Team Permissions</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="text-sm text-blue-900">
            <p className="font-medium mb-2">Team members can:</p>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>View all appraisals created by the attorney</li>
              <li>Create new appraisals on behalf of the attorney</li>
              <li>Edit and update existing appraisals</li>
              <li>Generate and download PDF reports</li>
              <li>Access document templates</li>
            </ul>
          </div>
          <div className="text-sm text-blue-900 mt-4">
            <p className="font-medium mb-2">Team members cannot:</p>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>Delete appraisals</li>
              <li>Manage billing or subscription</li>
              <li>Add or remove other team members</li>
              <li>Change account settings</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

import { requireAuth } from '@/lib/utils/auth';
import { redirect } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { User, CreditCard, FileText, Shield } from 'lucide-react';

export default async function SettingsPage() {
  let user;
  
  try {
    user = await requireAuth();
  } catch (error) {
    redirect('/sign-in');
  }

  // Format role for display
  const roleDisplay = {
    individual: 'Individual',
    appraiser: 'Professional Appraiser',
    attorney: 'Attorney',
    body_shop: 'Body Shop',
    admin: 'Administrator',
  }[user.role || 'individual'];

  // Format subscription status
  const subscriptionDisplay = {
    active: 'Active',
    past_due: 'Past Due',
    canceled: 'Canceled',
    trialing: 'Trial',
  }[user.subscriptionStatus || ''] || 'None';

  const hasActiveSubscription = user.subscriptionStatus === 'active';
  const reportsRemaining = user.reportsRemaining || 0;
  const isBodyShop = user.role === 'body_shop';

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-500 mt-2">Manage your account and subscription</p>
      </div>

      {/* Profile Information */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <User className="h-5 w-5 text-blue-600" />
            <CardTitle>Profile Information</CardTitle>
          </div>
          <CardDescription>Your account details and role</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700">Email</label>
              <p className="text-gray-900 mt-1">{user.email}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Role</label>
              <div className="mt-1">
                <Badge variant="secondary" className="text-sm">
                  {roleDisplay}
                </Badge>
              </div>
            </div>
          </div>
          <Separator />
          <div>
            <label className="text-sm font-medium text-gray-700">Account ID</label>
            <p className="text-gray-500 text-sm mt-1 font-mono">{user.id}</p>
          </div>
        </CardContent>
      </Card>

      {/* Subscription Status */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <CreditCard className="h-5 w-5 text-blue-600" />
            <CardTitle>Subscription</CardTitle>
          </div>
          <CardDescription>Your current plan and billing information</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700">Status</label>
              <div className="mt-1">
                <Badge 
                  variant={hasActiveSubscription ? 'default' : 'secondary'}
                  className={hasActiveSubscription ? 'bg-green-600' : ''}
                >
                  {subscriptionDisplay}
                </Badge>
              </div>
            </div>
            {user.stripeCustomerId && (
              <div>
                <label className="text-sm font-medium text-gray-700">Customer ID</label>
                <p className="text-gray-500 text-sm mt-1 font-mono truncate">
                  {user.stripeCustomerId}
                </p>
              </div>
            )}
          </div>

          {hasActiveSubscription && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <Shield className="h-5 w-5 text-green-600 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-green-900">
                    Unlimited Reports
                  </p>
                  <p className="text-sm text-green-700 mt-1">
                    You have unlimited access to generate appraisal reports
                  </p>
                </div>
              </div>
            </div>
          )}

          {!hasActiveSubscription && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <FileText className="h-5 w-5 text-blue-600 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-blue-900">
                    Pay Per Report
                  </p>
                  <p className="text-sm text-blue-700 mt-1">
                    You currently have <span className="font-semibold">{reportsRemaining}</span> report{reportsRemaining !== 1 ? 's' : ''} remaining
                  </p>
                </div>
              </div>
            </div>
          )}

          <Separator />

          <div className="flex flex-col sm:flex-row gap-3">
            {hasActiveSubscription && user.stripeCustomerId && (
              <form action="/api/checkout/portal" method="POST" className="flex-1">
                <input type="hidden" name="customerId" value={user.stripeCustomerId} />
                <Button type="submit" variant="outline" className="w-full">
                  Manage Subscription
                </Button>
              </form>
            )}
            
            {!hasActiveSubscription && (
              <form action="/api/checkout" method="POST" className="flex-1">
                <input type="hidden" name="mode" value="subscription" />
                <input type="hidden" name="userId" value={user.id} />
                <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700">
                  Upgrade to Subscription
                </Button>
              </form>
            )}

            <form action="/api/checkout" method="POST" className="flex-1">
              <input type="hidden" name="mode" value="payment" />
              <input type="hidden" name="userId" value={user.id} />
              <Button type="submit" variant="outline" className="w-full">
                Buy More Reports
              </Button>
            </form>
          </div>
        </CardContent>
      </Card>

      {/* Usage Tracking */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-blue-600" />
            <CardTitle>Usage</CardTitle>
          </div>
          <CardDescription>Track your report generation</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {hasActiveSubscription ? (
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <p className="text-sm font-medium text-gray-900">Reports Generated</p>
                  <p className="text-xs text-gray-500 mt-1">Unlimited with your subscription</p>
                </div>
                <div className="text-2xl font-bold text-blue-600">∞</div>
              </div>
            ) : (
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <p className="text-sm font-medium text-gray-900">Reports Remaining</p>
                  <p className="text-xs text-gray-500 mt-1">Purchase more reports as needed</p>
                </div>
                <div className="text-2xl font-bold text-blue-600">{reportsRemaining}</div>
              </div>
            )}

            {reportsRemaining === 0 && !hasActiveSubscription && (
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                <p className="text-sm font-medium text-amber-900">No Reports Remaining</p>
                <p className="text-sm text-amber-700 mt-1">
                  Purchase individual reports or subscribe for unlimited access
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Account Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Account Actions</CardTitle>
          <CardDescription>Manage your account settings</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
            <div>
              <p className="text-sm font-medium text-gray-900">Account Created</p>
              <p className="text-xs text-gray-500 mt-1">
                {user.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                }) : 'N/A'}
              </p>
            </div>
          </div>
          
          <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
            <div>
              <p className="text-sm font-medium text-gray-900">Last Updated</p>
              <p className="text-xs text-gray-500 mt-1">
                {user.updatedAt ? new Date(user.updatedAt).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                }) : 'N/A'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* White-Label Options (Body Shop Only) */}
      {isBodyShop && (
        <Card className="border-purple-200 bg-purple-50">
          <CardHeader>
            <CardTitle>White-Label Options</CardTitle>
            <CardDescription>
              Customize reports with your shop branding
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-white border border-purple-200 rounded-lg p-4">
              <h4 className="text-sm font-medium text-gray-900 mb-3">Available Customizations</h4>
              <ul className="space-y-2 text-sm text-gray-700">
                <li className="flex items-start gap-2">
                  <span className="text-purple-600 mt-0.5">•</span>
                  <span>Add your shop logo to PDF reports</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-purple-600 mt-0.5">•</span>
                  <span>Customize report header with shop name and contact info</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-purple-600 mt-0.5">•</span>
                  <span>Include shop certifications and credentials</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-purple-600 mt-0.5">•</span>
                  <span>Custom footer with shop address and phone</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-purple-600 mt-0.5">•</span>
                  <span>Branded email templates for report delivery</span>
                </li>
              </ul>
            </div>

            <div className="bg-purple-100 border border-purple-300 rounded-lg p-4">
              <p className="text-sm text-purple-900">
                <strong>Coming Soon:</strong> White-label customization options will be available in a future update.
                Contact support to express interest in early access.
              </p>
            </div>

            <Button variant="outline" className="w-full" disabled>
              Configure White-Label Settings
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

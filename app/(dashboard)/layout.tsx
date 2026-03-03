import { currentUser } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { UserButton } from '@clerk/nextjs';
import { db } from '@/lib/db';
import { users } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { SkipNav } from '@/app/_components/SkipNav';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default async function DashboardLayout({ children }: DashboardLayoutProps) {
  const clerkUser = await currentUser();

  if (!clerkUser) {
    redirect('/sign-in');
  }

  // Get user role from database
  const [dbUser] = await db.select().from(users).where(eq(users.clerkId, clerkUser.id));
  const userRole = dbUser?.role || 'individual';
  const isAttorney = userRole === 'attorney';

  return (
    <div className="min-h-screen bg-gray-50">
      <SkipNav />
      <header className="bg-white border-b border-gray-200" role="banner">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0 flex items-center">
                <span className="text-xl font-bold text-blue-600">ClaimShield DV</span>
              </div>
              <nav className="hidden md:ml-10 md:flex md:space-x-8" aria-label="Main navigation">
                <a href="/dashboard" className="text-gray-900 hover:text-gray-700 px-3 py-2 rounded-md text-sm font-medium">
                  Dashboard
                </a>
                <a href="/dashboard/appraisals" className="text-gray-500 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium">
                  My Appraisals
                </a>
                {isAttorney && (
                  <a href="/team" className="text-gray-500 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium">
                    Team
                  </a>
                )}
                <a href="/settings" className="text-gray-500 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium">
                  Settings
                </a>
                <a href="/resources" className="text-gray-500 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium">
                  Resources
                </a>
                <a href="/support" className="text-gray-500 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium">
                  Support
                </a>
              </nav>
            </div>
            <div className="flex items-center">
              <button 
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium mr-4 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                aria-label="Create new appraisal"
              >
                New Appraisal
              </button>
              <UserButton />
            </div>
          </div>
        </div>
      </header>
      <main id="main-content" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8" role="main">
        {children}
      </main>
    </div>
  );
}

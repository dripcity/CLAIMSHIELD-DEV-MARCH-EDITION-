'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import { Card } from '@/components/ui/card';

type UserRole = 'individual' | 'appraiser' | 'attorney' | 'body_shop';

const roleOptions = [
  {
    value: 'individual',
    title: 'Vehicle Owner',
    description: 'I need to file a diminished value claim after an accident',
    icon: '🚗',
  },
  {
    value: 'appraiser',
    title: 'Professional Appraiser',
    description: 'I perform diminished value appraisals',
    icon: '📊',
  },
  {
    value: 'attorney',
    title: 'Attorney',
    description: 'I represent clients with DV claims',
    icon: '⚖️',
  },
  {
    value: 'body_shop',
    title: 'Body Shop',
    description: 'I repair vehicles and help with DV claims',
    icon: '🔧',
  },
];

export default function OnboardingPage() {
  const { user } = useUser();
  const router = useRouter();
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);
  const [saving, setSaving] = useState(false);

  const handleRoleSelect = async (role: UserRole) => {
    setSelectedRole(role);
    setSaving(true);

    try {
      await fetch('/api/webhooks/clerk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user?.id,
          role,
        }),
      });

      router.push('/dashboard');
    } catch (error) {
      console.error('Failed to save role:', error);
      setSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="text-center mb-12">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Welcome to ClaimShield DV
        </h1>
        <p className="text-gray-600">
          Let us know who you are so we can tailor your experience
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {roleOptions.map((role) => (
          <Card
            key={role.value}
            className={`cursor-pointer transition-all hover:shadow-lg ${
              selectedRole === role.value ? 'ring-2 ring-blue-600' : ''
            }`}
            onClick={() => handleRoleSelect(role.value as UserRole)}
          >
            <div className="p-6">
              <div className="text-4xl mb-4">{role.icon}</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                {role.title}
              </h3>
              <p className="text-gray-600">{role.description}</p>
            </div>
          </Card>
        ))}
      </div>

      {saving && (
        <div className="mt-8 text-center">
          <p className="text-blue-600">Saving your selection...</p>
        </div>
      )}
    </div>
  );
}

import { SignIn } from '@clerk/nextjs';

export default function SignInPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="w-full max-w-md p-8 bg-white rounded-lg shadow-sm">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900">ClaimShield DV</h1>
          <p className="text-gray-600 mt-2">Sign in to your account</p>
        </div>
        <SignIn />
      </div>
    </div>
  );
}

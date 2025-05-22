import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Terms of Service - BizList',
  description: 'Terms and conditions for using BizList services.',
};

export default function TermsPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Terms of Service</h1>
      <div className="prose max-w-none">
        <p className="mb-4">Last updated: {new Date().toLocaleDateString()}</p>
        
        <h2 className="text-2xl font-semibold mt-8 mb-4">1. Acceptance of Terms</h2>
        <p className="mb-4">
          By accessing and using BizList, you agree to be bound by these Terms of Service and all applicable 
          laws and regulations. If you do not agree with any of these terms, you are prohibited from using 
          or accessing this site.
        </p>

        <h2 className="text-2xl font-semibold mt-8 mb-4">2. Use License</h2>
        <p className="mb-4">
          Permission is granted to temporarily access the materials on BizList for personal, non-commercial 
          transitory viewing only. This is the grant of a license, not a transfer of title.
        </p>

        <h2 className="text-2xl font-semibold mt-8 mb-4">3. User Responsibilities</h2>
        <p className="mb-4">
          Users are responsible for maintaining the confidentiality of their account information and for all 
          activities that occur under their account. Users must provide accurate and complete information 
          when creating an account.
        </p>

        <h2 className="text-2xl font-semibold mt-8 mb-4">4. Service Provider Responsibilities</h2>
        <p className="mb-4">
          Service providers listed on BizList are responsible for the quality of their services and must 
          comply with all applicable laws and regulations. They must maintain accurate and up-to-date 
          information about their services.
        </p>

        <h2 className="text-2xl font-semibold mt-8 mb-4">5. Limitation of Liability</h2>
        <p className="mb-4">
          BizList shall not be liable for any indirect, incidental, special, consequential, or punitive 
          damages resulting from your use of or inability to use the service.
        </p>

        <h2 className="text-2xl font-semibold mt-8 mb-4">6. Changes to Terms</h2>
        <p className="mb-4">
          BizList reserves the right to modify these terms at any time. We will notify users of any changes 
          by updating the date at the top of these terms.
        </p>
      </div>
    </div>
  );
} 
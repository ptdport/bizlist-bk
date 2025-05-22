import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Policy - BizList',
  description: 'Privacy policy and data protection information for BizList users.',
};

export default function PrivacyPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Privacy Policy</h1>
      <div className="prose max-w-none">
        <p className="mb-4">Last updated: {new Date().toLocaleDateString()}</p>

        <h2 className="text-2xl font-semibold mt-8 mb-4">1. Information We Collect</h2>
        <p className="mb-4">
          We collect information that you provide directly to us, including but not limited to:
        </p>
        <ul className="list-disc pl-6 mb-4">
          <li>Name and contact information</li>
          <li>Account credentials</li>
          <li>Service provider information</li>
          <li>Payment information</li>
          <li>Communication preferences</li>
        </ul>

        <h2 className="text-2xl font-semibold mt-8 mb-4">2. How We Use Your Information</h2>
        <p className="mb-4">
          We use the information we collect to:
        </p>
        <ul className="list-disc pl-6 mb-4">
          <li>Provide and maintain our services</li>
          <li>Process transactions</li>
          <li>Send you updates and marketing communications</li>
          <li>Improve our services</li>
          <li>Comply with legal obligations</li>
        </ul>

        <h2 className="text-2xl font-semibold mt-8 mb-4">3. Information Sharing</h2>
        <p className="mb-4">
          We do not sell your personal information. We may share your information with:
        </p>
        <ul className="list-disc pl-6 mb-4">
          <li>Service providers who assist in our operations</li>
          <li>Legal authorities when required by law</li>
          <li>Business partners with your consent</li>
        </ul>

        <h2 className="text-2xl font-semibold mt-8 mb-4">4. Data Security</h2>
        <p className="mb-4">
          We implement appropriate security measures to protect your personal information from unauthorized 
          access, alteration, disclosure, or destruction.
        </p>

        <h2 className="text-2xl font-semibold mt-8 mb-4">5. Your Rights</h2>
        <p className="mb-4">
          You have the right to:
        </p>
        <ul className="list-disc pl-6 mb-4">
          <li>Access your personal information</li>
          <li>Correct inaccurate information</li>
          <li>Request deletion of your information</li>
          <li>Opt-out of marketing communications</li>
        </ul>

        <h2 className="text-2xl font-semibold mt-8 mb-4">6. Contact Us</h2>
        <p className="mb-4">
          If you have any questions about this Privacy Policy, please contact us at support@bizlist.com
        </p>
      </div>
    </div>
  );
} 
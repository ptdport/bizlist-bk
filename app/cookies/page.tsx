import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Cookie Policy - BizList',
  description: 'Information about how BizList uses cookies and similar technologies.',
};

export default function CookiePolicyPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Cookie Policy</h1>
      <div className="prose max-w-none">
        <p className="mb-4">Last updated: {new Date().toLocaleDateString()}</p>

        <h2 className="text-2xl font-semibold mt-8 mb-4">1. What Are Cookies</h2>
        <p className="mb-4">
          Cookies are small text files that are placed on your computer or mobile device when you visit our 
          website. They are widely used to make websites work more efficiently and provide useful information 
          to website owners.
        </p>

        <h2 className="text-2xl font-semibold mt-8 mb-4">2. How We Use Cookies</h2>
        <p className="mb-4">
          We use cookies for the following purposes:
        </p>
        <ul className="list-disc pl-6 mb-4">
          <li>Essential cookies: Required for the website to function properly</li>
          <li>Performance cookies: Help us understand how visitors interact with our website</li>
          <li>Functionality cookies: Remember your preferences and settings</li>
          <li>Targeting cookies: Used to deliver relevant advertisements</li>
        </ul>

        <h2 className="text-2xl font-semibold mt-8 mb-4">3. Types of Cookies We Use</h2>
        <p className="mb-4">
          We use the following types of cookies:
        </p>
        <ul className="list-disc pl-6 mb-4">
          <li>Session cookies: Temporary cookies that expire when you close your browser</li>
          <li>Persistent cookies: Remain on your device for a set period of time</li>
          <li>First-party cookies: Set by our website</li>
          <li>Third-party cookies: Set by our trusted partners</li>
        </ul>

        <h2 className="text-2xl font-semibold mt-8 mb-4">4. Managing Cookies</h2>
        <p className="mb-4">
          You can control and manage cookies in your browser settings. Please note that disabling certain 
          cookies may affect the functionality of our website.
        </p>

        <h2 className="text-2xl font-semibold mt-8 mb-4">5. Updates to This Policy</h2>
        <p className="mb-4">
          We may update this Cookie Policy from time to time. Any changes will be posted on this page with 
          an updated revision date.
        </p>

        <h2 className="text-2xl font-semibold mt-8 mb-4">6. Contact Us</h2>
        <p className="mb-4">
          If you have any questions about our Cookie Policy, please contact us at support@bizlist.com
        </p>
      </div>
    </div>
  );
} 
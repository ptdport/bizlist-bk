import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'About Us - BizList',
  description: 'Learn more about BizList and our mission to connect people with local service providers.',
};

export default function AboutPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">About BizList</h1>
      <div className="prose max-w-none">
        <p className="mb-4">
          Welcome to BizList, your trusted platform for finding and connecting with local service providers. 
          Our mission is to simplify the process of finding reliable professionals for your projects and tasks.
        </p>
        <h2 className="text-2xl font-semibold mt-8 mb-4">Our Story</h2>
        <p className="mb-4">
          Founded with the vision of creating a seamless connection between service providers and customers, 
          BizList has grown to become a trusted platform in the local services industry. We understand the 
          importance of finding reliable professionals for your needs, and we're committed to making that 
          process as easy as possible.
        </p>
        <h2 className="text-2xl font-semibold mt-8 mb-4">Our Values</h2>
        <ul className="list-disc pl-6 mb-4">
          <li>Trust and Reliability</li>
          <li>Community Building</li>
          <li>Quality Service</li>
          <li>User Satisfaction</li>
        </ul>
      </div>
    </div>
  );
} 
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from '@/components/ui/accordion';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';

const CUSTOMER_FAQS = [
  {
    question: 'How do I book a service?',
    answer: 'Browse categories, select a provider, and follow the booking instructions on their profile.'
  },
  {
    question: 'How do I pay for a service?',
    answer: 'Payments are securely processed through our platform. You can pay by card or PayPal.'
  },
  {
    question: 'Can I cancel or reschedule a booking?',
    answer: 'Yes, you can manage your bookings from your account dashboard. Cancellation and rescheduling policies may vary by provider.'
  },
  {
    question: 'How do I contact a provider?',
    answer: 'Once you book a service, you can message the provider directly through our platform.'
  },
  {
    question: 'What if I have an issue with my service?',
    answer: "Contact our support team and we'll help resolve any issues promptly."
  }
];

const PROVIDER_FAQS = [
  {
    question: 'How and when do I get paid?',
    answer: 'Providers are paid directly to their chosen payout method after the service is completed and confirmed by the customer.'
  },
  {
    question: 'Are you the merchant of record?',
    answer: 'Yes, we act as the merchant of record, handling all payment processing and compliance.'
  },
  {
    question: 'Can I offer services in other countries?',
    answer: 'Currently, providers can offer services in supported countries. Please check our list of available regions.'
  },
  {
    question: 'What if I already have a website?',
    answer: 'You can link your existing website to your provider profile for additional exposure.'
  },
  {
    question: 'How does my email plan work?',
    answer: 'Our platform offers integrated email tools to help you communicate with customers and manage bookings.'
  },
  {
    question: 'Can I send marketing emails?',
    answer: 'Yes, you can send marketing emails to your customers, provided you comply with our email policy.'
  },
  {
    question: 'How do I accept international payments?',
    answer: 'We support international payments for providers in eligible countries. Check your account settings for details.'
  },
  {
    question: 'How do I mark an invoice as paid out of band?',
    answer: 'You can manually mark invoices as paid from your provider dashboard if you receive payment outside the platform.'
  }
];

export default function FAQPage() {
  return (
    <main className="min-h-screen bg-white pb-16">
      <section className="bg-slate-50 border-b border-slate-100 py-12 mb-8">
        <div className="container mx-auto px-4 max-w-3xl text-center">
          <h1 className="text-4xl font-bold mb-4">Help Center / FAQ</h1>
          <p className="text-lg text-slate-600 mb-2">
            Find answers to common questions for both customers and providers. Need more help? <a href="/contact" className="text-blue-600 hover:underline">Contact us</a>.
          </p>
        </div>
      </section>
      <div className="container mx-auto px-4 max-w-2xl">
        <Tabs defaultValue="customers" className="w-full">
          <TabsList className="mb-8 flex justify-start bg-transparent border-b border-slate-200 rounded-none shadow-none py-6">
            <TabsTrigger className="text-base font-medium shadow-none data-[state=active]:shadow-none" value="customers">For Customers</TabsTrigger>
            <TabsTrigger className="text-base font-medium shadow-none data-[state=active]:shadow-none" value="providers">For Providers</TabsTrigger>
          </TabsList>
          <TabsContent value="customers">
            <Accordion type="single" collapsible defaultValue={CUSTOMER_FAQS[0].question} className="w-full">
              {CUSTOMER_FAQS.map((faq) => (
                <AccordionItem value={faq.question} key={faq.question}>
                  <AccordionTrigger className="text-base font-medium">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-slate-700">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </TabsContent>
          <TabsContent value="providers">
            <Accordion type="single" collapsible defaultValue={PROVIDER_FAQS[0].question} className="w-full">
              {PROVIDER_FAQS.map((faq) => (
                <AccordionItem value={faq.question} key={faq.question}>
                  <AccordionTrigger className="text-base font-medium">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-slate-700">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </TabsContent>
        </Tabs>
      </div>
    </main>
  );
} 
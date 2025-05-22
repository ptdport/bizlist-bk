import Image from 'next/image';
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from '@/components/ui/accordion';

const FAQS = [
  {
    question: 'How and when do I get paid?',
    answer:
      'Fermentum egestas at nunc tristique. Feugiat sodales viverra odio nisi non sem mauris. Nisi at purus habitant dictum etiam mi adipiscing. Congue at arcu aenean vitae aliquam eu tortor viverra id. Habitant sagittis faucibus pharetra odio fames rhoncus pellentesque sem est. Nunc ac eget tellus ultrices. Scelerisque amet id diam netus at a ac euismod. Eros non quis pellentesque odio neque ullamcorper fusce.',
  },
  {
    question: 'Are you the merchant of record?',
    answer: '',
  },
  {
    question: 'Can I sell in other countries?',
    answer: '',
  },
  {
    question: 'What if I already have a website?',
    answer: '',
  },
  {
    question: 'How does my email plan work?',
    answer: '',
  },
  {
    question: 'Can I send emails?',
    answer: '',
  },
  {
    question: 'Link for the Card Element',
    answer: '',
  },
  {
    question: 'Accepting international payments from Finto accounts',
    answer: '',
  },
  {
    question: 'Marking an Invoice Paid Out of Band',
    answer: '',
  },
];

export default function FAQSection() {
  return (
    <section className="w-full py-16 bg-white" id="faq">
      <div className="container mx-auto px-4 flex flex-col md:flex-row items-center gap-12">
        {/* Left: Illustration */}
        <div className="flex-1 flex justify-center">
          <div className="relative w-[320px] h-[320px] bg-gray-50 rounded-xl flex items-center justify-center shadow-md">
            <Image
              src="/faq-illustration.png"
              alt="FAQ Illustration"
              width={220}
              height={220}
              className="object-contain"
            />
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 bg-white rounded-lg px-6 py-2 shadow flex items-center gap-2">
              <span className="inline-block w-6 h-6 bg-green-200 rounded-full flex items-center justify-center">
                <span className="block w-3 h-3 bg-green-600 rounded-full" />
              </span>
              <span className="font-semibold text-gray-700">Finto Store</span>
            </div>
          </div>
        </div>
        {/* Right: FAQ Accordion */}
        <div className="flex-1 max-w-xl w-full">
          <h2 className="text-3xl font-bold mb-2 text-center md:text-left">FAQ</h2>
          <p className="mb-8 text-gray-600 text-center md:text-left">
            Connect with skilled professionals for your most common home projects
          </p>
          <Accordion type="single" collapsible className="w-full">
            {FAQS.map((faq, idx) => (
              <AccordionItem value={faq.question} key={faq.question}>
                <AccordionTrigger className="text-lg font-semibold">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-gray-700">
                  {faq.answer || <span className="italic text-gray-400">Answer coming soon...</span>}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  );
} 
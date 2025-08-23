import React, { useState } from 'react';
import FadeInSection from './FadeInSection';

const faqData = [
  {
    question: 'How is AI Clavis different from subscribing to each AI separately?',
    answer: 'AI Clavis provides a unified platform where you can access multiple premium AI models with a single subscription. This saves you money compared to subscribing to each service individually and allows you to compare responses side-by-side in one interface, eliminating the need to switch between tabs.',
  },
  {
    question: 'Can I choose which AI models to use?',
    answer: 'Yes! You have full control to select or deselect any of the available AI models for each prompt you submit. This allows you to tailor your queries to the strengths of each model or compare responses from your preferred set of AIs.',
  },
  {
    question: 'Do I get unlimited messages?',
    answer: 'Our plan includes a generous 400,000 tokens per month, which is more than enough for most users to explore, create, and get answers. This large token amount ensures you can extensively use the platform without worrying about running out quickly.',
  },
  {
    question: 'What happens if I run out of tokens?',
    answer: 'Your token balance automatically resets at the beginning of each monthly billing cycle. We are also working on options for users to purchase additional token packs if they need more for a specific project.',
  },
  {
    question: 'Do you offer refunds?',
    answer: 'We offer a 7-day money-back guarantee. If you\'re not satisfied with AI Clavis within the first week of your subscription, you can request a full refund, no questions asked.',
  },
  {
    question: 'How can I manage or cancel my subscription?',
    answer: 'You can easily manage your subscription, including upgrading, downgrading, or canceling, directly from your account dashboard. The process is straightforward, and you can cancel at any time.',
  },
  {
    question: 'Where can I access the Community and the Promptbook?',
    answer: 'Upon subscribing, you will receive an exclusive invitation to join our community and gain access to the Ultimate Promptbook. These resources are designed to help you get the most out of AI Clavis.',
  },
  {
    question: 'Can I use AI Clavis on my phone?',
    answer: 'Absolutely. AI Clavis is designed to be fully responsive, meaning you can use it on any device with a web browser, including your desktop, tablet, and smartphone, for a seamless experience on the go.',
  },
  {
    question: 'Will I get free upgrades when new AI versions are released?',
    answer: 'Yes, your AI Clavis subscription includes all future updates and access to new AI models as we integrate them into the platform. You\'ll always have the latest and greatest tools at your fingertips.',
  },
];


const FAQItem = ({ faq, isOpen, onClick }: { faq: { question: string, answer: string }, isOpen: boolean, onClick: () => void }) => {
    return (
        <div className="border-t border-zinc-800">
            <button
                onClick={onClick}
                className="w-full flex justify-between items-center text-left py-6 px-1"
                aria-expanded={isOpen}
            >
                <span className="text-lg font-medium text-white">{faq.question}</span>
                <svg
                    className={`flex-shrink-0 w-6 h-6 text-gray-400 transition-transform duration-300 ${isOpen ? 'transform rotate-180' : ''}`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
            </button>
            <div
                className={`overflow-hidden transition-all duration-300 ease-in-out ${isOpen ? 'max-h-96' : 'max-h-0'}`}
            >
                <p className="text-gray-400 pb-6 px-1">
                    {faq.answer}
                </p>
            </div>
        </div>
    );
};


const FAQs: React.FC = () => {
    const [openIndex, setOpenIndex] = useState<number | null>(null);

    const handleToggle = (index: number) => {
        setOpenIndex(openIndex === index ? null : index);
    };

    return (
        <section id="faqs" className="py-20 sm:py-32 scroll-mt-28">
            <div className="container mx-auto px-6">
                <FadeInSection className="text-center max-w-4xl mx-auto">
                    <h2 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-white leading-tight tracking-tighter">
                        Frequently Asked Questions (FAQs)
                    </h2>
                </FadeInSection>

                <FadeInSection className="mt-16 max-w-4xl mx-auto" direction="up">
                    <div className="bg-[#1a1a1a]/50 backdrop-blur-md border border-zinc-800 rounded-2xl p-4 sm:p-8 shadow-2xl shadow-cyan-900/10">
                        {faqData.map((faq, index) => (
                            <FAQItem
                                key={index}
                                faq={faq}
                                isOpen={openIndex === index}
                                onClick={() => handleToggle(index)}
                            />
                        ))}
                    </div>
                </FadeInSection>
            </div>
        </section>
    );
};

export default FAQs;
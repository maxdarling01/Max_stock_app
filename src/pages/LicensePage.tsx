import { Check, X, HelpCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useState } from 'react';

const faqs = [
  {
    question: 'Can I use these assets in commercial projects?',
    answer: 'Yes! All assets come with a royalty-free commercial license, meaning you can use them in any commercial project, including client work, advertisements, and products for sale.',
  },
  {
    question: 'Do I need to credit the creator?',
    answer: 'No attribution is required, though it is always appreciated. You are free to use the assets without crediting the original creator.',
  },
  {
    question: 'Can I modify the assets?',
    answer: 'Absolutely! You can edit, crop, resize, color correct, and modify the assets in any way to fit your project needs.',
  },
  {
    question: 'Can I use assets in multiple projects?',
    answer: 'Yes, once downloaded, you can use the asset in unlimited projects without any additional fees or restrictions.',
  },
  {
    question: 'What am I not allowed to do?',
    answer: 'You cannot resell or redistribute the original assets as stock content, claim them as your own original work, or use them as part of a trademark or logo without substantial modification.',
  },
  {
    question: 'Is there a download limit?',
    answer: 'No, there are no download limits. You can download as many assets as you need for your projects.',
  },
];

export default function LicensePage() {
  const [openFAQ, setOpenFAQ] = useState<number | null>(0);

  return (
    <div>
      <div className="bg-gradient-to-br from-black via-gray-900 to-black text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
          <h1 className="text-4xl sm:text-5xl font-bold mb-6">
            Simple, Royalty-Free Licensing
          </h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Use our assets with confidence. Our straightforward license covers all your needs.
          </p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="bg-white rounded-2xl shadow-xl p-8 sm:p-12 mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
            What's Included in Your License
          </h2>

          <div className="grid md:grid-cols-2 gap-12 mb-12">
            <div>
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                  <Check className="w-6 h-6 text-green-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900">You CAN</h3>
              </div>
              <ul className="space-y-4">
                {[
                  'Use in commercial and personal projects',
                  'Modify, edit, and adapt assets freely',
                  'Use for client work and paid projects',
                  'Include in products for sale',
                  'Use in social media, websites, and apps',
                  'Use in unlimited projects',
                  'Use in print and digital media',
                  'Combine with other assets and content',
                ].map((item, i) => (
                  <li key={i} className="flex items-start space-x-3">
                    <Check className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700">{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                  <X className="w-6 h-6 text-red-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900">You CANNOT</h3>
              </div>
              <ul className="space-y-4">
                {[
                  'Resell or redistribute as stock content',
                  'Claim as your original creation',
                  'Sell unmodified assets individually',
                  'Use as part of a trademark or logo',
                  'Upload to other stock platforms',
                  'Create competing stock libraries',
                  'Include in templates for resale',
                  'Sub-license to third parties',
                ].map((item, i) => (
                  <li key={i} className="flex items-start space-x-3">
                    <X className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="bg-yellow-50 rounded-xl p-6 border-2 border-yellow-200">
            <h3 className="font-bold text-gray-900 mb-3 text-lg">Important Notes</h3>
            <ul className="space-y-2 text-sm text-gray-700">
              <li className="flex items-start">
                <span className="text-yellow-600 mr-2 mt-0.5">•</span>
                <span>License is granted upon download and is perpetual</span>
              </li>
              <li className="flex items-start">
                <span className="text-yellow-600 mr-2 mt-0.5">•</span>
                <span>No attribution required, but always appreciated</span>
              </li>
              <li className="flex items-start">
                <span className="text-yellow-600 mr-2 mt-0.5">•</span>
                <span>Assets can be used worldwide without geographical restrictions</span>
              </li>
              <li className="flex items-start">
                <span className="text-yellow-600 mr-2 mt-0.5">•</span>
                <span>License covers derivative works created from the original assets</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
            Frequently Asked Questions
          </h2>
          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <div
                key={index}
                className="bg-white rounded-lg shadow-md overflow-hidden transition-all"
              >
                <button
                  onClick={() => setOpenFAQ(openFAQ === index ? null : index)}
                  className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    <HelpCircle className="w-5 h-5 text-yellow-500 flex-shrink-0" />
                    <span className="font-semibold text-gray-900">{faq.question}</span>
                  </div>
                  <svg
                    className={`w-5 h-5 text-gray-500 transition-transform ${
                      openFAQ === index ? 'rotate-180' : ''
                    }`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </button>
                {openFAQ === index && (
                  <div className="px-6 pb-4 pt-2 text-gray-700 animate-fadeIn">
                    {faq.answer}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="text-center bg-gradient-to-br from-black via-gray-900 to-black text-white rounded-2xl p-12">
          <h2 className="text-3xl font-bold mb-4">Ready to Get Started?</h2>
          <p className="text-gray-300 mb-8 text-lg">
            Browse thousands of royalty-free assets and start creating today.
          </p>
          <Link
            to="/"
            className="inline-block px-8 py-4 bg-yellow-500 text-black font-semibold rounded-lg hover:bg-yellow-400 transition-all shadow-lg hover:shadow-xl"
          >
            Start Browsing Assets
          </Link>
        </div>
      </div>
    </div>
  );
}

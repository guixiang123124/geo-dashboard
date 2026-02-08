'use client';

import Link from 'next/link';
import { CheckCircle2, X, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useState } from 'react';

const tiers = [
  {
    name: 'Free',
    price: '$0',
    period: 'forever',
    description: 'Perfect for trying out AI visibility diagnostics.',
    features: ['3 brand diagnoses/month', '1 AI model (Gemini)', 'Basic GEO Score', 'Smart prompt generation', 'Community support'],
    cta: 'Get Started Free',
    ctaLink: '/audit',
    highlight: false,
    comingSoon: false,
  },
  {
    name: 'Pro',
    price: '$49',
    period: '/month',
    description: 'For marketers who need deeper AI visibility insights.',
    features: ['Unlimited diagnoses', '3 AI models', 'Full GEO Score + trends', 'Custom prompt testing', 'Prompt research tools', 'Competitive benchmark', 'Priority support'],
    cta: 'Coming Soon',
    ctaLink: '#',
    highlight: true,
    comingSoon: true,
  },
  {
    name: 'Business',
    price: '$299',
    period: '/month',
    description: 'For teams managing multiple brands at scale.',
    features: ['Everything in Pro', 'Unlimited brands', 'All AI models (4+)', 'API access', 'White-label reports', 'Content audit tools', 'Dedicated account manager'],
    cta: 'Coming Soon',
    ctaLink: '#',
    highlight: false,
    comingSoon: true,
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    period: '',
    description: 'Custom solutions for large organizations.',
    features: ['Everything in Business', 'Custom AI model integration', 'SSO & advanced security', 'SLA guarantee', 'Custom reporting', 'On-premise deployment option', 'Dedicated engineering support'],
    cta: 'Contact Us',
    ctaLink: 'mailto:hello@luminos.ai',
    highlight: false,
    comingSoon: true,
  },
];

const comparisonFeatures = [
  { name: 'Brand diagnoses', free: '3/month', pro: 'Unlimited', business: 'Unlimited', enterprise: 'Unlimited' },
  { name: 'AI models', free: '1 (Gemini)', pro: '3', business: '4+', enterprise: 'Custom' },
  { name: 'Smart prompt generation', free: true, pro: true, business: true, enterprise: true },
  { name: 'Custom prompts', free: false, pro: true, business: true, enterprise: true },
  { name: 'Score history & trends', free: false, pro: true, business: true, enterprise: true },
  { name: 'Prompt research', free: false, pro: true, business: true, enterprise: true },
  { name: 'Competitive benchmarking', free: false, pro: true, business: true, enterprise: true },
  { name: 'API access', free: false, pro: false, business: true, enterprise: true },
  { name: 'White-label reports', free: false, pro: false, business: true, enterprise: true },
  { name: 'Dedicated manager', free: false, pro: false, business: true, enterprise: true },
  { name: 'SSO & security', free: false, pro: false, business: false, enterprise: true },
];

const faqs = [
  {
    q: 'What is GEO (Generative Engine Optimization)?',
    a: 'GEO is the practice of optimizing your brand\'s visibility in AI-generated responses. As more consumers use AI assistants like ChatGPT and Gemini for product research, GEO ensures your brand appears in those AI-generated answers.',
  },
  {
    q: 'How is the AI Visibility Score calculated?',
    a: 'The score is a composite of four dimensions: Visibility (35%) — how often AI mentions your brand; Citation (25%) — whether AI links to your website; Representation (25%) — sentiment and accuracy of AI\'s description; Intent Coverage (15%) — breadth across discovery, comparison, purchase, and informational queries.',
  },
  {
    q: 'Which AI platforms do you test against?',
    a: 'Currently we evaluate against Google Gemini 2.0 Flash. Support for OpenAI ChatGPT, Anthropic Claude, and Perplexity is coming soon with our multi-platform architecture.',
  },
  {
    q: 'How long does a diagnosis take?',
    a: 'A typical diagnosis takes 10-30 seconds. We crawl your website, generate tailored prompts using AI, evaluate each prompt in real-time, and compute your score.',
  },
  {
    q: 'Is the free tier really free?',
    a: 'Yes! The free tier includes 3 brand diagnoses per month with Gemini evaluation, smart prompt generation, and a full GEO score breakdown. No credit card required.',
  },
  {
    q: 'How can I improve my score?',
    a: 'Each diagnosis includes actionable recommendations. Common strategies include: adding Schema.org structured data, creating comprehensive brand content, getting featured in industry roundups, and ensuring your website clearly states your brand\'s unique value proposition.',
  },
];

function FAQItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border border-slate-200 rounded-lg">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between p-4 text-left"
      >
        <span className="font-medium text-slate-900">{q}</span>
        {open ? <ChevronUp className="w-5 h-5 text-slate-400 flex-shrink-0" /> : <ChevronDown className="w-5 h-5 text-slate-400 flex-shrink-0" />}
      </button>
      {open && (
        <div className="px-4 pb-4 text-sm text-slate-600">{a}</div>
      )}
    </div>
  );
}

export default function PricingPage() {
  return (
    <div className="max-w-6xl mx-auto p-6 space-y-16">
      {/* Header */}
      <div className="text-center space-y-4 pt-8">
        <h1 className="text-4xl font-bold text-slate-900">Pricing</h1>
        <p className="text-lg text-slate-600 max-w-2xl mx-auto">
          Start with a free diagnosis. Upgrade when you need more power.
        </p>
      </div>

      {/* Tier Cards */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        {tiers.map((tier) => (
          <div
            key={tier.name}
            className={`rounded-xl p-6 border-2 bg-white ${
              tier.highlight ? 'border-violet-500 ring-2 ring-violet-100' : 'border-slate-200'
            }`}
          >
            {tier.highlight && (
              <div className="text-xs font-semibold text-violet-600 uppercase mb-2">Most Popular</div>
            )}
            <h3 className="text-xl font-bold text-slate-900">{tier.name}</h3>
            <div className="mt-2 mb-2">
              <span className="text-4xl font-bold text-slate-900">{tier.price}</span>
              {tier.period && <span className="text-slate-500">{tier.period}</span>}
            </div>
            <p className="text-sm text-slate-500 mb-6">{tier.description}</p>
            <ul className="space-y-2.5 mb-6">
              {tier.features.map((f) => (
                <li key={f} className="flex items-center gap-2 text-sm text-slate-600">
                  <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />
                  {f}
                </li>
              ))}
            </ul>
            {tier.comingSoon ? (
              <Button className="w-full" variant="outline" disabled={tier.cta === 'Coming Soon'}>
                {tier.cta}
              </Button>
            ) : (
              <Link href={tier.ctaLink}>
                <Button className={`w-full ${tier.highlight ? 'bg-violet-600 hover:bg-violet-700' : ''}`} variant={tier.highlight ? 'default' : 'outline'}>
                  {tier.cta}
                </Button>
              </Link>
            )}
          </div>
        ))}
      </div>

      {/* Feature Comparison Table */}
      <div>
        <h2 className="text-2xl font-bold text-slate-900 text-center mb-8">Feature Comparison</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200">
                <th className="text-left py-3 px-4 font-medium text-slate-500">Feature</th>
                <th className="text-center py-3 px-4 font-medium text-slate-500">Free</th>
                <th className="text-center py-3 px-4 font-medium text-violet-600">Pro</th>
                <th className="text-center py-3 px-4 font-medium text-slate-500">Business</th>
                <th className="text-center py-3 px-4 font-medium text-slate-500">Enterprise</th>
              </tr>
            </thead>
            <tbody>
              {comparisonFeatures.map((f) => (
                <tr key={f.name} className="border-b border-slate-100">
                  <td className="py-3 px-4 text-slate-700">{f.name}</td>
                  {['free', 'pro', 'business', 'enterprise'].map((tier) => {
                    const val = f[tier as keyof typeof f];
                    return (
                      <td key={tier} className="text-center py-3 px-4">
                        {typeof val === 'boolean' ? (
                          val ? (
                            <CheckCircle2 className="w-4 h-4 text-green-500 mx-auto" />
                          ) : (
                            <X className="w-4 h-4 text-slate-300 mx-auto" />
                          )
                        ) : (
                          <span className="text-slate-700">{val}</span>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* FAQ */}
      <div>
        <h2 className="text-2xl font-bold text-slate-900 text-center mb-8">Frequently Asked Questions</h2>
        <div className="max-w-3xl mx-auto space-y-3">
          {faqs.map((faq) => (
            <FAQItem key={faq.q} q={faq.q} a={faq.a} />
          ))}
        </div>
      </div>

      {/* Bottom CTA */}
      <div className="text-center pb-8">
        <Card className="border-2 border-violet-200 bg-gradient-to-r from-violet-50 to-indigo-50 inline-block">
          <CardContent className="p-8 space-y-4">
            <h3 className="text-xl font-bold text-slate-900">Ready to check your AI visibility?</h3>
            <p className="text-slate-600">Run your first free diagnosis in 10 seconds.</p>
            <Link href="/audit">
              <Button className="bg-violet-600 hover:bg-violet-700 px-8">
                Start Free Diagnosis
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

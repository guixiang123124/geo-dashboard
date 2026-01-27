'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { brandsApi, DEFAULT_WORKSPACE_ID } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Plus, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import type { BrandCreate } from '@/lib/types';

const PRICE_TIERS = ['budget', 'mid-range', 'premium', 'luxury'] as const;

const CATEGORIES = [
    'Kids Fashion',
    'Baby Clothing',
    'Children\'s Apparel',
    'Teen Fashion',
    'Maternity & Kids',
    'Sustainable Kids Fashion',
    'Outdoor Kids Wear',
    'Kids Sportswear',
] as const;

function slugify(text: string): string {
    return text
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
}

export default function NewBrandPage() {
    const router = useRouter();
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    const [form, setForm] = useState({
        name: '',
        domain: '',
        category: 'Kids Fashion',
        positioning: '',
        price_tier: 'mid-range',
        target_age_range: '',
        target_keywords: '',
        competitors: '',
    });

    const updateField = (field: string, value: string) => {
        setForm(prev => ({ ...prev, [field]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!form.name.trim()) {
            setError('Brand name is required');
            return;
        }

        try {
            setSubmitting(true);
            setError(null);

            const brandData: BrandCreate = {
                name: form.name.trim(),
                slug: slugify(form.name),
                domain: form.domain.trim() || undefined,
                category: form.category,
                positioning: form.positioning.trim() || undefined,
                price_tier: form.price_tier,
                target_age_range: form.target_age_range.trim() || undefined,
                target_keywords: form.target_keywords
                    ? form.target_keywords.split(',').map(k => k.trim()).filter(Boolean)
                    : undefined,
                competitors: form.competitors
                    ? form.competitors.split(',').map(c => c.trim()).filter(Boolean)
                    : undefined,
            };

            const created = await brandsApi.create(DEFAULT_WORKSPACE_ID, brandData);
            setSuccess(true);

            // Redirect to brand detail after a brief delay
            setTimeout(() => {
                router.push(`/brands/${created.id}`);
            }, 1500);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to create brand');
        } finally {
            setSubmitting(false);
        }
    };

    if (success) {
        return (
            <div className="p-8">
                <div className="max-w-2xl mx-auto">
                    <Card className="border-green-200 bg-green-50">
                        <CardContent className="p-8 text-center">
                            <CheckCircle className="w-12 h-12 text-green-600 mx-auto mb-4" />
                            <h2 className="text-xl font-bold text-green-900 mb-2">Brand Created</h2>
                            <p className="text-green-700">
                                {form.name} has been added. Redirecting to brand details...
                            </p>
                            <p className="text-sm text-green-600 mt-2">
                                Run an evaluation from the Evaluations page to see GEO performance for this brand.
                            </p>
                        </CardContent>
                    </Card>
                </div>
            </div>
        );
    }

    return (
        <div className="p-8">
            <div className="max-w-2xl mx-auto space-y-6">
                <Link href="/brands" className="inline-flex items-center gap-1 text-sm text-slate-600 hover:text-slate-900">
                    <ArrowLeft className="w-4 h-4" /> Back to Brands
                </Link>

                <div>
                    <h1 className="text-3xl font-bold text-slate-900">Add New Brand</h1>
                    <p className="text-slate-600 mt-2">
                        Add a brand to track its GEO performance across AI platforms.
                        After creating, run an evaluation to see results.
                    </p>
                </div>

                {error && (
                    <Card className="border-red-200 bg-red-50">
                        <CardContent className="p-4 flex items-center gap-3">
                            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
                            <span className="text-red-700">{error}</span>
                        </CardContent>
                    </Card>
                )}

                <form onSubmit={handleSubmit}>
                    <Card>
                        <CardHeader>
                            <CardTitle>Brand Details</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-5">
                            {/* Name */}
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">
                                    Brand Name <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={form.name}
                                    onChange={e => updateField('name', e.target.value)}
                                    placeholder="e.g., Carter's, Primary, Hanna Andersson"
                                    className="w-full px-3 py-2 border rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    required
                                />
                            </div>

                            {/* Domain */}
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">
                                    Website Domain
                                </label>
                                <input
                                    type="text"
                                    value={form.domain}
                                    onChange={e => updateField('domain', e.target.value)}
                                    placeholder="e.g., carters.com"
                                    className="w-full px-3 py-2 border rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                />
                                <p className="text-xs text-slate-500 mt-1">Domain without https:// prefix</p>
                            </div>

                            {/* Category */}
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Category</label>
                                <select
                                    value={form.category}
                                    onChange={e => updateField('category', e.target.value)}
                                    className="w-full px-3 py-2 border rounded-md text-sm bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                >
                                    {CATEGORIES.map(cat => (
                                        <option key={cat} value={cat}>{cat}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Positioning */}
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">
                                    Brand Positioning
                                </label>
                                <textarea
                                    value={form.positioning}
                                    onChange={e => updateField('positioning', e.target.value)}
                                    placeholder="e.g., Affordable, durable basics for active kids. Known for organic cotton and playful designs."
                                    rows={2}
                                    className="w-full px-3 py-2 border rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                />
                                <p className="text-xs text-slate-500 mt-1">Brief description of what the brand is known for</p>
                            </div>

                            {/* Price Tier */}
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Price Tier</label>
                                <div className="flex gap-2">
                                    {PRICE_TIERS.map(tier => (
                                        <button
                                            key={tier}
                                            type="button"
                                            onClick={() => updateField('price_tier', tier)}
                                            className={`px-4 py-2 text-sm rounded-md border transition-colors ${form.price_tier === tier
                                                ? 'bg-blue-600 text-white border-blue-600'
                                                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                                                }`}
                                        >
                                            {tier.charAt(0).toUpperCase() + tier.slice(1)}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Target Age Range */}
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">
                                    Target Age Range
                                </label>
                                <input
                                    type="text"
                                    value={form.target_age_range}
                                    onChange={e => updateField('target_age_range', e.target.value)}
                                    placeholder="e.g., 0-12 years"
                                    className="w-full px-3 py-2 border rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                />
                            </div>

                            {/* Keywords */}
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">
                                    Target Keywords
                                </label>
                                <input
                                    type="text"
                                    value={form.target_keywords}
                                    onChange={e => updateField('target_keywords', e.target.value)}
                                    placeholder="e.g., organic cotton, sustainable, kids basics"
                                    className="w-full px-3 py-2 border rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                />
                                <p className="text-xs text-slate-500 mt-1">Comma-separated keywords</p>
                            </div>

                            {/* Competitors */}
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">
                                    Competitors
                                </label>
                                <input
                                    type="text"
                                    value={form.competitors}
                                    onChange={e => updateField('competitors', e.target.value)}
                                    placeholder="e.g., Carter's, Gap Kids, H&M Kids"
                                    className="w-full px-3 py-2 border rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                />
                                <p className="text-xs text-slate-500 mt-1">Comma-separated competitor brand names</p>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Info Card */}
                    <Card className="mt-6 bg-blue-50 border-blue-200">
                        <CardContent className="p-4">
                            <p className="text-sm text-blue-800">
                                <strong>How it works:</strong> After adding your brand, go to the Evaluations page
                                to run an evaluation. The system will test your brand against 20+ prompts across
                                different intent categories (product discovery, brand comparison, price research, etc.)
                                and measure GEO performance on AI platforms.
                            </p>
                        </CardContent>
                    </Card>

                    {/* Submit */}
                    <div className="mt-6 flex gap-3">
                        <Button
                            type="submit"
                            disabled={submitting || !form.name.trim()}
                            className="bg-violet-600 hover:bg-violet-700 text-white"
                        >
                            {submitting ? (
                                <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    Creating...
                                </>
                            ) : (
                                <>
                                    <Plus className="w-4 h-4 mr-2" />
                                    Create Brand
                                </>
                            )}
                        </Button>
                        <Link href="/brands">
                            <Button type="button" variant="outline">Cancel</Button>
                        </Link>
                    </div>
                </form>
            </div>
        </div>
    );
}

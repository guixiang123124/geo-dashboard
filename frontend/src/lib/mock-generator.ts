import { format, subDays } from 'date-fns';
import type { TimeSeriesDataPoint } from './types';

// ============ Local Mock Types ============
// These are mock-only shapes, not tied to the backend API types.

interface MockModelScore {
    model: string;
    score: number;
    mentionCount: number;
    citationRate: number;
    avgRank: number;
}

interface MockEvaluationDetail {
    id: string;
    prompt: string;
    model: string;
    response: string;
    mentioned: boolean;
    rank: number | null;
    cited: boolean;
    citationUrl?: string;
    accuracy: number;
    timestamp: string;
}

interface MockEvaluationRun {
    id: string;
    brandId: string;
    brandName: string;
    status: 'pending' | 'running' | 'completed' | 'failed';
    progress: number;
    modelsUsed: string[];
    startedAt: string;
    completedAt?: string;
    duration?: string;
    totalPrompts: number;
    completedPrompts: number;
}

// Generate time series data for a brand over the past 6 months
export function generateHistoricalScores(
    brandId: string,
    baseScores: { composite: number; visibility: number; citation: number; representation: number; intent: number },
    months: number = 6
): TimeSeriesDataPoint[] {
    const data: TimeSeriesDataPoint[] = [];
    const today = new Date();
    const totalDays = months * 30;

    for (let i = totalDays; i >= 0; i -= 7) { // Weekly data points
        const date = format(subDays(today, i), 'yyyy-MM-dd');

        // Add some realistic variation (+/- 10%)
        const variation = () => (Math.random() * 20) - 10;

        data.push({
            date,
            composite: Math.max(0, Math.min(100, baseScores.composite + variation())),
            visibility: Math.max(0, Math.min(100, baseScores.visibility + variation())),
            citation: Math.max(0, Math.min(100, baseScores.citation + variation())),
            representation: Math.max(0, Math.min(100, baseScores.representation + variation())),
            intent: Math.max(0, Math.min(100, baseScores.intent + variation())),
        });
    }

    return data;
}

// Generate model breakdown scores for a brand
export function generateModelBreakdown(brandId: string, baseScore: number): MockModelScore[] {
    const models = ['ChatGPT', 'Gemini', 'Claude', 'Perplexity'];

    return models.map(model => {
        const variation = (Math.random() * 30) - 15; // +/- 15 points
        const score = Math.max(0, Math.min(100, baseScore + variation));

        return {
            model,
            score: Math.round(score),
            mentionCount: Math.floor(Math.random() * 20) + 5,
            citationRate: Math.round((Math.random() * 0.4 + 0.4) * 100), // 40-80%
            avgRank: Math.round((Math.random() * 4) + 1), // 1-5
        };
    });
}

// Generate evaluation details for a brand
export function generateEvaluationDetails(
    brandId: string,
    brandName: string,
    count: number = 10
): MockEvaluationDetail[] {
    const models = ['ChatGPT', 'Gemini', 'Claude', 'Perplexity'];
    const prompts = [
        'Best sustainable kids clothing brands',
        'Where to buy organic baby clothes',
        'Affordable kids fashion for school',
        'Premium children\'s clothing recommendations',
        'Eco-friendly toddler clothing options',
        'High-quality kids wear brands',
        'Best value kids clothing stores',
        'Luxury children\'s fashion brands',
        'Durable kids clothing for active children',
        'Trendy kids fashion on a budget',
    ];

    const responses = [
        `Here are some great options for kids clothing:\n1. ${brandName} - Known for quality and sustainability\n2. OtherBrand - Great value\n3. AnotherBrand - Premium options`,
        `I'd recommend checking out ${brandName}. They offer a wide range of children's clothing with a focus on organic materials. You can visit their website at ${brandName.toLowerCase()}.com for more information.`,
        `For kids fashion, you might want to consider:\n- ${brandName}: Excellent quality and design\n- CompetitorA: Good prices\n- CompetitorB: Wide selection`,
        `${brandName} is a popular choice for children's clothing. They're known for their sustainable practices and comfortable designs.`,
        `When it comes to kids clothing, ${brandName} stands out for their commitment to quality. Other options include CompetitorX and CompetitorY.`,
    ];

    return Array.from({ length: count }, (_, i) => {
        const mentioned = Math.random() > 0.3; // 70% mention rate
        const cited = mentioned && Math.random() > 0.4; // 60% citation rate when mentioned

        return {
            id: `eval-${brandId}-${i}`,
            prompt: prompts[i % prompts.length],
            model: models[i % models.length],
            response: mentioned ? responses[i % responses.length] : 'Other brands to consider include CompetitorA, CompetitorB, and CompetitorC for quality kids fashion.',
            mentioned,
            rank: mentioned ? Math.floor(Math.random() * 5) + 1 : null,
            cited,
            citationUrl: cited ? `https://${brandName.toLowerCase()}.com` : undefined,
            accuracy: mentioned ? Math.floor(Math.random() * 4) : 0, // 0-3 scale
            timestamp: format(subDays(new Date(), i), 'yyyy-MM-dd HH:mm:ss'),
        };
    });
}

// Generate evaluation runs
export function generateEvaluationRuns(brandId: string, brandName: string, count: number = 5): MockEvaluationRun[] {
    const statuses: Array<'pending' | 'running' | 'completed' | 'failed'> = ['completed', 'completed', 'completed', 'running', 'pending'];
    const models = ['ChatGPT', 'Gemini', 'Claude', 'Perplexity'];

    return Array.from({ length: count }, (_, i) => {
        const status = statuses[i % statuses.length];
        const totalPrompts = 25;
        const completedPrompts = status === 'completed' ? totalPrompts :
                                status === 'running' ? Math.floor(totalPrompts * 0.6) :
                                0;
        const progress = (completedPrompts / totalPrompts) * 100;

        const startedAt = format(subDays(new Date(), count - i), 'yyyy-MM-dd HH:mm:ss');
        const completedAt = status === 'completed' ?
            format(subDays(new Date(), count - i - 0.1), 'yyyy-MM-dd HH:mm:ss') :
            undefined;

        return {
            id: `run-${brandId}-${i}`,
            brandId,
            brandName,
            status,
            progress: Math.round(progress),
            modelsUsed: models.slice(0, Math.floor(Math.random() * 3) + 2), // 2-4 models
            startedAt,
            completedAt,
            duration: status === 'completed' ? '2m 34s' : status === 'running' ? '1m 12s' : undefined,
            totalPrompts,
            completedPrompts,
        };
    });
}

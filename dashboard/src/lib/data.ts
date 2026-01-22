export type Brand = {
    id: string;
    name: string;
    category: string; // e.g., "Mainstream", "Luxury", "Sustainable"
    logo: string;
};

export type GEOScore = {
    composite: number;
    visibility: number;
    citation: number;
    representation: number;
    intent: number;
};

export type AttributionFunnel = {
    stage: string;
    value: number; // Percentage or Count
    label: string;
};

// Mock Brands
export const BRANDS: Brand[] = [
    { id: "b1", name: "TinyThreads", category: "Mainstream", logo: "TT" },
    { id: "b2", name: "EcoKids", category: "Sustainable", logo: "EK" },
    { id: "b3", name: "LuxeMini", category: "Luxury", logo: "LM" },
];

// Mock Scores
export const SCORES: Record<string, GEOScore> = {
    b1: { composite: 78, visibility: 85, citation: 60, representation: 75, intent: 90 },
    b2: { composite: 65, visibility: 40, citation: 85, representation: 90, intent: 50 },
    b3: { composite: 82, visibility: 80, citation: 90, representation: 85, intent: 70 },
};

// Mock Funnel Data (Average)
export const FUNNEL_DATA: Record<string, AttributionFunnel[]> = {
    b1: [
        { stage: "Recall", value: 100, label: "Total Prompts" },
        { stage: "Visibility", value: 45, label: "Mentioned" },
        { stage: "Citation", value: 12, label: "Cited Source" },
        { stage: "Conversion", value: 5, label: "High Intent" },
    ],
    b2: [
        { stage: "Recall", value: 100, label: "Total Prompts" },
        { stage: "Visibility", value: 20, label: "Mentioned" },
        { stage: "Citation", value: 18, label: "Cited Source" },
        { stage: "Conversion", value: 10, label: "High Intent" },
    ],
    b3: [
        { stage: "Recall", value: 100, label: "Total Prompts" },
        { stage: "Visibility", value: 60, label: "Mentioned" },
        { stage: "Citation", value: 40, label: "Cited Source" },
        { stage: "Conversion", value: 25, label: "High Intent" },
    ],
};

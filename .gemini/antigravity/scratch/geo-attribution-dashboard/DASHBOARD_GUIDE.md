# GEO Dashboard - Visual Guide

**Access:** http://localhost:3000 (currently running!)
**Status:** Phase 1 - Mock Data Dashboard
**Next:** Phase 3 - Connect to Real API

---

## Current Dashboard (Live Screenshot Description)

The dashboard is currently running at http://localhost:3000 with mock data for 3 example brands. Here's what you'll see:

### Layout Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                                                                  │
│  GEO Attribution Dashboard                     [User Menu ▾]    │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ │
│                                                                  │
│  Brand Performance Overview                                      │
│                                                                  │
│  ┌──────────────────────┐  ┌──────────────────────┐  ┌──────┐ │
│  │ [ScoreCard 1]        │  │ [ScoreCard 2]        │  │ [SC3]│ │
│  │ TinyThreads          │  │ EcoKids              │  │ Luxe │ │
│  │ Sustainable Kids     │  │ Organic Children's   │  │ Mini │ │
│  │                      │  │                      │  │      │ │
│  │ GEO Score: 78   🟢   │  │ GEO Score: 82   🟢   │  │ 65🟡 │ │
│  │ ●●●●●●●●○○           │  │ ●●●●●●●●○○           │  │ ●●●● │ │
│  │                      │  │                      │  │      │ │
│  │ ┌────────┬────────┐ │  │ ┌────────┬────────┐ │  │ ┌──┐ │ │
│  │ │Visible │Citation│ │  │ │Visible │Citation│ │  │ │  │ │ │
│  │ │  72    │  85    │ │  │ │  88    │  80    │ │  │ │  │ │ │
│  │ ├────────┼────────┤ │  │ ├────────┼────────┤ │  │ ├──┤ │ │
│  │ │Repre   │ Intent │ │  │ │Repre   │ Intent │ │  │ │  │ │ │
│  │ │  75    │  82    │ │  │ │  78    │  85    │ │  │ │  │ │ │
│  │ └────────┴────────┘ │  │ └────────┴────────┘ │  │ └──┘ │ │
│  └──────────────────────┘  └──────────────────────┘  └──────┘ │
│                                                                  │
│  Latest Attribution Insights                                     │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ │
│  • Brands with "organic" keywords see 35% higher citation rate  │
│  • "Affordable" positioning improves visibility by 28%          │
│  • Intent coverage varies significantly across AI models        │
│                                                                  │
│  [Subscribe for Updates]                                         │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## Component Breakdown

### 1. ScoreCard Component (Main Feature)

Each brand gets a card showing:

```
┌─────────────────────────────────────┐
│ TinyThreads                         │  ← Brand Name
│ Sustainable Kids                    │  ← Category
│                                     │
│ GEO Score: 78  🟢                   │  ← Composite Score
│ ●●●●●●●●○○                          │  ← Visual Progress Bar
│                                     │
│ ┌───────────┬───────────┐          │
│ │ Visible   │ Citation  │          │  ← 4 Dimensions
│ │    72     │    85     │          │    in 2x2 Grid
│ ├───────────┼───────────┤          │
│ │ Repre     │  Intent   │          │
│ │    75     │    82     │          │
│ └───────────┴───────────┘          │
└─────────────────────────────────────┘
```

**Color Coding:**
- 🟢 **Green (80-100):** Excellent GEO performance
- 🟡 **Yellow (50-79):** Good performance, room for optimization
- 🔴 **Red (0-49):** Needs significant improvement

**The 4 Dimensions:**

1. **Visibility (Top-Left):** How often AI mentions the brand
   - Score: 0-100
   - Based on: Mention rate + ranking position

2. **Citation (Top-Right):** How often AI links to the brand
   - Score: 0-100
   - Based on: Citation rate when mentioned

3. **Representation (Bottom-Left):** How accurately AI describes the brand
   - Score: 0-100
   - Based on: Description accuracy (0-3 scale)

4. **Intent (Bottom-Right):** How many user intents the brand covers
   - Score: 0-100
   - Based on: Intent category coverage

---

## Mock Data (Current State)

### Brand 1: TinyThreads
```json
{
  "name": "TinyThreads",
  "category": "Sustainable Kids",
  "composite": 78,
  "scores": {
    "visibility": 72,
    "citation": 85,
    "representation": 75,
    "intent": 82
  }
}
```

**Interpretation:**
- Good overall performance (78 = Yellow/Good)
- **Strong citation** (85) - AI links to them often
- **Weakest visibility** (72) - Could be mentioned more
- Positioning: Sustainable brand performing well in its niche

### Brand 2: EcoKids
```json
{
  "name": "EcoKids",
  "category": "Organic Children's",
  "composite": 82,
  "scores": {
    "visibility": 88,
    "citation": 80,
    "representation": 78,
    "intent": 85
  }
}
```

**Interpretation:**
- Excellent overall (82 = Green)
- **Excellent visibility** (88) - AI mentions them frequently
- **Strongest intent coverage** (85) - Matches many user needs
- Positioning: Top organic kids brand

### Brand 3: LuxeMini
```json
{
  "name": "LuxeMini",
  "category": "Premium Kids",
  "composite": 65,
  "scores": {
    "visibility": 68,
    "citation": 70,
    "representation": 60,
    "intent": 62
  }
}
```

**Interpretation:**
- Moderate performance (65 = Yellow)
- **Weakest representation** (60) - AI describes inaccurately
- Across-the-board improvement needed
- Positioning: Premium brand not yet established in AI knowledge

---

## Responsive Design

The dashboard adapts to screen size:

### Mobile (< 768px)
```
┌──────────────────┐
│ [ScoreCard 1]    │
│ TinyThreads      │
│ GEO: 78          │
│ ┌─────┬─────┐   │
│ │ V:72│ C:85│   │
│ ├─────┼─────┤   │
│ │R:75 │I:82 │   │
│ └─────┴─────┘   │
└──────────────────┘
┌──────────────────┐
│ [ScoreCard 2]    │
│ EcoKids          │
│ ...              │
└──────────────────┘
```
**1 column layout**

### Tablet (768px - 1024px)
```
┌──────────────────┐  ┌──────────────────┐
│ [ScoreCard 1]    │  │ [ScoreCard 2]    │
│ TinyThreads      │  │ EcoKids          │
└──────────────────┘  └──────────────────┘
┌──────────────────┐
│ [ScoreCard 3]    │
│ LuxeMini         │
└──────────────────┘
```
**2 column layout**

### Desktop (> 1024px)
```
┌────────────┐  ┌────────────┐  ┌────────────┐
│ ScoreCard1 │  │ ScoreCard2 │  │ ScoreCard3 │
│ TinyThreads│  │  EcoKids   │  │  LuxeMini  │
└────────────┘  └────────────┘  └────────────┘
```
**3 column layout**

---

## Interactive Elements (Phase 1)

Currently the dashboard is **static** (read-only). In Phase 3, these will become interactive:

### Planned Interactions:

1. **Click on ScoreCard:**
   - Navigate to brand detail page
   - See score history chart
   - View AI responses that generated the score

2. **Click on Dimension Score:**
   - Drill down into that specific metric
   - See breakdown by AI model
   - Get optimization recommendations

3. **Subscribe Button:**
   - Email signup for score updates
   - Weekly GEO insights report

---

## Insights Section

The bottom section shows **cross-brand insights**:

```
Latest Attribution Insights
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
• Brands with "organic" keywords see 35% higher citation rate
• "Affordable" positioning improves visibility by 28%
• Intent coverage varies significantly across AI models
```

**These insights are derived from:**
- Comparing scores across brands
- Identifying keyword patterns
- Analyzing positioning strategies
- Model-specific behaviors

---

## Coming in Phase 3: Enhanced Dashboard

### New Pages

1. **Brand List Page** (`/brands`)
   ```
   ┌──────────────────────────────────────────────┐
   │ Brands                      [+ Add Brand]    │
   ├──────────────────────────────────────────────┤
   │ Search: [____________]  Filter: [All ▾]      │
   ├──────────────────────────────────────────────┤
   │ Name          | GEO Score | Last Updated    │
   ├──────────────────────────────────────────────┤
   │ EcoKids       |    82    | Jan 23, 2026    │
   │ TinyThreads   |    78    | Jan 23, 2026    │
   │ LuxeMini      |    65    | Jan 22, 2026    │
   └──────────────────────────────────────────────┘
   ```

2. **Brand Detail Page** (`/brands/[id]`)
   ```
   ┌──────────────────────────────────────────────┐
   │ ← Back to Brands                             │
   ├──────────────────────────────────────────────┤
   │ TinyThreads                   [Edit] [Delete]│
   │ tinythreads.com                              │
   ├──────────────────────────────────────────────┤
   │ GEO Score History                            │
   │ ┌────────────────────────────────────────┐  │
   │ │     📈 Line Chart                      │  │
   │ │ 90┤                                    │  │
   │ │ 80┤     ●━━━●━━━●                     │  │
   │ │ 70┤   ●                                │  │
   │ │ 60┤                                    │  │
   │ │   └────────────────────────────────   │  │
   │ │   Jan  Feb  Mar  Apr  May  Jun       │  │
   │ └────────────────────────────────────────┘  │
   ├──────────────────────────────────────────────┤
   │ 4-Dimension Breakdown                        │
   │ [Radar Chart showing all 4 dimensions]       │
   ├──────────────────────────────────────────────┤
   │ AI Model Comparison                          │
   │ ChatGPT: 85 | Gemini: 72 | Claude: 78       │
   ├──────────────────────────────────────────────┤
   │ Recent Evaluations                           │
   │ • Jan 23: "Best organic kids clothes"        │
   │   Mentioned: ✓  Rank: 2  Citation: ✓        │
   │ • Jan 22: "Affordable baby clothing"         │
   │   Mentioned: ✓  Rank: 4  Citation: ✗        │
   └──────────────────────────────────────────────┘
   ```

3. **Evaluation Page** (`/evaluations`)
   ```
   ┌──────────────────────────────────────────────┐
   │ Evaluations               [+ Run Evaluation] │
   ├──────────────────────────────────────────────┤
   │ Status: [All ▾]  Brand: [All ▾]              │
   ├──────────────────────────────────────────────┤
   │ Brand       | Status    | Progress | Date   │
   ├──────────────────────────────────────────────┤
   │ TinyThreads | Running   | ████░░   | Today  │
   │ EcoKids     | Completed | ██████   | Jan 23 │
   │ LuxeMini    | Failed    | ██░░░░   | Jan 22 │
   └──────────────────────────────────────────────┘
   ```

4. **Evaluation Results Page** (`/evaluations/[id]`)
   ```
   ┌──────────────────────────────────────────────┐
   │ ← Back to Evaluations                        │
   ├──────────────────────────────────────────────┤
   │ Evaluation: TinyThreads - Jan 23, 2026       │
   │ Status: Completed  Duration: 2m 34s          │
   ├──────────────────────────────────────────────┤
   │ Results by Model                             │
   │                                              │
   │ 📊 ChatGPT (25 prompts)                      │
   │ ├─ Mentioned: 18/25 (72%)                    │
   │ ├─ Avg Rank: 2.3                             │
   │ └─ Citations: 15/18 (83%)                    │
   │                                              │
   │ 📊 Gemini (25 prompts)                       │
   │ ├─ Mentioned: 20/25 (80%)                    │
   │ ├─ Avg Rank: 1.8                             │
   │ └─ Citations: 12/20 (60%)                    │
   ├──────────────────────────────────────────────┤
   │ Sample AI Responses                          │
   │                                              │
   │ Prompt: "Best sustainable kids clothing"     │
   │ Model: ChatGPT                               │
   │ Response:                                    │
   │   "Here are some great sustainable options:  │
   │   1. TinyThreads ← [Mentioned, Rank 1]       │
   │      (https://tinythreads.com) ← [Citation]  │
   │      Known for eco-friendly materials and    │
   │      fair trade practices."                  │
   │                                              │
   │ [Show more responses...]                     │
   └──────────────────────────────────────────────┘
   ```

### New Visualizations

1. **Attribution Funnel Chart:**
   ```
   User Intent (100%)
        ↓
   AI Recall (76%)  ← Visibility
        ↓
   Source Selection (59%)  ← Citation
        ↓
   Positive Framing (54%)  ← Representation
        ↓
   Intent Match (48%)  ← Intent Coverage
   ```

2. **Radar Chart (4 Dimensions):**
   ```
        Visibility
            ▲
            │  ●
            │ ╱ ╲
    Intent  │●   ●  Citation
            │ ╲ ╱
            │  ●
            │
      Representation
   ```

3. **Cross-Model Comparison:**
   ```
   Score by AI Model
   100┤
    80┤  █
    60┤  █  █
    40┤  █  █  █
    20┤  █  █  █  █
     0└──────────────
       GPT Gem Cla Per
   ```

---

## Technical Implementation

### Current Code Structure

**Page Component:** `frontend/src/app/page.tsx`
```typescript
export default function Home() {
  return (
    <div>
      <h1>GEO Attribution Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {BRANDS.map((brand) => (
          <ScoreCard
            key={brand.id}
            brandName={brand.name}
            category={brand.category}
            score={SCORES[brand.id]}
          />
        ))}
      </div>
    </div>
  )
}
```

**ScoreCard Component:** `frontend/src/components/geo/ScoreCard.tsx`
```typescript
interface ScoreCardProps {
  brandName: string
  category: string
  score: GEOScore
}

export function ScoreCard({ brandName, category, score }: ScoreCardProps) {
  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600"
    if (score >= 50) return "text-yellow-600"
    return "text-red-600"
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{brandName}</CardTitle>
        <CardDescription>{category}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className={getScoreColor(score.composite)}>
          GEO Score: {score.composite}
        </div>
        <div className="grid grid-cols-2 gap-4 mt-4">
          <div>Visibility: {score.visibility}</div>
          <div>Citation: {score.citation}</div>
          <div>Representation: {score.representation}</div>
          <div>Intent: {score.intent}</div>
        </div>
      </CardContent>
    </Card>
  )
}
```

**Mock Data:** `frontend/src/lib/data.ts`
```typescript
export const SCORES: Record<string, GEOScore> = {
  "tinythreads": {
    composite: 78,
    visibility: 72,
    citation: 85,
    representation: 75,
    intent: 82
  },
  // ... more brands
}
```

---

## How to View the Dashboard

1. **Start the server** (already running):
   ```bash
   cd geo-attribution-dashboard/frontend
   npm run dev
   ```

2. **Open browser:**
   ```
   http://localhost:3000
   ```

3. **What you'll see:**
   - 3 brand score cards in a grid
   - Each with composite score + 4 dimensions
   - Color-coded performance indicators
   - Insights section at bottom

---

## Next Steps

### Phase 2: Backend API
- Connect to real evaluation data
- Calculate live GEO scores

### Phase 3: Frontend Enhancement
- Replace mock data with API calls
- Add brand management pages
- Add evaluation run pages
- Add detailed drill-down views
- Add charts and visualizations

### Phase 4: Data Expansion
- Add 50+ prompts
- Expand to 30 brands
- More intent categories

---

**Dashboard Status:** ✅ Running at http://localhost:3000
**Current Phase:** Phase 1 Complete (Mock Data)
**Next Phase:** Phase 2 (Backend API)

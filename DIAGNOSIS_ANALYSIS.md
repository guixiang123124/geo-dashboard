# Diagnosis Deep Analysis Report — 2026-02-10

## Test Brands
| Brand | Category | Composite | Visibility | Intent | Models |
|-------|----------|-----------|-----------|--------|--------|
| Nike | Sportswear | 64 | 72% | 100% | gemini:77% openai:84% grok:91% |
| Glossier | Beauty | 33 | 5% | 50% | gemini:44% openai:46% grok:51% |
| Bombas | Apparel | 46 | 26% | 83% | gemini:53% openai:62% grok:62% |

---

## 🔑 Key Insights

### 1. Model Behavior Differences
- **Grok consistently mentions brands more** (Nike 91%, Glossier 51%, Bombas 62%)
- **Gemini is the most conservative** (Nike 77%, Glossier 44%, Bombas 53%)
- **OpenAI falls in the middle** but provides more structured responses with rank numbers
- **Insight**: Grok may be more "brand-friendly" / less cautious in recommendations
- **Action**: Consider weighting Gemini results higher for "true organic visibility" since it's hardest to appear in

### 2. Intent Dimension Gap Analysis
| Intent | Nike | Glossier | Bombas |
|--------|------|---------|--------|
| Discovery | 100% | 7% | 40% |
| Comparison | 75% | 17% | 25% |
| Purchase Intent | 66% | 0% | 25% |
| Trend | 91% | 0% | 25% |
| Problem Solving | 33% | 0% | 0% |
| Contextual | 58% | 8% | 42% |

- **Discovery** is where big brands dominate — "best X brands" prompts
- **Problem Solving** is weak even for Nike (33%) — AI prefers category advice over brand names
- **Purchase Intent** & **Trend** are brand-awareness dependent — small brands invisible
- **Action**: Problem-solving prompts need rethinking — they naturally don't elicit brand names. Consider splitting into "brand-mentioning" vs "category education" intents

### 3. Sentiment Analysis Issues
- **71 results have `None` sentiment** for Glossier, **55 for Bombas** — this is the "75% unknown" problem
- Pattern: When a brand is NOT mentioned, sentiment is `None` (correct, nothing to evaluate)
- When mentioned: overwhelmingly positive (Nike 96%, Glossier 98%, Bombas 99%)
- **Insight**: The "unknown sentiment" problem is actually just "not mentioned = no sentiment"
- **Action**: Don't count non-mentions as "unknown sentiment." Separate "sentiment of mentions" from "overall sentiment." The current 75% unknown rate is actually correct — it means the brand wasn't mentioned in 75% of prompts

### 4. Prompt Quality Observations
- **35 out of 45 prompts are <30 characters** — very short, natural queries ✅
- **No prompts >100 chars** — good, avoids unnatural verbosity ✅
- **Some prompts are too generic**: "athletic shoes vs running shoes comparison" — this is a category education question, not a brand discovery question. Nike correctly NOT mentioned.
- **Problem-solving prompts**: "best running shoes for plantar fasciitis" — AI gives medical/functional advice, not brand recs. Nike not mentioned even though they make shoes for this.
- **Action**: Refine problem-solving prompts to be more purchase-oriented: "which brands make the best shoes for plantar fasciitis" instead of "best running shoes for plantar fasciitis"

### 5. Rank Extraction
- Only **OpenAI and Grok** provide parseable rank data (numbered lists)
- **Gemini uses markdown headers and bullets** — rank extraction returns `None`
- Nike avg rank: 1.8 (usually #1 when mentioned)
- **Action**: Improve rank extraction for Gemini responses (parse markdown structure)

### 6. Knowledge Accuracy
- Nike: `partially_accurate` — interesting for a mega-brand
- Glossier: `partially_accurate`
- Bombas: `accurate`
- **Insight**: Smaller brands may get `accurate` because AI has less info to contradict
- **Action**: Review what's being checked for accuracy. Might need more granular scoring.

### 7. Competitor Discovery Quality
- **Nike**: Top competitors very accurate (Adidas, Under Armour, Lululemon, New Balance) ✅
- **Glossier**: Found CeraVe, The Ordinary, Drunk Elephant — correct beauty peers ✅
- **Bombas**: Found Smartwool, Darn Tough, Stance — correct sock/apparel peers ✅
- **Action**: Competitor discovery working well! Could add competitive gap analysis.

---

## 🛠️ Recommended Improvements

### Prompt Improvements (Priority)
1. **Rephrase problem-solving prompts** to include "which brands" or "recommend": 
   - ❌ "best running shoes for plantar fasciitis"
   - ✅ "which brands make the best running shoes for plantar fasciitis"
2. **Add more comparison prompts** with direct brand competitors: "[Brand] vs [Top Competitor]"
3. **Consider removing purely educational prompts** that never mention brands (e.g., "athletic shoes vs running shoes comparison")

### Metric Improvements
4. **Sentiment**: Only calculate for mentions (don't count non-mentions as "unknown")
5. **Rank extraction for Gemini**: Parse markdown headers/bullets for position
6. **Model-weighted composite score**: Weight Gemini higher (hardest to appear in = most valuable signal)
7. **Add "discovery difficulty" metric**: How competitive is this category? (based on how many other brands are mentioned)

### Display Improvements
8. **Per-model comparison view** on diagnosis results — users want to see "How do I appear on ChatGPT vs Gemini?"
9. **Intent heatmap** — visual matrix of intent×model mention rates
10. **Competitive position chart** — brand rank vs top competitors across prompts

---

## Raw Data Saved
- `/tmp/diag_nike.json` (312KB, 45 prompts × 3 models)
- `/tmp/diag_glossier.json` (303KB, 45 prompts × 3 models)
- `/tmp/diag_bombas.json` (297KB, 45 prompts × 3 models)

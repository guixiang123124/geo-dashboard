# GEO Metrics Definition

This document details the precise calculation logic for the 4 core dimensions of the GEO Framework.

## A. AI Visibility (Weight: 35%)
*Measures "Unaided Brand Awareness" in the AI space.*

### 1. Mention Rate
- **Definition**: The percentage of times a brand appears in the response to a generic category prompt.
- **Formula**: `Count(Responses with Brand) / Total Prompts`
- **Target**: >50% for market leaders.

### 2. Average Rank
- **Definition**: When mentioned in a list, what is the average position?
- **Formula**: `Sum(Rank Positions) / Count(Mentions)`
- **Note**: A rank > 5 is often invisible to users.

### 3. Cross-Model Coverage
- **Definition**: Percentage of tested AI models (ChatGPT, Gemini, Claude, Perplexity) that mention the brand.
- **Formula**: `Count(Models Mentioning) / Total Models`

---

## B. Citation & Authority (Weight: 25%)
*Measures "Trust and Source Preference".*

### 4. Citation Rate
- **Definition**: The percentage of mentions that include a direct link or formatted citation to the brand's domain.
- **Formula**: `Count(Mentions with Citation) / Count(Total Mentions)`
- **Significance**: Higher citation rate = AI treats you as a primary source.

### 5. Authority Preference Score
- **Definition**: In a direct comparison, does the AI prefer your domain over a competitor or generic content site?
- **Measurement**: Head-to-head prompts ("Which source is more reliable for X: [Brand A] or [Brand B]?").

---

## C. Brand Representation (Weight: 25%)
*Measures "Message Accuracy and Quality".*

### 6. Description Accuracy (0-3 Score)
- **0**: **Error**. Factually wrong info.
- **1**: **Vague**. Generic description (e.g., "a clothing brand").
- **2**: **Accurate**. Correct category and basic facts.
- **3**: **Precise**. Correct category, distinct features, and correct target audience.

### 7. Core Message Alignment
- **Definition**: Percentage of brand's "Key Selling Points" (e.g., Sustainable, Affordable) that appear in the AI description.
- **Formula**: `Count(Matched Keywords) / Total Key Keywords`

### 8. Sentiment Label
- **Labels**: Positive, Neutral, Negative.
- **Target**: Positive or "Trusted Neutral".

---

## D. Intent Coverage (Weight: 15%)
*Measures "Contextual Relevance".*

### 9. Intent Coverage Rate
- **Definition**: Percentage of specific user intents (e.g., "Cheap", "Organic", "School") where the brand is recalled.
- **Formula**: `Count(Intents with Recall) / Total Defined Intents`

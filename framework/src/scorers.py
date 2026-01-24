from typing import List
from .models import EvaluationResult, GEOScoreCard, Brand

class GEOScorer:
    """
    Calculates GEO scores based on a list of EvaluationResults.
    Follows the logic defined in METRICS.md.
    """
    
    def calculate_score(self, brand: Brand, results: List[EvaluationResult]) -> GEOScoreCard:
        if not results:
            return GEOScoreCard(
                brand_name=brand.name,
                visibility_score=0, citation_score=0, representation_score=0, intent_score=0, composite_score=0
            )

        # 1. Visibility (35%)
        # Logic: Mention Rate + Rank
        mentions = [r for r in results if r.is_mentioned]
        mention_rate = len(mentions) / len(results)
        
        # Normalize Rank: Rank 1 = 100, Rank 5 = 20, Rank >5 = 0
        rank_points = 0
        for m in mentions:
            if m.rank_position and m.rank_position <= 5:
                rank_points += (6 - m.rank_position) * 20 
        avg_rank_score = (rank_points / len(mentions)) if mentions else 0
        
        visibility_score = (mention_rate * 70) + (avg_rank_score * 0.3) # Layout: 70% rate, 30% rank goodness

        # 2. Citation (25%)
        # Logic: Citation Rate
        citations = [m for m in mentions if m.citation_link]
        citation_rate = len(citations) / len(mentions) if mentions else 0
        citation_score = citation_rate * 100

        # 3. Representation (25%)
        # Logic: Accuracy Score (0-3) + Keyword Matches
        # Using a simple average of the 0-100 normalized accuracy scores
        acc_scores = [m.description_accuracy_score for m in mentions if m.description_accuracy_score is not None]
        avg_acc = (sum(acc_scores) / len(acc_scores)) if acc_scores else 0
        # Normalize 3 -> 100
        representation_score = (avg_acc / 3) * 100

        # 4. Intent (15%)
        # Logic: Coverage of unique intents
        unique_intents = set(r.prompt_text for r in mentions) # Simplified: using prompt text as proxy for intent ID
        # Assuming we passed in 5 intent prompts
        # intent_coverage = len(unique_intents) / total_intents (Mock logic)
        intent_score = 50.0 # Placeholder logic

        # Composite Calculation
        composite = (
            (visibility_score * 0.35) +
            (citation_score * 0.25) +
            (representation_score * 0.25) +
            (intent_score * 0.15)
        )

        return GEOScoreCard(
            brand_name=brand.name,
            visibility_score=round(visibility_score, 2),
            citation_score=round(citation_score, 2),
            representation_score=round(representation_score, 2),
            intent_score=round(intent_score, 2),
            composite_score=round(composite, 2)
        )

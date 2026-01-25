import pytest
from datetime import datetime
from geo_framework.models import EvaluationResult, Brand, AIModel, GEOScoreCard
from geo_framework.scorers import GEOScorer

def test_calculate_score_empty():
    scorer = GEOScorer()
    brand = Brand(name="TestBrand", domain="test.com")
    result = scorer.calculate_score(brand, [])
    assert result.composite_score == 0
    assert result.visibility_score == 0

def test_calculate_score_basic():
    scorer = GEOScorer()
    brand = Brand(name="TestBrand", domain="test.com")
    
    # Mock Results
    results = [
        EvaluationResult(
            model=AIModel.CHATGPT,
            prompt_text="p1", 
            response_text="r1",
            is_mentioned=True,
            rank_position=1, # 100 pts for rank
            citation_link="http://test.com",
            description_accuracy_score=3
        ),
        EvaluationResult(
            model=AIModel.GEMINI,
            prompt_text="p2",
            response_text="r2", 
            is_mentioned=False # 0 pts
        )
    ]
    
    score_card = scorer.calculate_score(brand, results)
    
    # Visibility:
    # Mention Rate: 1/2 = 0.5 * 70 = 35
    # Rank: (1 mention) Rank 1 -> (6-1)*20 = 100. Avg = 100. 100 * 0.3 = 30.
    # Total Visibility = 65
    assert score_card.visibility_score == 65.0
    
    # Citation:
    # 1 mention, 1 citation -> 100% * 100 = 100
    assert score_card.citation_score == 100.0
    
    # Representation:
    # 1 mention, acc 3 -> (3/3)*100 = 100
    assert score_card.representation_score == 100.0
    
    # Intent:
    # Placeholder logic in scoreres.py is fixed at 50.0
    assert score_card.intent_score == 50.0
    
    # Composite:
    # 65 * 0.35 = 22.75
    # 100 * 0.25 = 25
    # 100 * 0.25 = 25
    # 50 * 0.15 = 7.5
    # Total = 80.25
    assert score_card.composite_score == 80.25

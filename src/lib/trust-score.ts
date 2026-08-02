export interface TrustScoreFactors {
  identityVerificationStatus: 'pending' | 'identity_submitted' | 'under_review' | 'verified' | 'premium' | "featured" | null;
  portfolioCompleteness: number; // 0 to 1
  completedSales: number;
  successfulDeliveries: number;
  profileCompleteness: number; // 0 to 1
  verifiedReviewsCount: number;
  averageResponseTimeHours?: number;
}

export const TRUST_SCORE_WEIGHTS = {
  identityVerification: 30,
  portfolioCompleteness: 15,
  completedSales: 15,
  successfulDeliveries: 10,
  profileCompletion: 15,
  verifiedReviews: 10,
  responseTime: 5,
};

/**
 * Calculates the trust score for an artist out of 100.
 */
export function calculateTrustScore(factors: TrustScoreFactors): number {
  let score = 0;

  // 1. Identity Verification (Max 30)
  if (['verified', 'premium', 'featured'].includes(factors.identityVerificationStatus || '')) {
    score += TRUST_SCORE_WEIGHTS.identityVerification;
  } else if (factors.identityVerificationStatus === 'under_review') {
    score += TRUST_SCORE_WEIGHTS.identityVerification * 0.5; // Partial points for submitting
  }

  // 2. Portfolio Completeness (Max 15)
  score += Math.min(1, factors.portfolioCompleteness) * TRUST_SCORE_WEIGHTS.portfolioCompleteness;

  // 3. Completed Sales (Max 15)
  // Let's assume 10 sales gives maximum points
  const salesFactor = Math.min(1, factors.completedSales / 10);
  score += salesFactor * TRUST_SCORE_WEIGHTS.completedSales;

  // 4. Successful Deliveries (Max 10)
  // Let's assume 10 deliveries gives maximum points
  const deliveriesFactor = Math.min(1, factors.successfulDeliveries / 10);
  score += deliveriesFactor * TRUST_SCORE_WEIGHTS.successfulDeliveries;

  // 5. Profile Completion (Max 15)
  score += Math.min(1, factors.profileCompleteness) * TRUST_SCORE_WEIGHTS.profileCompletion;

  // 6. Verified Reviews (Max 10)
  // Let's assume 5 verified reviews gives maximum points
  const reviewsFactor = Math.min(1, factors.verifiedReviewsCount / 5);
  score += reviewsFactor * TRUST_SCORE_WEIGHTS.verifiedReviews;

  // 7. Response Time (Max 5)
  // Assuming <= 24 hours is optimal (5 points), degrading up to 72 hours (0 points)
  if (factors.averageResponseTimeHours !== undefined) {
    if (factors.averageResponseTimeHours <= 24) {
      score += TRUST_SCORE_WEIGHTS.responseTime;
    } else if (factors.averageResponseTimeHours <= 72) {
      const penalty = (factors.averageResponseTimeHours - 24) / 48; // 0 to 1
      score += (1 - penalty) * TRUST_SCORE_WEIGHTS.responseTime;
    }
  } else {
    // If no data, give average points (e.g. 2.5) to not penalize new artists too heavily
    score += TRUST_SCORE_WEIGHTS.responseTime * 0.5;
  }

  return Math.round(score);
}

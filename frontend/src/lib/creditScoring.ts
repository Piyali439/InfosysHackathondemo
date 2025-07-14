interface CreditData {
  electricity_bill: number;
  gas_bill: number;
  water_bill: number;
  monthly_data_recharge: number;
  yearly_data_recharge: number;
  payment_delay: number;
  area_type: 'Urban' | 'Rural';
  location_stability: 'Stable' | 'Temporary' | 'Frequent';
}

export const calculateCreditScore = (data: CreditData) => {
  let score = 500; // Base score
  let confidence = 70; // Base confidence

  // Bill payment consistency (30% weight)
  const totalBills = data.electricity_bill + data.gas_bill + data.water_bill;
  if (totalBills > 0) {
    if (totalBills < 2000) score += 50; // Low bills indicate financial discipline
    else if (totalBills < 5000) score += 30;
    else score += 10;
    confidence += 15;
  }

  // Data recharge patterns (25% weight)
  const dataConsistency = data.yearly_data_recharge / (data.monthly_data_recharge * 12);
  if (dataConsistency > 0.8 && dataConsistency < 1.2) {
    score += 40; // Consistent data usage
    confidence += 10;
  }

  // Payment delay impact (35% weight)
  if (data.payment_delay === 0) {
    score += 80; // No delays
    confidence += 20;
  } else if (data.payment_delay <= 2) {
    score += 40; // Minor delays
    confidence += 10;
  } else if (data.payment_delay <= 5) {
    score += 10; // Moderate delays
  } else {
    score -= 50; // Significant delays
    confidence -= 10;
  }

  // Area type and location stability (10% weight)
  if (data.area_type === 'Urban') {
    score += 20;
    confidence += 5;
  } else {
    score += 10; // Rural areas get some credit for stability
  }

  if (data.location_stability === 'Stable') {
    score += 30;
    confidence += 10;
  } else if (data.location_stability === 'Temporary') {
    score += 10;
  } else {
    score -= 20; // Frequent movement is risky
    confidence -= 5;
  }

  // Normalize score to 300-850 range
  score = Math.max(300, Math.min(850, score));
  confidence = Math.max(50, Math.min(95, confidence));

  // Determine risk level
  let risk_level: 'Low Risk' | 'Moderate Risk' | 'High Risk';
  if (score >= 700) risk_level = 'Low Risk';
  else if (score >= 550) risk_level = 'Moderate Risk';
  else risk_level = 'High Risk';

  return {
    credit_score: Math.round(score),
    confidence_percentage: Math.round(confidence),
    risk_level,
  };
};

export const getRecommendedBanks = (creditScore: number, riskLevel: string) => {
  const banks = [
    {
      id: '1',
      name: 'SBI Micro Finance',
      logo_url: 'https://images.pexels.com/photos/259200/pexels-photo-259200.jpeg?auto=compress&cs=tinysrgb&w=100&h=100',
      min_credit_score: 300,
      max_loan_amount: 50000,
      interest_rate: 12.5,
      processing_fee: 2.5,
      risk_levels: ['Low Risk', 'Moderate Risk', 'High Risk'],
    },
    {
      id: '2',
      name: 'HDFC Bank Micro Credit',
      logo_url: 'https://images.pexels.com/photos/259200/pexels-photo-259200.jpeg?auto=compress&cs=tinysrgb&w=100&h=100',
      min_credit_score: 500,
      max_loan_amount: 100000,
      interest_rate: 10.8,
      processing_fee: 2.0,
      risk_levels: ['Low Risk', 'Moderate Risk'],
    },
    {
      id: '3',
      name: 'ICICI Pradhan Mantri Mudra',
      logo_url: 'https://images.pexels.com/photos/259200/pexels-photo-259200.jpeg?auto=compress&cs=tinysrgb&w=100&h=100',
      min_credit_score: 600,
      max_loan_amount: 200000,
      interest_rate: 9.5,
      processing_fee: 1.5,
      risk_levels: ['Low Risk'],
    },
    {
      id: '4',
      name: 'Axis Bank Rural Credit',
      logo_url: 'https://images.pexels.com/photos/259200/pexels-photo-259200.jpeg?auto=compress&cs=tinysrgb&w=100&h=100',
      min_credit_score: 450,
      max_loan_amount: 75000,
      interest_rate: 11.5,
      processing_fee: 2.2,
      risk_levels: ['Low Risk', 'Moderate Risk'],
    },
  ];

  return banks.filter(bank => 
    creditScore >= bank.min_credit_score && 
    bank.risk_levels.includes(riskLevel)
  );
};
export interface User {
  id: string;
  email: string;
  name: string;
  phone: string;
  aadhaar: string;
  created_at: string;
  is_verified: boolean;
}

export interface CreditAssessment {
  id: string;
  user_id: string;
  electricity_bill: number;
  gas_bill: number;
  water_bill: number;
  monthly_data_recharge: number;
  yearly_data_recharge: number;
  payment_delay: number;
  area_type: 'Urban' | 'Rural';
  location_stability: 'Stable' | 'Temporary' | 'Frequent';
  credit_score: number;
  risk_level: 'Low Risk' | 'Moderate Risk' | 'High Risk';
  confidence_percentage: number;
  assessed_at: string;
}

export interface Loan {
  id: string;
  user_id: string;
  bank_name: string;
  amount: number;
  issue_date: string;
  due_date: string;
  status: 'Active' | 'Completed' | 'Overdue' | 'Default';
  created_at: string;
}

export interface Bank {
  id: string;
  name: string;
  logo_url: string;
  min_credit_score: number;
  max_loan_amount: number;
  interest_rate: number;
  processing_fee: number;
  risk_levels: string[];
}
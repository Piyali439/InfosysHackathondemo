import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calculator, TrendingUp, AlertTriangle, CheckCircle, BarChart3 } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { calculateCreditScore, getRecommendedBanks } from '../lib/creditScoring';
import CreditScoreChart from '../components/CreditScoreChart';
import LoanApplication from '../components/LoanApplication';

const CreditAssessment: React.FC = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [formData, setFormData] = useState({
    electricity_bill: '',
    gas_bill: '',
    water_bill: '',
    monthly_data_recharge: '',
    yearly_data_recharge: '',
    payment_delay: '',
    area_type: 'Urban',
    location_stability: 'Stable',
  });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [recommendedBanks, setRecommendedBanks] = useState<any[]>([]);
  const [showCharts, setShowCharts] = useState(false);
  const [showLoanApplication, setShowLoanApplication] = useState(false);
  const [assessmentData, setAssessmentData] = useState<any>(null);

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };
    fetchUser();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Convert string inputs to numbers
      const assessmentData = {
        electricity_bill: parseFloat(formData.electricity_bill),
        gas_bill: parseFloat(formData.gas_bill),
        water_bill: parseFloat(formData.water_bill),
        monthly_data_recharge: parseFloat(formData.monthly_data_recharge),
        yearly_data_recharge: parseFloat(formData.yearly_data_recharge),
        payment_delay: parseInt(formData.payment_delay),
        area_type: formData.area_type as 'Urban' | 'Rural',
        location_stability: formData.location_stability as 'Stable' | 'Temporary' | 'Frequent',
      };

      // Calculate credit score
      const creditResult = calculateCreditScore(assessmentData);
      
      // Get recommended banks
      const banks = getRecommendedBanks(creditResult.credit_score, creditResult.risk_level);

      // Save to database
      const { data, error } = await supabase
        .from('credit_assessments')
        .insert([
          {
            user_id: user.id,
            ...assessmentData,
            ...creditResult,
            assessed_at: new Date().toISOString(),
          },
        ]);

      if (error) {
        console.error('Error saving assessment:', error);
      }

      setResult(creditResult);
      setRecommendedBanks(banks);
      setAssessmentData(assessmentData);
    } catch (error) {
      console.error('Error calculating credit score:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRiskColor = (riskLevel: string) => {
    switch (riskLevel) {
      case 'Low Risk': return 'text-green-600 bg-green-100';
      case 'Moderate Risk': return 'text-yellow-600 bg-yellow-100';
      case 'High Risk': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  if (result) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Results Header */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="text-center">
            <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-4" />
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Your Credit Assessment Results
            </h1>
            <p className="text-gray-600">
              Based on your financial profile and behavior patterns
            </p>
          </div>
        </div>

        {/* Credit Score Display */}
        <div className="bg-gradient-to-r from-blue-500 to-green-500 rounded-lg shadow-lg p-8 text-white">
          <div className="text-center">
            <h2 className="text-2xl font-semibold mb-4">Your Trust Score</h2>
            <div className="text-6xl font-bold mb-2">{result.credit_score}</div>
            <div className="mb-4">
              <span className={`px-4 py-2 rounded-full text-lg font-medium ${getRiskColor(result.risk_level)}`}>
                {result.risk_level}
              </span>
            </div>
            <p className="text-xl">
              Confidence Level: {result.confidence_percentage}%
            </p>
          </div>
        </div>

        {/* Risk Level Explanation */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">What This Means</h3>
          {result.risk_level === 'High Risk' ? (
            <div className="bg-red-50 p-4 rounded-lg">
              <div className="flex items-center">
                <AlertTriangle className="h-6 w-6 text-red-600 mr-2" />
                <div>
                  <p className="font-medium text-red-800">High Risk Assessment</p>
                  <p className="text-red-700 mt-1">
                    Your current financial profile indicates higher risk. We recommend focusing on 
                    improving your payment habits and financial stability. You can reapply after 3 months.
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-green-50 p-4 rounded-lg">
              <div className="flex items-center">
                <CheckCircle className="h-6 w-6 text-green-600 mr-2" />
                <div>
                  <p className="font-medium text-green-800">
                    {result.risk_level === 'Low Risk' ? 'Excellent' : 'Good'} Credit Profile
                  </p>
                  <p className="text-green-700 mt-1">
                    Your financial behavior shows {result.risk_level === 'Low Risk' ? 'excellent' : 'good'} 
                    creditworthiness. You're eligible for loans from multiple banks.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex flex-wrap gap-4 justify-center">
            <button
              onClick={() => setShowCharts(!showCharts)}
              className="flex items-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              <BarChart3 className="h-4 w-4" />
              <span>{showCharts ? 'Hide' : 'Show'} Detailed Analysis</span>
            </button>
            
            {result.risk_level !== 'High Risk' && (
              <button
                onClick={() => setShowLoanApplication(!showLoanApplication)}
                className="flex items-center space-x-2 px-6 py-3 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
              >
                <TrendingUp className="h-4 w-4" />
                <span>{showLoanApplication ? 'Hide' : 'Apply for'} Loan</span>
              </button>
            )}
            
            <button
              onClick={() => navigate('/dashboard')}
              className="px-6 py-3 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
            >
              Go to Dashboard
            </button>
          </div>
        </div>

        {/* Credit Score Charts */}
        {showCharts && assessmentData && (
          <CreditScoreChart
            assessmentData={assessmentData}
            creditScore={result.credit_score}
            riskLevel={result.risk_level}
          />
        )}

        {/* Loan Application */}
        {showLoanApplication && result.risk_level !== 'High Risk' && (
          <div>
            <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Apply for Loan</h3>
              <p className="text-gray-600">
                Based on your credit score, you're eligible for loans from the following banks:
              </p>
            </div>
            <LoanApplication
              banks={recommendedBanks}
              creditScore={result.credit_score}
              riskLevel={result.risk_level}
              onApplicationSubmit={() => {
                setShowLoanApplication(false);
                navigate('/loans');
              }}
            />
          </div>
        )}

        {/* Recommended Banks */}
        {recommendedBanks.length > 0 && !showLoanApplication && (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Recommended Banks</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {recommendedBanks.map((bank) => (
                <div key={bank.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-medium text-gray-900">{bank.name}</h4>
                    <img 
                      src={bank.logo_url} 
                      alt={bank.name}
                      className="h-8 w-8 rounded"
                    />
                  </div>
                  <div className="space-y-2 text-sm text-gray-600">
                    <p>Max Loan: ₹{bank.max_loan_amount.toLocaleString()}</p>
                    <p>Interest Rate: {bank.interest_rate}%</p>
                    <p>Processing Fee: {bank.processing_fee}%</p>
                  </div>
                  <button className="w-full mt-4 bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition-colors">
                    Apply Now
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="text-center mb-6">
          <Calculator className="h-12 w-12 text-blue-600 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900">Credit Assessment</h1>
          <p className="text-gray-600">
            Provide your financial information to calculate your credit score
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Monthly Electricity Bill (₹)
              </label>
              <input
                type="number"
                name="electricity_bill"
                value={formData.electricity_bill}
                onChange={handleChange}
                required
                min="0"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter amount"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Monthly Gas Bill (₹)
              </label>
              <input
                type="number"
                name="gas_bill"
                value={formData.gas_bill}
                onChange={handleChange}
                required
                min="0"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter amount"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Monthly Water Bill (₹)
              </label>
              <input
                type="number"
                name="water_bill"
                value={formData.water_bill}
                onChange={handleChange}
                required
                min="0"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter amount"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Monthly Data Recharge (₹)
              </label>
              <input
                type="number"
                name="monthly_data_recharge"
                value={formData.monthly_data_recharge}
                onChange={handleChange}
                required
                min="0"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter amount"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Yearly Data Recharge (₹)
              </label>
              <input
                type="number"
                name="yearly_data_recharge"
                value={formData.yearly_data_recharge}
                onChange={handleChange}
                required
                min="0"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter amount"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Payment Delay (days)
              </label>
              <input
                type="number"
                name="payment_delay"
                value={formData.payment_delay}
                onChange={handleChange}
                required
                min="0"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Average delay in days"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Area Type
              </label>
              <select
                name="area_type"
                value={formData.area_type}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="Urban">Urban</option>
                <option value="Rural">Rural</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Location Stability
              </label>
              <select
                name="location_stability"
                value={formData.location_stability}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="Stable">Stable (Same location for 2+ years)</option>
                <option value="Temporary">Temporary (1-2 years)</option>
                <option value="Frequent">Frequent (Changes often)</option>
              </select>
            </div>
          </div>

          <div className="pt-4">
            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center items-center px-4 py-3 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Calculating...
                </>
              ) : (
                <>
                  <TrendingUp className="h-4 w-4 mr-2" />
                  Calculate Credit Score
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreditAssessment;
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Shield, 
  TrendingUp, 
  DollarSign, 
  Clock, 
  CheckCircle, 
  AlertTriangle,
  Users,
  BookOpen,
  Download,
  Play
} from 'lucide-react';

const Demo: React.FC = () => {
  const [selectedUser, setSelectedUser] = useState<'existing' | 'new'>('existing');

  const existingUserData = {
    name: 'Rajesh Kumar',
    credit_score: 678,
    risk_level: 'Low Risk',
    confidence: 87,
    total_loans: 125000,
    active_loans: 2,
    completed_loans: 3,
    loans: [
      {
        id: 1,
        bank_name: 'SBI Micro Finance',
        amount: 50000,
        status: 'Active',
        issue_date: '2024-09-15',
        due_date: '2025-03-15',
      },
      {
        id: 2,
        bank_name: 'HDFC Bank Micro Credit',
        amount: 75000,
        status: 'Active',
        issue_date: '2024-10-01',
        due_date: '2025-04-01',
      },
      {
        id: 3,
        bank_name: 'ICICI Pradhan Mantri Mudra',
        amount: 35000,
        status: 'Completed',
        issue_date: '2024-06-01',
        due_date: '2024-12-01',
      },
    ],
  };

  const newUserData = {
    name: 'Priya Sharma',
    assessment_data: {
      electricity_bill: 1800,
      gas_bill: 900,
      water_bill: 500,
      monthly_data_recharge: 399,
      yearly_data_recharge: 4800,
      payment_delay: 2,
      area_type: 'Urban',
      location_stability: 'Stable',
    },
    calculated_score: 612,
    risk_level: 'Moderate Risk',
    confidence: 78,
  };

  const getRiskColor = (riskLevel: string) => {
    switch (riskLevel) {
      case 'Low Risk': return 'text-green-600 bg-green-100';
      case 'Moderate Risk': return 'text-yellow-600 bg-yellow-100';
      case 'High Risk': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active': return 'text-blue-600 bg-blue-100';
      case 'Completed': return 'text-green-600 bg-green-100';
      case 'Overdue': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const financialTips = [
    "Pay your bills on time to improve your credit score",
    "Keep your monthly expenses below 50% of your income",
    "Consider saving 20% of your income for emergencies",
    "Maintain consistent data recharge patterns",
    "Stay in one location for better stability score"
  ];

  const recommendedBanks = [
    {
      id: 1,
      name: 'SBI Micro Finance',
      max_loan_amount: 50000,
      interest_rate: 12.5,
      processing_fee: 2.5,
    },
    {
      id: 2,
      name: 'HDFC Bank Micro Credit',
      max_loan_amount: 100000,
      interest_rate: 10.8,
      processing_fee: 2.0,
    },
    {
      id: 3,
      name: 'Axis Bank Rural Credit',
      max_loan_amount: 75000,
      interest_rate: 11.5,
      processing_fee: 2.2,
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <Shield className="h-8 w-8 text-blue-600" />
              <span className="text-xl font-bold text-gray-900">TrustLend</span>
              <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-full">
                DEMO
              </span>
            </div>
            <div className="flex items-center space-x-4">
              <Link
                to="/login"
                className="text-gray-700 hover:text-blue-600 px-3 py-2 text-sm font-medium transition-colors"
              >
                Login
              </Link>
              <Link
                to="/register"
                className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 transition-colors"
              >
                Register
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Demo Selection */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="text-center mb-6">
            <Play className="h-12 w-12 text-blue-600 mx-auto mb-4" />
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              TrustLend Demo
            </h1>
            <p className="text-gray-600">
              Experience how TrustLend revolutionizes microfinance with AI-powered credit assessment
            </p>
          </div>

          <div className="flex justify-center space-x-4 mb-6">
            <button
              onClick={() => setSelectedUser('existing')}
              className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                selectedUser === 'existing'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Existing User Dashboard
            </button>
            <button
              onClick={() => setSelectedUser('new')}
              className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                selectedUser === 'new'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              New User Assessment
            </button>
          </div>
        </div>

        {selectedUser === 'existing' ? (
          <div className="space-y-6">
            {/* User Header */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    Welcome, {existingUserData.name}
                  </h2>
                  <p className="text-gray-600">
                    Your financial journey continues...
                  </p>
                </div>
                <Shield className="h-12 w-12 text-blue-600" />
              </div>
            </div>

            {/* Credit Score */}
            <div className="bg-gradient-to-r from-blue-500 to-green-500 rounded-lg shadow-lg p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-semibold">Your Trust Score</h3>
                  <div className="flex items-center space-x-4 mt-2">
                    <div className="text-4xl font-bold">{existingUserData.credit_score}</div>
                    <div className="text-lg">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${getRiskColor(existingUserData.risk_level)}`}>
                        {existingUserData.risk_level}
                      </span>
                    </div>
                  </div>
                  <p className="text-blue-100 mt-2">
                    Confidence: {existingUserData.confidence}%
                  </p>
                </div>
                <TrendingUp className="h-16 w-16 text-blue-200" />
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center">
                  <DollarSign className="h-8 w-8 text-green-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Total Loans</p>
                    <p className="text-2xl font-bold text-gray-900">
                      ₹{existingUserData.total_loans.toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center">
                  <Users className="h-8 w-8 text-blue-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Active Loans</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {existingUserData.active_loans}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center">
                  <CheckCircle className="h-8 w-8 text-green-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Completed</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {existingUserData.completed_loans}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Loans */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Loans</h3>
              <div className="space-y-3">
                {existingUserData.loans.map((loan) => (
                  <div key={loan.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">{loan.bank_name}</p>
                      <p className="text-sm text-gray-600">₹{loan.amount.toLocaleString()}</p>
                    </div>
                    <div className="text-right">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(loan.status)}`}>
                        {loan.status}
                      </span>
                      <p className="text-xs text-gray-500 mt-1">
                        Due: {new Date(loan.due_date).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Financial Tips */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center mb-4">
                <BookOpen className="h-6 w-6 text-blue-600 mr-2" />
                <h3 className="text-lg font-medium text-gray-900">Financial Tips</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {financialTips.map((tip, index) => (
                  <div key={index} className="flex items-start space-x-3 p-3 bg-blue-50 rounded-lg">
                    <CheckCircle className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                    <p className="text-sm text-gray-700">{tip}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* New User Assessment */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  Credit Assessment for {newUserData.name}
                </h2>
                <p className="text-gray-600">
                  Real-time credit score calculation based on alternative data
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-gray-900">Input Data</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Electricity Bill:</span>
                      <span className="font-medium">₹{newUserData.assessment_data.electricity_bill}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Gas Bill:</span>
                      <span className="font-medium">₹{newUserData.assessment_data.gas_bill}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Water Bill:</span>
                      <span className="font-medium">₹{newUserData.assessment_data.water_bill}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Monthly Data:</span>
                      <span className="font-medium">₹{newUserData.assessment_data.monthly_data_recharge}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Payment Delay:</span>
                      <span className="font-medium">{newUserData.assessment_data.payment_delay} days</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Area Type:</span>
                      <span className="font-medium">{newUserData.assessment_data.area_type}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Location Stability:</span>
                      <span className="font-medium">{newUserData.assessment_data.location_stability}</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-gray-900">AI Analysis</h3>
                  <div className="bg-gradient-to-r from-blue-500 to-green-500 rounded-lg p-6 text-white">
                    <div className="text-center">
                      <div className="text-4xl font-bold mb-2">{newUserData.calculated_score}</div>
                      <div className="mb-2">
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${getRiskColor(newUserData.risk_level)}`}>
                          {newUserData.risk_level}
                        </span>
                      </div>
                      <p className="text-blue-100">
                        Confidence: {newUserData.confidence}%
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Algorithm Explanation */}
              <div className="bg-blue-50 p-4 rounded-lg mb-6">
                <h4 className="font-medium text-blue-900 mb-2">How We Calculate Your Score:</h4>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Bill payment consistency (30% weight)</li>
                  <li>• Data usage patterns (25% weight)</li>
                  <li>• Payment delay history (35% weight)</li>
                  <li>• Location stability (10% weight)</li>
                </ul>
              </div>
            </div>

            {/* Recommended Banks */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Recommended Banks</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {recommendedBanks.map((bank) => (
                  <div key={bank.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                    <h4 className="font-medium text-gray-900 mb-3">{bank.name}</h4>
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

            {/* Next Steps */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Next Steps</h3>
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <span className="text-gray-700">Credit assessment completed</span>
                </div>
                <div className="flex items-center space-x-3">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <span className="text-gray-700">Banks identified and matched</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Clock className="h-5 w-5 text-blue-600" />
                  <span className="text-gray-700">Ready to apply for loans</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Call to Action */}
        <div className="bg-white rounded-lg shadow-sm p-6 text-center">
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Ready to Start Your Financial Journey?
          </h3>
          <p className="text-gray-600 mb-4">
            Join thousands of users who have improved their financial lives with TrustLend
          </p>
          <div className="flex justify-center space-x-4">
            <Link
              to="/register"
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Register Now
            </Link>
            <Link
              to="/login"
              className="bg-gray-100 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Demo;
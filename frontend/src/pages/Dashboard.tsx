import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  TrendingUp, 
  Shield, 
  AlertCircle, 
  CheckCircle, 
  Clock, 
  DollarSign, 
  Users, 
  BookOpen,
  Download
} from 'lucide-react';
import { supabase } from '../lib/supabase';

const Dashboard: React.FC = () => {
  const [user, setUser] = useState<any>(null);
  const [creditScore, setCreditScore] = useState<any>(null);
  const [loans, setLoans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        setUser(user);

        if (user) {
          // Fetch credit assessment
          const { data: assessmentData } = await supabase
            .from('credit_assessments')
            .select('*')
            .eq('user_id', user.id)
            .order('assessed_at', { ascending: false })
            .limit(1);

          if (assessmentData && assessmentData.length > 0) {
            setCreditScore(assessmentData[0]);
          }

          // Fetch loans
          const { data: loansData } = await supabase
            .from('loans')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false });

          setLoans(loansData || []);
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Welcome, {user?.user_metadata?.name || 'User'}
            </h1>
            <p className="text-gray-600">
              Your financial journey starts here
            </p>
          </div>
          <Shield className="h-12 w-12 text-blue-600" />
        </div>
      </div>

      {/* Credit Score Card */}
      {creditScore ? (
        <div className="bg-gradient-to-r from-blue-500 to-green-500 rounded-lg shadow-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold">Your Trust Score</h2>
              <div className="flex items-center space-x-4 mt-2">
                <div className="text-4xl font-bold">{creditScore.credit_score}</div>
                <div className="text-lg">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getRiskColor(creditScore.risk_level)}`}>
                    {creditScore.risk_level}
                  </span>
                </div>
              </div>
              <p className="text-blue-100 mt-2">
                Confidence: {creditScore.confidence_percentage}%
              </p>
            </div>
            <TrendingUp className="h-16 w-16 text-blue-200" />
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm p-6 border-2 border-dashed border-gray-300">
          <div className="text-center">
            <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Complete Your Credit Assessment
            </h3>
            <p className="text-gray-600 mb-4">
              Get your personalized credit score and unlock loan opportunities
            </p>
            <Link
              to="/assessment"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 transition-colors"
            >
              Start Assessment
            </Link>
          </div>
        </div>
      )}

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center">
            <DollarSign className="h-8 w-8 text-green-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Loans</p>
              <p className="text-2xl font-bold text-gray-900">
                ₹{loans.reduce((sum, loan) => sum + loan.amount, 0).toLocaleString()}
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
                {loans.filter(loan => loan.status === 'Active').length}
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
                {loans.filter(loan => loan.status === 'Completed').length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Loans */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-900">Recent Loans</h3>
          <Link
            to="/loans"
            className="text-blue-600 hover:text-blue-700 text-sm font-medium"
          >
            View All
          </Link>
        </div>
        
        {loans.length > 0 ? (
          <div className="space-y-3">
            {loans.slice(0, 3).map((loan) => (
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
        ) : (
          <div className="text-center py-8">
            <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 mb-4">No loans yet. Complete your assessment to get started!</p>
            {creditScore && (
              <Link
                to="/loans"
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                Apply for Loan
              </Link>
            )}
          </div>
        )}
      </div>

      {/* Financial Literacy Tips */}
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

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <Link
            to="/assessment"
            className="flex items-center space-x-3 p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
          >
            <TrendingUp className="h-6 w-6 text-blue-600" />
            <span className="font-medium text-gray-900">Update Credit Score</span>
          </Link>
          
          <Link
            to="/loans"
            className="flex items-center space-x-3 p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors"
          >
            <DollarSign className="h-6 w-6 text-green-600" />
            <span className="font-medium text-gray-900">Apply for Loan</span>
          </Link>
          
          <button className="flex items-center space-x-3 p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors">
            <Download className="h-6 w-6 text-purple-600" />
            <span className="font-medium text-gray-900">Download Report</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
import React, { useState, useEffect } from 'react';
import { DollarSign, Calendar, TrendingUp, AlertCircle, CheckCircle, Clock, FileText, Download } from 'lucide-react';
import { supabase } from '../lib/supabase';
import LoanApplication from '../components/LoanApplication';
import { getRecommendedBanks } from '../lib/creditScoring';
import jsPDF from 'jspdf';

interface Loan {
  id: string;
  bank_name: string;
  amount: number;
  issue_date: string;
  due_date: string;
  status: string;
  loan_purpose?: string;
  created_at: string;
}

const Loans: React.FC = () => {
  const [loans, setLoans] = useState<Loan[]>([]);
  const [creditScore, setCreditScore] = useState<number>(0);
  const [riskLevel, setRiskLevel] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [showApplication, setShowApplication] = useState(false);
  const [recommendedBanks, setRecommendedBanks] = useState<any[]>([]);

  useEffect(() => {
    fetchLoansAndCreditData();
  }, []);

  const fetchLoansAndCreditData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        // Fetch loans
        const { data: loansData } = await supabase
          .from('loans')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        setLoans(loansData || []);

        // Fetch latest credit assessment
        const { data: assessmentData } = await supabase
          .from('credit_assessments')
          .select('*')
          .eq('user_id', user.id)
          .order('assessed_at', { ascending: false })
          .limit(1);

        if (assessmentData && assessmentData.length > 0) {
          const assessment = assessmentData[0];
          setCreditScore(assessment.credit_score);
          setRiskLevel(assessment.risk_level);
          
          // Get recommended banks
          const banks = getRecommendedBanks(assessment.credit_score, assessment.risk_level);
          setRecommendedBanks(banks);
        }
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active': return 'text-blue-600 bg-blue-100';
      case 'Completed': return 'text-green-600 bg-green-100';
      case 'Overdue': return 'text-red-600 bg-red-100';
      case 'Pending': return 'text-yellow-600 bg-yellow-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Active': return <Clock className="h-4 w-4" />;
      case 'Completed': return <CheckCircle className="h-4 w-4" />;
      case 'Overdue': return <AlertCircle className="h-4 w-4" />;
      case 'Pending': return <Clock className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const calculateDaysRemaining = (dueDate: string) => {
    const due = new Date(dueDate);
    const today = new Date();
    const diffTime = due.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const generateLoanReport = () => {
    const doc = new jsPDF();
    
    // Header
    doc.setFontSize(20);
    doc.text('TrustLend - Loan Report', 20, 30);
    
    doc.setFontSize(12);
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 20, 45);
    doc.text(`Credit Score: ${creditScore}`, 20, 55);
    doc.text(`Risk Level: ${riskLevel}`, 20, 65);
    
    // Loans summary
    doc.setFontSize(16);
    doc.text('Loan Summary', 20, 85);
    
    let yPosition = 100;
    loans.forEach((loan, index) => {
      doc.setFontSize(12);
      doc.text(`${index + 1}. ${loan.bank_name}`, 20, yPosition);
      doc.text(`Amount: ₹${loan.amount.toLocaleString()}`, 30, yPosition + 10);
      doc.text(`Status: ${loan.status}`, 30, yPosition + 20);
      doc.text(`Due Date: ${new Date(loan.due_date).toLocaleDateString()}`, 30, yPosition + 30);
      yPosition += 50;
    });
    
    doc.save('trustlend-loan-report.pdf');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (riskLevel === 'High Risk') {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="text-center">
            <AlertCircle className="h-16 w-16 text-red-600 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Loan Application Temporarily Unavailable
            </h1>
            <p className="text-gray-600 mb-6">
              Based on your current credit assessment, you're classified as High Risk. 
              Please improve your financial profile and try again after 3 months.
            </p>
            
            <div className="bg-red-50 p-6 rounded-lg mb-6">
              <h3 className="text-lg font-semibold text-red-800 mb-3">
                Recommendations to Improve Your Score:
              </h3>
              <ul className="text-left text-red-700 space-y-2">
                <li>• Pay all bills on time without delays</li>
                <li>• Maintain consistent monthly expenses</li>
                <li>• Keep your data recharge patterns regular</li>
                <li>• Stay in one location for better stability</li>
                <li>• Reduce overall monthly expenses if possible</li>
              </ul>
            </div>
            
            <div className="flex justify-center space-x-4">
              <button
                onClick={() => window.location.href = '/assessment'}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Retake Assessment
              </button>
              <button
                onClick={() => window.location.href = '/dashboard'}
                className="bg-gray-100 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Go to Dashboard
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">My Loans</h1>
            <p className="text-gray-600">
              Manage your loans and apply for new ones
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-right">
              <p className="text-sm text-gray-600">Credit Score</p>
              <p className="text-2xl font-bold text-blue-600">{creditScore}</p>
            </div>
            <button
              onClick={generateLoanReport}
              className="flex items-center space-x-2 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors"
            >
              <Download className="h-4 w-4" />
              <span>Download Report</span>
            </button>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center">
            <DollarSign className="h-8 w-8 text-green-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Borrowed</p>
              <p className="text-2xl font-bold text-gray-900">
                ₹{loans.reduce((sum, loan) => sum + loan.amount, 0).toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center">
            <Clock className="h-8 w-8 text-blue-600" />
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

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center">
            <TrendingUp className="h-8 w-8 text-purple-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Available Banks</p>
              <p className="text-2xl font-bold text-gray-900">
                {recommendedBanks.length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Apply for New Loan Button */}
      {!showApplication && recommendedBanks.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="text-center">
            <FileText className="h-12 w-12 text-blue-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Ready to Apply for a New Loan?
            </h3>
            <p className="text-gray-600 mb-4">
              Based on your credit score of {creditScore}, you're eligible for loans from {recommendedBanks.length} banks.
            </p>
            <button
              onClick={() => setShowApplication(true)}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Apply for Loan
            </button>
          </div>
        </div>
      )}

      {/* Loan Application Form */}
      {showApplication && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Apply for New Loan</h2>
            <button
              onClick={() => setShowApplication(false)}
              className="text-gray-600 hover:text-gray-800"
            >
              Cancel
            </button>
          </div>
          <LoanApplication
            banks={recommendedBanks}
            creditScore={creditScore}
            riskLevel={riskLevel}
            onApplicationSubmit={() => {
              setShowApplication(false);
              fetchLoansAndCreditData();
            }}
          />
        </div>
      )}

      {/* Existing Loans */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Your Loans</h3>
        
        {loans.length > 0 ? (
          <div className="space-y-4">
            {loans.map((loan) => {
              const daysRemaining = calculateDaysRemaining(loan.due_date);
              return (
                <div key={loan.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h4 className="font-semibold text-gray-900">{loan.bank_name}</h4>
                      <p className="text-sm text-gray-600">
                        {loan.loan_purpose && `Purpose: ${loan.loan_purpose}`}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(loan.status)}`}>
                        {getStatusIcon(loan.status)}
                        <span className="ml-1">{loan.status}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <p className="text-gray-600">Loan Amount</p>
                      <p className="font-semibold text-lg">₹{loan.amount.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Issue Date</p>
                      <p className="font-medium">{new Date(loan.issue_date).toLocaleDateString()}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Due Date</p>
                      <p className="font-medium">{new Date(loan.due_date).toLocaleDateString()}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">
                        {loan.status === 'Active' ? 'Days Remaining' : 'Status'}
                      </p>
                      <p className={`font-medium ${
                        loan.status === 'Active' 
                          ? daysRemaining < 30 
                            ? 'text-red-600' 
                            : daysRemaining < 60 
                              ? 'text-yellow-600' 
                              : 'text-green-600'
                          : 'text-gray-900'
                      }`}>
                        {loan.status === 'Active' ? `${daysRemaining} days` : loan.status}
                      </p>
                    </div>
                  </div>

                  {loan.status === 'Active' && daysRemaining < 30 && (
                    <div className="mt-3 bg-red-50 p-3 rounded-lg">
                      <div className="flex items-center">
                        <AlertCircle className="h-4 w-4 text-red-600 mr-2" />
                        <p className="text-sm text-red-800">
                          Payment due soon! Please ensure timely repayment to maintain your credit score.
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-8">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No loans yet. Apply for your first loan to get started!</p>
          </div>
        )}
      </div>

      {/* AI Recommendations */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">AI Recommendations</h3>
        <div className="space-y-3">
          {loans.filter(loan => loan.status === 'Active').length > 0 && (
            <div className="flex items-start space-x-3 p-3 bg-blue-50 rounded-lg">
              <CheckCircle className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium text-blue-800">Maintain Payment Schedule</p>
                <p className="text-sm text-blue-700">
                  You have {loans.filter(loan => loan.status === 'Active').length} active loan(s). 
                  Timely payments will improve your credit score for future applications.
                </p>
              </div>
            </div>
          )}
          
          {loans.filter(loan => loan.status === 'Completed').length > 0 && (
            <div className="flex items-start space-x-3 p-3 bg-green-50 rounded-lg">
              <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium text-green-800">Excellent Repayment History</p>
                <p className="text-sm text-green-700">
                  You've successfully completed {loans.filter(loan => loan.status === 'Completed').length} loan(s). 
                  This positive history makes you eligible for higher loan amounts.
                </p>
              </div>
            </div>
          )}
          
          {recommendedBanks.length > 2 && (
            <div className="flex items-start space-x-3 p-3 bg-purple-50 rounded-lg">
              <TrendingUp className="h-5 w-5 text-purple-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium text-purple-800">Multiple Options Available</p>
                <p className="text-sm text-purple-700">
                  Your good credit score qualifies you for {recommendedBanks.length} different banks. 
                  Compare interest rates to find the best deal.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Loans;
import React, { useState } from 'react';
import { DollarSign, Calendar, FileText, CheckCircle, AlertCircle, Clock } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface Bank {
  id: string;
  name: string;
  logo_url: string;
  min_credit_score: number;
  max_loan_amount: number;
  interest_rate: number;
  processing_fee: number;
  risk_levels: string[];
}

interface LoanApplicationProps {
  banks: Bank[];
  creditScore: number;
  riskLevel: string;
  onApplicationSubmit: () => void;
}

const LoanApplication: React.FC<LoanApplicationProps> = ({ 
  banks, 
  creditScore, 
  riskLevel, 
  onApplicationSubmit 
}) => {
  const [selectedBank, setSelectedBank] = useState<Bank | null>(null);
  const [loanAmount, setLoanAmount] = useState('');
  const [loanPurpose, setLoanPurpose] = useState('');
  const [loading, setLoading] = useState(false);
  const [applicationStatus, setApplicationStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const handleBankSelect = (bank: Bank) => {
    setSelectedBank(bank);
    setLoanAmount('');
  };

  const calculateEMI = (principal: number, rate: number, tenure: number) => {
    const monthlyRate = rate / (12 * 100);
    const emi = (principal * monthlyRate * Math.pow(1 + monthlyRate, tenure)) / 
                (Math.pow(1 + monthlyRate, tenure) - 1);
    return Math.round(emi);
  };

  const handleSubmitApplication = async () => {
    if (!selectedBank || !loanAmount || !loanPurpose) return;

    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        const issueDate = new Date();
        const dueDate = new Date();
        dueDate.setMonth(dueDate.getMonth() + 6); // 6 months loan term

        const { error } = await supabase
          .from('loans')
          .insert([
            {
              user_id: user.id,
              bank_name: selectedBank.name,
              amount: parseFloat(loanAmount),
              issue_date: issueDate.toISOString().split('T')[0],
              due_date: dueDate.toISOString().split('T')[0],
              status: 'Active',
              loan_purpose: loanPurpose,
            },
          ]);

        if (error) {
          console.error('Error submitting loan application:', error);
          setApplicationStatus('error');
        } else {
          setApplicationStatus('success');
          onApplicationSubmit();
        }
      }
    } catch (error) {
      console.error('Error submitting application:', error);
      setApplicationStatus('error');
    } finally {
      setLoading(false);
    }
  };

  if (applicationStatus === 'success') {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="text-center">
          <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            Application Submitted Successfully!
          </h3>
          <p className="text-gray-600 mb-4">
            Your loan application for ₹{parseFloat(loanAmount).toLocaleString()} has been submitted to {selectedBank?.name}.
          </p>
          <div className="bg-green-50 p-4 rounded-lg mb-4">
            <p className="text-sm text-green-800">
              <strong>Next Steps:</strong>
            </p>
            <ul className="text-sm text-green-700 mt-2 space-y-1">
              <li>• Bank will review your application within 2-3 business days</li>
              <li>• You'll receive an SMS/email with the decision</li>
              <li>• If approved, funds will be disbursed within 24 hours</li>
            </ul>
          </div>
          <button
            onClick={() => {
              setApplicationStatus('idle');
              setSelectedBank(null);
              setLoanAmount('');
              setLoanPurpose('');
            }}
            className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors"
          >
            Apply for Another Loan
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Bank Selection */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Select a Bank</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {banks.map((bank) => (
            <div
              key={bank.id}
              onClick={() => handleBankSelect(bank)}
              className={`border-2 rounded-lg p-4 cursor-pointer transition-all hover:shadow-md ${
                selectedBank?.id === bank.id
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-medium text-gray-900">{bank.name}</h4>
                <img 
                  src={bank.logo_url} 
                  alt={bank.name}
                  className="h-8 w-8 rounded"
                />
              </div>
              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex justify-between">
                  <span>Max Loan:</span>
                  <span className="font-medium">₹{bank.max_loan_amount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Interest Rate:</span>
                  <span className="font-medium">{bank.interest_rate}% p.a.</span>
                </div>
                <div className="flex justify-between">
                  <span>Processing Fee:</span>
                  <span className="font-medium">{bank.processing_fee}%</span>
                </div>
              </div>
              {selectedBank?.id === bank.id && (
                <div className="mt-3 flex items-center text-blue-600">
                  <CheckCircle className="h-4 w-4 mr-1" />
                  <span className="text-sm font-medium">Selected</span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Loan Details Form */}
      {selectedBank && (
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Loan Application Details</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Loan Amount (₹)
              </label>
              <input
                type="number"
                value={loanAmount}
                onChange={(e) => setLoanAmount(e.target.value)}
                max={selectedBank.max_loan_amount}
                min="1000"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder={`Max: ₹${selectedBank.max_loan_amount.toLocaleString()}`}
              />
              {loanAmount && parseFloat(loanAmount) > selectedBank.max_loan_amount && (
                <p className="text-red-600 text-sm mt-1">
                  Amount exceeds maximum limit of ₹{selectedBank.max_loan_amount.toLocaleString()}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Loan Purpose
              </label>
              <select
                value={loanPurpose}
                onChange={(e) => setLoanPurpose(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select purpose</option>
                <option value="Business Expansion">Business Expansion</option>
                <option value="Equipment Purchase">Equipment Purchase</option>
                <option value="Working Capital">Working Capital</option>
                <option value="Agriculture">Agriculture</option>
                <option value="Education">Education</option>
                <option value="Medical Emergency">Medical Emergency</option>
                <option value="Home Improvement">Home Improvement</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>

          {/* Loan Summary */}
          {loanAmount && parseFloat(loanAmount) > 0 && parseFloat(loanAmount) <= selectedBank.max_loan_amount && (
            <div className="mt-6 bg-gray-50 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 mb-3">Loan Summary</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <p className="text-gray-600">Principal Amount</p>
                  <p className="font-semibold">₹{parseFloat(loanAmount).toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-gray-600">Interest Rate</p>
                  <p className="font-semibold">{selectedBank.interest_rate}% p.a.</p>
                </div>
                <div>
                  <p className="text-gray-600">Processing Fee</p>
                  <p className="font-semibold">₹{Math.round(parseFloat(loanAmount) * selectedBank.processing_fee / 100).toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-gray-600">Monthly EMI</p>
                  <p className="font-semibold">₹{calculateEMI(parseFloat(loanAmount), selectedBank.interest_rate, 6).toLocaleString()}</p>
                </div>
              </div>
            </div>
          )}

          {/* Submit Button */}
          <div className="mt-6">
            <button
              onClick={handleSubmitApplication}
              disabled={!loanAmount || !loanPurpose || loading || parseFloat(loanAmount) > selectedBank.max_loan_amount}
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Submitting Application...
                </>
              ) : (
                <>
                  <FileText className="h-4 w-4 mr-2" />
                  Submit Loan Application
                </>
              )}
            </button>
          </div>

          {applicationStatus === 'error' && (
            <div className="mt-4 bg-red-50 p-4 rounded-lg">
              <div className="flex items-center">
                <AlertCircle className="h-5 w-5 text-red-600 mr-2" />
                <p className="text-red-800">
                  There was an error submitting your application. Please try again.
                </p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default LoanApplication;
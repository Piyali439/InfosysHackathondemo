import React from 'react';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';

interface CreditScoreChartProps {
  assessmentData: {
    electricity_bill: number;
    gas_bill: number;
    water_bill: number;
    monthly_data_recharge: number;
    yearly_data_recharge: number;
    payment_delay: number;
    area_type: string;
    location_stability: string;
  };
  creditScore: number;
  riskLevel: string;
}

const CreditScoreChart: React.FC<CreditScoreChartProps> = ({ assessmentData, creditScore, riskLevel }) => {
  // Calculate component scores
  const billConsistency = Math.min(100, Math.max(0, 100 - (assessmentData.electricity_bill + assessmentData.gas_bill + assessmentData.water_bill) / 100));
  const dataUsageScore = Math.min(100, (assessmentData.yearly_data_recharge / (assessmentData.monthly_data_recharge * 12)) * 100);
  const paymentScore = Math.max(0, 100 - (assessmentData.payment_delay * 10));
  const stabilityScore = assessmentData.location_stability === 'Stable' ? 90 : assessmentData.location_stability === 'Temporary' ? 60 : 30;
  const areaScore = assessmentData.area_type === 'Urban' ? 70 : 60;

  const componentData = [
    { name: 'Bill Consistency', value: billConsistency, weight: 30, color: '#3B82F6' },
    { name: 'Data Usage Pattern', value: dataUsageScore, weight: 25, color: '#10B981' },
    { name: 'Payment History', value: paymentScore, weight: 35, color: '#F59E0B' },
    { name: 'Location Stability', value: stabilityScore, weight: 10, color: '#8B5CF6' },
  ];

  const scoreBreakdown = [
    { category: 'Bills', score: Math.round(billConsistency), maxScore: 100 },
    { category: 'Data Usage', score: Math.round(dataUsageScore), maxScore: 100 },
    { category: 'Payment', score: Math.round(paymentScore), maxScore: 100 },
    { category: 'Stability', score: Math.round(stabilityScore), maxScore: 100 },
  ];

  const creditScoreHistory = [
    { month: 'Jan', score: creditScore - 45 },
    { month: 'Feb', score: creditScore - 30 },
    { month: 'Mar', score: creditScore - 20 },
    { month: 'Apr', score: creditScore - 15 },
    { month: 'May', score: creditScore - 8 },
    { month: 'Jun', score: creditScore },
  ];

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'Low Risk': return '#10B981';
      case 'Moderate Risk': return '#F59E0B';
      case 'High Risk': return '#EF4444';
      default: return '#6B7280';
    }
  };

  return (
    <div className="space-y-6">
      {/* Credit Score Gauge */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Credit Score Breakdown</h3>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={componentData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="weight"
                >
                  {componentData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value, name) => [`${value}%`, name]} />
              </PieChart>
            </ResponsiveContainer>
            <div className="text-center mt-2">
              <div className="text-3xl font-bold" style={{ color: getRiskColor(riskLevel) }}>
                {creditScore}
              </div>
              <div className="text-sm text-gray-600">Your Trust Score</div>
            </div>
          </div>
          
          <div className="space-y-3">
            {componentData.map((component, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div 
                    className="w-4 h-4 rounded-full" 
                    style={{ backgroundColor: component.color }}
                  ></div>
                  <span className="text-sm font-medium text-gray-700">{component.name}</span>
                </div>
                <div className="text-right">
                  <div className="text-sm font-semibold text-gray-900">{component.weight}%</div>
                  <div className="text-xs text-gray-500">Weight</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Score Components Bar Chart */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Component Scores</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={scoreBreakdown}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="category" />
            <YAxis domain={[0, 100]} />
            <Tooltip />
            <Bar dataKey="score" fill="#3B82F6" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Credit Score Trend */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Credit Score Trend</h3>
        <ResponsiveContainer width="100%" height={250}>
          <LineChart data={creditScoreHistory}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis domain={[300, 850]} />
            <Tooltip />
            <Line 
              type="monotone" 
              dataKey="score" 
              stroke="#10B981" 
              strokeWidth={3}
              dot={{ fill: '#10B981', strokeWidth: 2, r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Improvement Suggestions */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">AI Recommendations for Score Improvement</h3>
        <div className="space-y-3">
          {paymentScore < 80 && (
            <div className="flex items-start space-x-3 p-3 bg-red-50 rounded-lg">
              <div className="w-2 h-2 bg-red-500 rounded-full mt-2"></div>
              <div>
                <p className="font-medium text-red-800">Reduce Payment Delays</p>
                <p className="text-sm text-red-700">
                  Your payment delays are affecting your score. Try to pay bills within the due date to improve by ~{Math.min(50, assessmentData.payment_delay * 10)} points.
                </p>
              </div>
            </div>
          )}
          
          {billConsistency < 70 && (
            <div className="flex items-start space-x-3 p-3 bg-yellow-50 rounded-lg">
              <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2"></div>
              <div>
                <p className="font-medium text-yellow-800">Optimize Utility Expenses</p>
                <p className="text-sm text-yellow-700">
                  Consider reducing utility bills through energy-saving measures. This could improve your score by ~20-30 points.
                </p>
              </div>
            </div>
          )}
          
          {dataUsageScore < 80 && (
            <div className="flex items-start space-x-3 p-3 bg-blue-50 rounded-lg">
              <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
              <div>
                <p className="font-medium text-blue-800">Maintain Consistent Data Usage</p>
                <p className="text-sm text-blue-700">
                  Keep your monthly data recharge consistent throughout the year for better predictability.
                </p>
              </div>
            </div>
          )}
          
          {stabilityScore < 70 && (
            <div className="flex items-start space-x-3 p-3 bg-purple-50 rounded-lg">
              <div className="w-2 h-2 bg-purple-500 rounded-full mt-2"></div>
              <div>
                <p className="font-medium text-purple-800">Improve Location Stability</p>
                <p className="text-sm text-purple-700">
                  Staying in one location for longer periods can improve your stability score by ~20-40 points.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CreditScoreChart;
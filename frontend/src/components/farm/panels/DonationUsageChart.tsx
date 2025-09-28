"use client";

import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import { Card, CardContent } from "@/components/ui/card";

// 기부금 사용 내역 차트 데이터 타입
export interface DonationUsageItem {
  category: string;
  count: number;
  amount: number;
  percentage: number;
  color: string;
}

interface DonationUsageChartProps {
  data: DonationUsageItem[];
  totalAmount: number;
  title: string;
  isLoading?: boolean;
  loadingMessage?: string;
}


export default function DonationUsageChart({ data, totalAmount, title, isLoading = false, loadingMessage = "데이터를 불러오는 중..." }: DonationUsageChartProps) {
  // 로딩 중일 때
  if (isLoading) {
    return (
      <Card>
        <CardContent className="px-4">
          <h3 className="text-lg font-semibold mb-4">{title}</h3>
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 mx-auto mb-4" style={{ borderBottomColor: '#4D3A2C' }}></div>
            <p className="text-gray-600">{loadingMessage}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // 데이터가 없을 때
  if (!data || data.length === 0) {
    return (
      <Card>
        <CardContent className="px-4">
          <h3 className="text-lg font-semibold mb-4">{title}</h3>
          <div className="text-center py-8">
            <p className="text-gray-500">사용 내역이 없습니다.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="py-0">
        <h3 className="text-lg font-semibold mb-4">{title}</h3>
        
        <div className="flex flex-col lg:flex-row gap-6">
          {/* 원형 그래프 */}
          <div className="flex-shrink-0 w-full lg:w-64">
            
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data as any} // eslint-disable-line @typescript-eslint/no-explicit-any
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={80}
                    paddingAngle={2}
                    dataKey="amount"
                  >
                    {data.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value: number) => [`${value.toLocaleString()}원`, '사용금액']}
                    labelFormatter={(label) => `카테고리: ${label}`}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* 테이블 */}
          <div className="flex-1">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2 px-3 font-medium text-gray-700 text-sm">항목</th>
                    <th className="text-center py-2 px-3 font-medium text-gray-700 text-sm">건수</th>
                    <th className="text-right py-2 px-3 font-medium text-gray-700 text-sm">사용금액(원)</th>
                    <th className="text-right py-2 px-3 font-medium text-gray-700 text-sm">비율</th>
                  </tr>
                </thead>
                <tbody>
                  {data.map((item, index) => (
                    <tr key={index} className="border-b hover:bg-gray-50">
                      <td className="py-2 px-3">
                        <div className="flex items-center gap-2">
                          <div 
                            className="w-3 h-3 rounded-full flex-shrink-0" 
                            style={{ backgroundColor: item.color }}
                          />
                          <span className="font-medium text-gray-900 text-sm">{item.category}</span>
                        </div>
                      </td>
                      <td className="text-center py-2 px-3 text-gray-600 text-sm">
                        {item.count}건
                      </td>
                      <td className="text-right py-2 px-3 font-medium text-gray-900 text-sm">
                        {item.amount.toLocaleString()}
                      </td>
                      <td className="text-right py-2 px-3 font-medium text-gray-900 text-sm">
                        {item.percentage.toFixed(1)}%
                      </td>
                    </tr>
                  ))}
                  {/* 합계 행 */}
                  <tr className="border-t-2 border-gray-300 bg-gray-50">
                    <td className="py-2 px-3 font-semibold text-gray-900 text-sm">합계</td>
                    <td className="text-center py-2 px-3 font-semibold text-gray-900 text-sm">
                      {data.reduce((sum, item) => sum + item.count, 0)}건
                    </td>
                    <td className="text-right py-2 px-3 font-semibold text-gray-900 text-sm">
                      {totalAmount.toLocaleString()}
                    </td>
                    <td className="text-right py-2 px-3 font-semibold text-gray-900 text-sm">
                      100.0%
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// 월별 막대 그래프 컴포넌트
interface MonthlyBarChartProps {
  data: Array<{
    month: number;
    amount: number;
    year: number;
  }>;
  title: string;
}

export function MonthlyBarChart({ data, title }: MonthlyBarChartProps) {
  // 데이터가 없거나 모든 금액이 0인 경우 확인
  const hasData = data && data.length > 0 && data.some(item => item.amount > 0);
  
  if (!hasData) {
    return (
      <Card>
        <CardContent className="p-4 py-0">
          <h3 className="text-lg font-semibold mb-4">{title}</h3>
          <div className="text-center py-8">
            <p className="text-gray-500">해당 연도의 기부금 내역이 없습니다.</p>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  const chartData = data.map(item => ({
    month: `${item.month}월`,
    amount: item.amount,
    year: item.year
  }));

  return (
    <Card>
      <CardContent className="p-4 py-0">
        <h3 className="text-lg font-semibold mb-4">{title}</h3>
        
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 15, right: 20, left: 15, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="month" 
                tick={{ fontSize: 12 }}
                axisLine={{ stroke: '#e5e7eb' }}
                tickLine={{ stroke: '#e5e7eb' }}
              />
              <YAxis 
                tick={{ fontSize: 12 }}
                axisLine={{ stroke: '#e5e7eb' }}
                tickLine={{ stroke: '#e5e7eb' }}
                tickFormatter={(value) => `${(value / 100).toFixed(0)}K`}
              />
              <Tooltip 
                formatter={(value: number) => [`${value.toLocaleString()}원`, '사용금액']}
                labelFormatter={(label) => `월: ${label}`}
                contentStyle={{
                  backgroundColor: '#fff',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                }}
              />
              <Bar 
                dataKey="amount" 
                fill="#3B82F6" 
                radius={[4, 4, 0, 0]}
                className="hover:opacity-80 transition-opacity"
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}

'use client';

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  TooltipProps,
} from 'recharts';

interface EloHistoryGraphProps {
  eloHistory: any[];
}

export function EloHistoryGraph({ eloHistory }: EloHistoryGraphProps) {
  // 데이터 변환
  const chartData = eloHistory
    .map((rating) => ({
      date: new Date(rating.created_at).toLocaleDateString('ko-KR', {
        month: 'short',
        day: 'numeric',
      }),
      elo: rating.elo_rating,
      change: rating.rating_change,
      won: rating.won,
      fullDate: new Date(rating.created_at).toLocaleDateString('ko-KR'),
    }))
    .reverse(); // 오래된 것부터 최신 순으로

  // 데이터가 없는 경우
  if (chartData.length === 0) {
    return (
      <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
        <h3 className="text-lg font-bold text-white mb-4">ELO 변화</h3>
        <div className="text-center py-12 text-gray-500">
          ELO 기록이 없습니다
        </div>
      </div>
    );
  }

  // 커스텀 툴팁
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-slate-900 border border-slate-700 rounded-lg p-3 shadow-lg">
          <p className="text-xs text-gray-400 mb-1">{data.fullDate}</p>
          <p className="text-sm font-bold text-white mb-1">
            {data.elo} LP
          </p>
          <p
            className={`text-sm font-semibold ${
              data.change >= 0 ? 'text-green-500' : 'text-red-500'
            }`}
          >
            {data.change >= 0 ? '+' : ''}
            {data.change} LP ({data.won ? '승' : '패'})
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
      <h3 className="text-lg font-bold text-white mb-4">ELO 변화</h3>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
          <XAxis
            dataKey="date"
            stroke="#9CA3AF"
            fontSize={12}
            tick={{ fill: '#9CA3AF' }}
          />
          <YAxis
            stroke="#9CA3AF"
            fontSize={12}
            tick={{ fill: '#9CA3AF' }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Line
            type="monotone"
            dataKey="elo"
            stroke="#3B82F6"
            strokeWidth={2}
            dot={{ fill: '#3B82F6', r: 3 }}
            activeDot={{ r: 5 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
